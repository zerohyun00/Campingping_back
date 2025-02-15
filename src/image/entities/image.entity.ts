import { BaseTable } from 'src/common/entities/base-table.entity';
import { ImageType } from 'src/common/type/image.type';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Image extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  typeId: string;

  @Column({ enum: ImageType, nullable: true })
  type: string;
}
