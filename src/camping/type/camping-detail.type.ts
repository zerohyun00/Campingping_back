import { ImageDataType } from "src/image/type/image.data-type";

export type CampingDetailType = {
  camping_id: number;
  camping_lineIntro: string;
  camping_intro: string;
  camping_facltNm: string;
  camping_manageDivNm: string;
  camping_bizrno: string;
  camping_manageSttus: string;
  camping_hvofBgnde: string;
  camping_hvofEndde: string;
  camping_featureNm: string;
  camping_induty: string;
  camping_lccl: string;
  camping_doNm: string;
  camping_sigunguNm: string;
  camping_addr1: string;
  camping_addr2?: string;
  location: string;
  camping_tel: string;
  camping_homepage?: string;
  camping_gplnInnerFclty: string;
  camping_caravnInnerFclty: string;
  camping_operPdCl: string;
  camping_operDeCl: string;
  camping_trlerAcmpnyAt: string;
  camping_caravAcmpnyAt: string;
  camping_sbrsCl: string;
  camping_toiletCo: number;
  camping_swrmCo: number;
  camping_posblFcltyCl: string;
  camping_themaEnvrnCl: string;
  camping_eqpmnLendCl: string;
  camping_animalCmgCl: string;
  camping_contentId: string;
  camping_firstImageUrl: string;
  favorite_status: boolean;
}

export interface CampingfindOneType {
  images: { id: number; url: string }[]; // images 필드 추가
  id: number;
  lineIntro: string;
  intro: string;
  facltNm: string;
  manageDivNm: string;
  bizrno: string;
  manageSttus: string;
  hvofBgnde: string;
  hvofEndde: string;
  featureNm: string;
  induty: string;
  lccl: string;
  doNm: string;
  sigunguNm: string;
  addr1: string;
  addr2: string;
  tel: string;
  homepage: string;
  gplnInnerFclty: string;
  caravnInnerFclty: string;
  operPdCl: string;
  operDeCl: string;
  trlerAcmpnyAt: string;
  caravAcmpnyAt: string;
  sbrsCl: string;
  toiletCo: number;
  swrmCo: number;
  posblFcltyCl: string;
  themaEnvrnCl: string;
  eqpmnLendCl: string;
  animalCmgCl: string;
  firstImageUrl: string;
  contentId: string;
  location: string;
}