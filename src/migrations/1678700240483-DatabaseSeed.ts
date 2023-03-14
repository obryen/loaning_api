import { MigrationInterface, QueryRunner } from "typeorm"

export class DatabaseSeed1678700240483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      // schema setup 

      await queryRunner.query(`CREATE TYPE "public"."company_float_transaction_type_enum" AS ENUM('WALLET_DEBIT', 'CREDIT')`);
        await queryRunner.query(`CREATE TABLE "company_float" ("is_active" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "current_balance" numeric NOT NULL, "transaction_id" character varying NOT NULL, "transaction_type" "public"."company_float_transaction_type_enum" NOT NULL, CONSTRAINT "PK_d1bc5391143cc6776a4e57a4595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_wallets_transaction_type_enum" AS ENUM('DEBIT', 'CREDIT')`);
        await queryRunner.query(`CREATE TABLE "user_wallets" ("is_active" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "current_balance" numeric NOT NULL, "transaction_type" "public"."user_wallets_transaction_type_enum" NOT NULL, CONSTRAINT "PK_f98089275dcfc65d59b1d347167" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("is_active" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "max_loan_limit" numeric NOT NULL DEFAULT '5000', "userWalletsId" uuid, "userLoansId" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."loan_products_tenure_type_enum" AS ENUM('DAY', 'MONTH', 'YEAR')`);
        await queryRunner.query(`CREATE TABLE "loan_products" ("is_active" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_limit" numeric NOT NULL, "interest" double precision NOT NULL, "tenure" numeric NOT NULL, "tenure_type" "public"."loan_products_tenure_type_enum" NOT NULL, "userLoansId" uuid, CONSTRAINT "PK_3524994d77fb59b9a76e589e7ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_loans" ("is_active" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "loan_product_id" uuid NOT NULL, "accepted" boolean NOT NULL, "fully_paid" boolean NOT NULL, "loaned_amount" numeric NOT NULL, "loaned_with_interest" numeric NOT NULL, "pending_balance" numeric, "due_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "loanPaymentsId" uuid, CONSTRAINT "PK_b2acfd3deebfa542a9e712f9828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "loan_payments" ("is_active" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric NOT NULL, "user_loan_id" uuid NOT NULL, CONSTRAINT "PK_db75e38243b5f2cb9e728da4d0f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d9ce3c8c9956ce6c55f8e2cc9fe" FOREIGN KEY ("userWalletsId") REFERENCES "user_wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_0892971a3e8c115f3f2c12fbd68" FOREIGN KEY ("userLoansId") REFERENCES "user_loans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan_products" ADD CONSTRAINT "FK_a6da15f255ef1057c614c7c7a6d" FOREIGN KEY ("userLoansId") REFERENCES "user_loans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_loans" ADD CONSTRAINT "FK_9a7f1fe4d7ffcefc5dcdf3cf931" FOREIGN KEY ("loanPaymentsId") REFERENCES "loan_payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);


      // insert pre defined loan products
        await queryRunner.query(`
        INSERT INTO 
        loan_products (id, product_limit, interest, tenure, tenure_type)
        VALUES 
          (uuid_generate_v4(), 1000, 0.1, 15, 'DAY'),
          (uuid_generate_v4(), 2500, 0.125, 30, 'DAY');`);
      // insert pre defined default users
        await queryRunner.query(`
        INSERT INTO 
        users (id, name, max_loan_limit)
        VALUES 
        (uuid_generate_v4(), 'John Doe', 5000);`);
        // insert company float used to issue out loans
        await queryRunner.query(`
        INSERT INTO company_float (id, current_balance, transaction_id, transaction_type)
        VALUES (
            uuid_generate_v4(), 
            50000078970, 
            'TXN-' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'), 
            'CREDIT'
        );`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "user_loans" DROP CONSTRAINT "FK_9a7f1fe4d7ffcefc5dcdf3cf931"`);
      await queryRunner.query(`ALTER TABLE "loan_products" DROP CONSTRAINT "FK_a6da15f255ef1057c614c7c7a6d"`);
      await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0892971a3e8c115f3f2c12fbd68"`);
      await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d9ce3c8c9956ce6c55f8e2cc9fe"`);
      await queryRunner.query(`DROP TABLE "loan_payments"`);
      await queryRunner.query(`DROP TABLE "user_loans"`);
      await queryRunner.query(`DROP TABLE "loan_products"`);
      await queryRunner.query(`DROP TYPE "public"."loan_products_tenure_type_enum"`);
      await queryRunner.query(`DROP TABLE "users"`);
      await queryRunner.query(`DROP TABLE "user_wallets"`);
      await queryRunner.query(`DROP TYPE "public"."user_wallets_transaction_type_enum"`);
      await queryRunner.query(`DROP TABLE "company_float"`);
      await queryRunner.query(`DROP TYPE "public"."company_float_transaction_type_enum"`);
    }

}
