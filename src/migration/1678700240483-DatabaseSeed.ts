import { MigrationInterface, QueryRunner } from "typeorm"

export class DatabaseSeed1678700240483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

}
