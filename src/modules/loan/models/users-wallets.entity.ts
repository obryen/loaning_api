
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../../common/base-entity";
import { User } from "../../user/users.entity";

export enum UserTransactionType {
    DR = 'DEBIT',
    CR = 'CREDIT'
}

@Entity('user_wallets')
export class UserWallet extends BaseEntity {
    constructor(intialData: Partial<UserWallet> = null) {
        super();
        if (intialData !== null) {
            Object.assign(this, intialData);
        }
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    readonly userId: string;
    @Column({ name: 'current_balance', type: 'numeric', nullable: false })
    readonly currentBalance: number;
    @Column({ name: 'transaction_type', type: 'enum', enum: UserTransactionType, nullable: false })
    readonly tansactionType: UserTransactionType;

    @OneToMany(() => User, (user) => user.userWallets)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;
}

