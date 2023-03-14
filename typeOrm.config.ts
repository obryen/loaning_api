
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { CompanyFloat } from './src/modules/loan/models/company-float.entity';
import { LoanPayment } from './src/modules/loan/models/loan-payments.entity';
import { LoanProduct } from './src/modules/loan/models/loan-products.entity';
import { UserLoan } from './src/modules/loan/models/users-loans.entity';
import { UserWallet } from './src/modules/loan/models/users-wallets.entity';
import { User } from './src/modules/user/users.entity';
import { DatabaseSeed1678700240483 } from './src/migrations/1678700240483-DatabaseSeed';
 
config();

 
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    CompanyFloat,
    LoanPayment,
    LoanProduct,
    UserLoan,
    UserWallet,
    User
  ],
  migrations: [DatabaseSeed1678700240483]
})