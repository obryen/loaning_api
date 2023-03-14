import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanController } from './loan.controller';

import { LoanProduct } from './models/loan-products.entity';
import { UserWallet } from './models/users-wallets.entity';
import { UserLoan } from './models/users-loans.entity';
import { LoanService } from './loan.service';
import { LoanPayment } from './models/loan-payments.entity';
import { NotificationService } from './notification.service';
import { User } from '../user/users.entity';
import { CompanyFloat } from './models/company-float.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLoan, LoanProduct, UserWallet, LoanPayment, CompanyFloat]),
  ],
  controllers: [LoanController],
  providers: [LoanService, NotificationService],
  exports: [TypeOrmModule]
})
export class LoanModule { }
