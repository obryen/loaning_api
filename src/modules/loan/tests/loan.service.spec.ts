import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { LoanService } from '../loan.service';
import { User } from '../../user/users.entity';
import { LoanProduct } from '../models/loan-products.entity';
import { UserLoan } from '../models/users-loans.entity';
import { UserWallet } from '../models/users-wallets.entity';

describe('LoanService', () => {
  let service: LoanService;
  let userRepo;
  let loanProductRepo;
  let userWalletRepo;
  let userLoanRepo;
  let notificationService;
  let dataSource;

  const mockUser = { id: '1', maxLoanLimit: 1000 };
  const mockLoanProduct = { id: '1', limit: 500 };
  const mockUserWallet = { userId: '1', currentBalance: 2000 };
  const mockUserLoan = { id: '1', userId: '1', isActive: false, loanProductId: '1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        NotificationService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: getRepositoryToken(LoanProduct),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockLoanProduct),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockReturnValue(true),
            })),
          },
        },
        {
          provide: getRepositoryToken(UserWallet),
          useValue: {
            find: jest.fn().mockResolvedValue([mockUserWallet]),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserLoan),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUserLoan),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((callback) => {
              return callback({
                findOne: jest.fn().mockResolvedValue(mockLoanProduct),
                find: jest.fn().mockResolvedValue([mockUserWallet]),
                save: jest.fn(),
              });
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
    userRepo = module.get(getRepositoryToken(User));
    loanProductRepo = module.get(getRepositoryToken(LoanProduct));
    userWalletRepo = module.get(getRepositoryToken(UserWallet));
    userLoanRepo = module.get(getRepositoryToken(UserLoan));
    notificationService = module.get(NotificationService);
    dataSource = module.get(DataSource);
  });

  describe('acceptOrDeclineLoanOffer', () => {
    it('should return unsuccessful if user declines offer', async () => {
      const acceptLoanOfferReqDto = {
        userId: '1',
        loanProductId: '1',
        accept: false,
      };
      const response = await service.acceptOrDeclineLoanOffer(
        acceptLoanOfferReqDto,
      );
      expect(response.success).toBeFalsy();
      expect(response.walletBalance).toBeNull();
    });

    it('should throw a not found exception if user does not exist', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      const acceptLoanOfferReqDto = {
        userId: '2',
        loanProductId: '1',
        accept: true,
      };
      await expect(
        service.acceptOrDeclineLoanOffer(acceptLoanOfferReqDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an unprocessable entity exception if user wallet does not exist', async () => {
      jest.spyOn(userWalletRepo, 'find').mockResolvedValue([]);
      const acceptLoanOfferReqDto = {
        userId: '1',
        loanProductId: '1',
        accept: true,
      };
      await expect(
        service.acceptOrDeclineLoanOffer(acceptLoanOfferReqDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw an unprocessable entity exception if user has an active loan', async () => {
      jest.spyOn(userLoanRepo, 'findOne').mockResolvedValue(mockUserLoan);
      const acceptLoanOfferReqDto = {
        userId: '1',
        loanProductId: '1',
        accept: true,
      };
      await expect(
        service.acceptOrDeclineLoanOffer(acceptLoanOfferReqDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should return successful with updated wallet balance if user accepts offer', async () => {
      jest.spyOn(notificationService, 'sendNotification').mockResolvedValue(true);
      const acceptLoanOfferReqDto = {
        userId: '1',
        loanProductId: '1',
        accept: true,
      };
      const response = await service.acceptOrDeclineLoanOffer(
        acceptLoanOfferReqDto,
      );
      expect(response.success).toBeTruthy();
      expect(response.walletBalance).toBe(1500);
    });
  });
})
