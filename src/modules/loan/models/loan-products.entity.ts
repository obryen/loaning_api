
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../../common/base-entity";
import { UserLoan } from "./users-loans.entity";

enum TenureType {
    dd= "DAY",
    m= "MONTH",
    y= "YEAR",
}

@Entity('loan_products')
export class LoanProduct extends BaseEntity {
    constructor(intialData: Partial<LoanProduct> = null) {
        super();
        if (intialData !== null) {
            Object.assign(this, intialData);
        }
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'product_limit', type: 'numeric', nullable: false })
    readonly limit: number;

    @Column({ name: 'interest', type: 'float', nullable: false })
    readonly interest: number;

    @Column({ name: 'tenure', type: 'numeric', nullable: false })
    readonly tenure: string;
    @Column({ name: 'tenure_type', type: 'enum',enum: TenureType, nullable: false })
    readonly tenureType: TenureType;

    @ManyToOne(() => UserLoan, (ul) => ul.loanProduct)
    userLoans: UserLoan[];
}

