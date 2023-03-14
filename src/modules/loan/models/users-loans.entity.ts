
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../../../common/base-entity";
import { User } from "../../user/users.entity";
import { LoanPayment } from "./loan-payments.entity";
import { LoanProduct } from "./loan-products.entity";

@Entity('user_loans')
export class UserLoan extends BaseEntity {
    constructor(intialData: Partial<UserLoan> = null) {
        super();
        if (intialData !== null) {
            Object.assign(this, intialData);
        }
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    readonly userId: string;
    @Column({ name: 'loan_product_id', type: 'uuid', nullable: false })
    readonly loanProductId: string;
    @Column({ name: 'accepted', type: 'boolean', nullable: false })
    readonly accepted: boolean;

    @Column({ name: 'fully_paid', type: 'boolean', nullable: false })
    readonly fullyPaid: boolean;

    @Column({ name: 'loaned_amount', type: 'numeric', nullable: false })
    readonly loanedAmount: number;
    @Column({ name: 'loaned_with_interest', type: 'numeric', nullable: false })
    loanWithInterest

    @Column({ name: 'pending_balance', type: 'numeric', nullable: true })
    pendingBalance

    @UpdateDateColumn({ name: 'due_date', type: 'timestamptz', nullable: false })
    readonly dueDate: Date;

    @OneToMany(() => User, (user) => user.userLoans)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @OneToMany(() => LoanProduct, (l) => l.userLoans)
    @JoinColumn({ name: 'loan_product_id', referencedColumnName: 'id' })
    loanProduct: LoanProduct;


    @ManyToOne(() => LoanPayment, (lp) => lp.userLoan, {eager:true})
    loanPayments: LoanPayment[];
}

