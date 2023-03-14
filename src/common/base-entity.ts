
import { Column, UpdateDateColumn, CreateDateColumn } from "typeorm";
export class BaseEntity {

    @Column({ type: 'boolean', name: 'is_active', default: true })
    isActive: boolean;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}