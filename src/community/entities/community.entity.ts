import { Comment } from "src/comment/entites/comment.entity";
import { BaseTable } from "src/common/entities/base-table.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";



@Entity()
export class Community extends BaseTable{
    @PrimaryGeneratedColumn()
    title: number;

    @Column()
    content: string;
    
    @Column()
    location: string;
    
    @Column()
    people: string;
    
    @Column({ type: 'timestamp'})    
    schedule: Date;

    @Column({default: 0})
    view: number;
    
    @ManyToOne(() => User, (user)=> user.community, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Comment, (comment) => comment.community, { cascade: true })
    comment: Comment[];
}