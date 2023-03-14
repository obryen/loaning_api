import { Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as util from 'util';
import { User } from '../user/users.entity';
import { AcceptLoanOfferReqDto, AcceptLoanOfferResDto, ActiveLoanReqDto, ActiveLoanResDto, PayLoanReqDto, PayLoanResDto } from './dto/loan.dto';
import { CompanyFloat, TransactionType } from './models/company-float.entity';
import { LoanProduct } from './models/loan-products.entity';
import { UserLoan } from './models/users-loans.entity';
import { UserTransactionType, UserWallet } from './models/users-wallets.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(LoanProduct)
    private loanProductRepo: Repository<LoanProduct>,
    @InjectRepository(UserWallet)
    private userWalletRepo: Repository<UserWallet>,
    @InjectRepository(UserLoan)
    private userLoanRepo: Repository<UserLoan>,
    private notifyService: NotificationService,
    private dataSource: DataSource,
  ) { }

  async fetchLoanProducts(userId: string): Promise<LoanProduct[]> {
    const user = await this.usersRepo.findOne({
      where: {
        id: userId
      }
    });
    console.log("🚀 ~ file: loan.service.ts:34 ~ LoanService ~ fetchLoanProducts ~ user:", user)
    if (!user) {
      throw new NotFoundException('This user does not exist')
    }
    const qualifiedLoanProducts = await this.loanProductRepo.createQueryBuilder('lp')
      .where('lp.limit <= :value', { value: user.maxLoanLimit })
      .getMany();
    return qualifiedLoanProducts ? qualifiedLoanProducts : [];
  }

  async checkIfUserHasExistingLoan(userId: string): Promise<UserLoan> {
    const existingUnpaidLoan = await this.userLoanRepo.findOne({
      where: {
        userId,
        fullyPaid: false
      },
    });

    console.log('existing loans', util.inspect(existingUnpaidLoan))
    return existingUnpaidLoan
  }

  async checkIfUserQualifiesForLoan(userId: string, loanId: string): Promise<boolean> {
    const user = await this.usersRepo.findOne({
      where: {
        id: userId
      }
    });
    if (!user) {
      throw new NotFoundException('This user does not exist')
    }
    const qualifiedLoanProducts = await this.loanProductRepo.createQueryBuilder('l')
      .where('l.limit <= :value', { value: user.maxLoanLimit })
      .andWhere('l.id = :loan_id', { loan_id: loanId })
      .getRawOne();
    return qualifiedLoanProducts ?? qualifiedLoanProducts;
  }

  async getUserWalletLatestBalance(userId: string): Promise<number> {
    const lastUserWalletBalance = await this.userWalletRepo.find({
      where: {
        userId
      },
      order: {
        updatedAt: 'DESC'
      }
    });

    return lastUserWalletBalance[0].currentBalance;
  }


  calculateLoanWithInterest(loanedAmount: number, interestRate: number) {
    return loanedAmount * (100 + interestRate) / 100
  }

  addDaysToCurrentDate(tenureInDays: number): Date {

    const today = new Date();
    const futureDate = new Date(today.getTime() + (tenureInDays * 24 * 60 * 60 * 1000));
    return futureDate;
  }


  async getUserCurrentActiveLoan(activeLoanPayload: ActiveLoanReqDto): Promise<ActiveLoanResDto> {
    const activeLoan = await this.userLoanRepo.findOne({
      where: {
        userId: activeLoanPayload.userId,
        isActive: true
      },
      relations: { user: true, loanPayments: true }
    });


    if (!activeLoan) {
      return {
        id: null,
        activeLoan: false,
        dueDate: null,
        amountRemaining: 0,
        userName: null
      }
    }

    const paidLoans = activeLoan.loanPayments ? activeLoan.loanPayments.reduce((accumulator, current) => {
      return accumulator + current.amount;
    }, 0) : 0;


    return {
      id: activeLoan.id,
      activeLoan: true,
      dueDate: activeLoan.dueDate,
      amountRemaining: (activeLoan.loanWithInterest - paidLoans),
      userName: activeLoan.user.name
    }
  }

  async acceptOrDeclineLoanOffer(acceptOfferRequest: AcceptLoanOfferReqDto): Promise<AcceptLoanOfferResDto> {
    if (!acceptOfferRequest.accept) {
      this.notifyService.sendDeclineNotification();
      return { success: false, walletBalance: null }
    }

    // check for existing loan
    const activeLoan = await this.getUserCurrentActiveLoan({ userId: acceptOfferRequest.userId });

    if (activeLoan.activeLoan) {
      throw new UnprocessableEntityException('You cannot borrow if you have an exisiting unpaid loan')
    }

    const user = await this.usersRepo.findOne({ where: { id: acceptOfferRequest.userId } });
    if (!user) {
      throw new NotFoundException('This user does not exist')
    }

    const qualifies = await this.checkIfUserQualifiesForLoan(user.id, acceptOfferRequest.loanProductId);

    if (!qualifies) {
      this.notifyService.sendFailedToQualifyNotification()
      throw new NotFoundException('You do not qualify for this loan')
    }
    let newUserWalletBalance;

    // run everything through transaction to fix possible concurrency issue
    // atomic transaction
    await this.dataSource.transaction(async (transactionalManager) => {
      // get loanSelected 
      const loanProductSelected = await transactionalManager.findOne(
        LoanProduct,
        {
          where: {
            id: acceptOfferRequest.loanProductId
          },
        });
      // get last wallet amount
      const lastUserWalletBalanceRecord = await transactionalManager.find(
        UserWallet,
        {
          where: {
            userId: acceptOfferRequest.userId
          },
          order: {
            updatedAt: 'DESC'
          }
        });
      const lastCompanyWalletBalance = await transactionalManager.find(
        CompanyFloat,
        {
          order: {
            updatedAt: 'DESC'
          }
        });
      // if user records are empty use 0 
      const lastUserBalance = lastUserWalletBalanceRecord[0] ? lastUserWalletBalanceRecord[0].currentBalance : 0;

      console.log('last company bal', util.inspect(lastCompanyWalletBalance[0]));
      console.log('last user bal', util.inspect(lastUserBalance));
      if (lastCompanyWalletBalance[0]?.currentBalance < loanProductSelected.limit) {
        throw new UnprocessableEntityException("We cannot offer this loan at this time because our float is low");
      }
      const newCompanyFloatBalance = (Number(lastCompanyWalletBalance[0].currentBalance) - Number(loanProductSelected.limit));
      newUserWalletBalance = (Number(lastUserBalance) + Number(loanProductSelected.limit));

      // create new loan record

      await transactionalManager.save(UserLoan, {
        accepted: true,
        dueDate: this.addDaysToCurrentDate(Number(loanProductSelected.tenure)),
        loanProductId: loanProductSelected.id,
        userId: acceptOfferRequest.userId,
        fullyPaid: false,
        loanedAmount: loanProductSelected.limit,
        loanWithInterest: this.calculateLoanWithInterest(loanProductSelected.limit, loanProductSelected.interest)
      }, {});
      // update userWallet balance
      const savedRecord = await transactionalManager.save(UserWallet, {
        currentBalance: newUserWalletBalance,
        userId: acceptOfferRequest.userId,
        tansactionType: UserTransactionType.CR
      }, {});
      // update company float
      await transactionalManager.save(CompanyFloat, {
        currentBalance: newCompanyFloatBalance,
        tansactionType: TransactionType.DR,
        transactionId: savedRecord.id
      }, {});
    })

    this.notifyService.sendLoanDisbursementNotification(user.name);
    return {
      walletBalance: newUserWalletBalance,
      success: true
    }

  }



  async payLoan(payLoanRequest: PayLoanReqDto): Promise<PayLoanResDto> {
    const activeLoan = await this.getUserCurrentActiveLoan({ userId: payLoanRequest.userId });

    // check if this clears the loan
    if (!activeLoan.activeLoan) {
      this.notifyService.sendLoanPaymentNotification(activeLoan.userName, 0);
      return { success: true, remainingAmount: 0 };
    }
    const loanBalance = Number(activeLoan.amountRemaining) - Number(payLoanRequest.amount);
    // make update to db
    // run everything through transaction to fix possible concurrency issue
    // atomic transaction
    await this.dataSource.transaction(async (transactionalManager) => {

      // get last wallet amount
      const lastUserWalletBalance = await transactionalManager.find(
        UserWallet,
        {
          where: {
            userId: payLoanRequest.userId
          },
          order: {
            updatedAt: 'DESC'
          }
        });
      const lastCompanyWalletBalance = await transactionalManager.find(
        CompanyFloat,
        {
          order: {
            updatedAt: 'DESC'
          }
        });


      const newCompanyFloatBalance = (Number(lastCompanyWalletBalance[0].currentBalance) + Number(payLoanRequest.amount));
      const newUserWalletBalance = (Number(lastUserWalletBalance[0].currentBalance) - Number(payLoanRequest.amount));

      // create new user wallet balance reccord
      const savedRecord = await transactionalManager.save(UserWallet, {
        currentBalance: newUserWalletBalance,
        userId: payLoanRequest.userId,
        tansactionType: UserTransactionType.DR,
      }, {});
      // create new company wallet balance reccord
      await transactionalManager.save(CompanyFloat, {
        currentBalance: newCompanyFloatBalance,
        tansactionType: TransactionType.CR,
        transactionId: savedRecord.id
      }, {});
      // update loan status
      await transactionalManager.save(UserLoan, {
        id: activeLoan.id,
        fullyPaid: activeLoan.activeLoan,
        pendingBalance: loanBalance
      }, {});
    })
    // notify the user
    this.notifyService.sendLoanPaymentNotification(activeLoan.userName, loanBalance)
    return { success: true, remainingAmount: loanBalance };
  }

}
