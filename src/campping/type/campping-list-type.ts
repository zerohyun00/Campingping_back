import { ImageDataType } from "src/image/type/image.data-type";

export type CamppingListType = {
  id: number;
  lineIntro: string;
  intro: string;
  factDivNm: string;
  manageDivNm: string;
  bizrno: string;
  manageSttus: string;
  hvofBgnde: string;
  hvofEndde: string;
  featureNm: string;
  induty: string;
  lccl: string;
  doNm: string;
  signguNm: string;
  addr1: string;
  addr2?: string;
  location: string;
  tel: string;
  homepage?: string;
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
  contentId: string;
  images: ImageDataType;
}