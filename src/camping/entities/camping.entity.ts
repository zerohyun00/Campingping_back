import { BaseTable } from 'src/common/entities/base-table.entity';
import {
  Column,
  Entity,
  Geometry,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Camping extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  lineIntro: string;

  @Column({ nullable: true })
  intro: string;
  
  @Column({ nullable: true })
  facltNm: string;

  @Column({ nullable: true })
  factDivNm: string;

  @Column({ nullable: true })
  manageDivNm: string;

  @Column({ nullable: true })
  bizrno: string;

  @Column({ nullable: true })
  manageSttus: string;

  @Column({ nullable: true })
  hvofBgnde: string;

  @Column({ nullable: true })
  hvofEndde: string;

  @Column({ nullable: true })
  featureNm: string;

  @Column({ nullable: true })
  induty: string;

  @Column({ nullable: true })
  lccl: string;

  @Column({ nullable: true })
  doNm: string;

  @Column({ nullable: true })
  addr1: string;

  @Column({ nullable: true })
  addr2: string;

  @Column('geometry', { nullable: true })
  location: Geometry;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  homepage: string;

  @Column({ nullable: true })
  gplnInnerFclty: string;

  @Column({ nullable: true })
  caravnInnerFclty: string;

  @Column({ nullable: true })
  operPdCl: string;

  @Column({ nullable: true })
  operDeCl: string;

  @Column({ nullable: true })
  trlerAcmpnyAt: string;

  @Column({ nullable: true })
  caravAcmpnyAt: string;

  @Column({ nullable: true })
  sbrsCl: string;

  @Column({ nullable: true })
  toiletCo: string;

  @Column({ nullable: true })
  swrmCo: string;

  @Column({ nullable: true })
  posblFcltyCl: string;

  @Column({ nullable: true })
  themaEnvrnCl: string;

  @Column({ nullable: true })
  eqpmnLendCl: string;

  @Column({ nullable: true })
  animalCmgCl: string;

  @Column({ nullable: true })
  firstImageUrl: string;

  @Column({ nullable : true })
  sigunguNm: string;

  @Column({ unique: true })
  contentId: string;

  setLocation(mapX: number, mapY: number) {
    this.location = {
      type: 'Point',
      coordinates: [mapX, mapY],
    };
  }
}
