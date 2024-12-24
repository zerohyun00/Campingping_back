import { Camping } from 'src/camping/entities/camping.entity';
import { BaseTable } from 'src/common/entities/base-table.entity';
import { ImageType } from 'src/common/type/image.type';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Image extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  typeId: string;

  @Column({ enum: ImageType, nullable: true })
  type: string;

  @ManyToOne(() => Camping, (campping) => campping.images)
  camping: Camping;
}
