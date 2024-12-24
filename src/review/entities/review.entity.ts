import { BaseTable } from "src/common/entities/base-table.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Review extends BaseTable{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;
    
    @Column()
    contentId : string;

    @Column()
    scope: number; //별점

    @ManyToOne(() => User, (user) => user.review, { onDelete: 'CASCADE' })
    user: User;
}