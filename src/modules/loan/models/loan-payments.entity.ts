
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../../common/base-entity";
import { UserLoan } from "./users-loans.entity";

@Entity('loan_payments')
export class LoanPayment extends BaseEntity {
    constructor(intialData: Partial<LoanPayment> = null) {
        super();
        if (intialData !== null) {
            Object.assign(this, intialData);
        }
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    readonly userId: string;
    @Column({ name: 'amount', type: 'numeric', nullable: false })
    readonly amount: number;
    @Column({ name: 'user_loan_id', type: 'uuid', nullable: false })
    readonly userLoanId: number;

    @OneToMany(() => UserLoan, (l) => l.loanPayments)
    @JoinColumn({ name: 'user_loan_id', referencedColumnName: 'id' })
    userLoan: UserLoan;
}

