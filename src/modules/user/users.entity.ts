
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../common/base-entity";
import { UserLoan } from "../loan/models/users-loans.entity";
import { UserWallet } from "../loan/models/users-wallets.entity";

@Entity('users')
export class User extends BaseEntity {
    constructor(intialData: Partial<User> = null) {
        super();
        if (intialData !== null) {
            Object.assign(this, intialData);
        }
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'name', type: 'varchar', nullable: false })
    readonly name: string;

    @Column({ name: 'max_loan_limit', type: 'numeric', nullable: false, default: 5000 })
    readonly maxLoanLimit: number;

    // user can have many wallet records 
    @ManyToOne(() => UserWallet, (uw) => uw.user)
    userWallets: UserWallet[];

    // user can have many loan records 
    @ManyToOne(() => UserLoan, (uw) => uw.user)
    userLoans: UserLoan[];
}

