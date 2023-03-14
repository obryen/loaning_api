
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../../common/base-entity";
import { User } from "../../user/users.entity";

export enum TransactionType {
    DR = 'WALLET_DEBIT',
    CR = 'CREDIT'
}

@Entity('company_float')
export class CompanyFloat extends BaseEntity {
    constructor(intialData: Partial<CompanyFloat> = null) {
        super();
        if (intialData !== null) {
            Object.assign(this, intialData);
        }
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'current_balance', type: 'numeric', nullable: false })
    readonly currentBalance: number;
    // wallet transaction id
    @Column({ name: 'transaction_id', type: 'varchar', nullable: false })
    readonly transactionId: string;
    
    @Column({ name: 'transaction_type', type: 'enum',enum: TransactionType, nullable: false })
    readonly tansactionType: TransactionType;
}

