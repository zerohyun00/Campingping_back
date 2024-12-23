import { Campping } from "src/campping/entities/campping.entity";
import { BaseTable } from "src/common/entities/base-table.entity";
import { ImageType } from "src/common/type/image.type";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Image extends BaseTable{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({ nullable: true })
    typeId: string;
    
    @Column({enum: ImageType , nullable: true})
    type: string;

    @ManyToOne(() => Campping, campping => campping.images)
    @JoinColumn({ name: 'contentId' })
    campping: Campping;
}