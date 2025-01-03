export type CampingType = {
  lineIntro?: string;
  intro?: string;
  facltNm?: string; // API에서 이름 필드
  manageDivNm?: string;
  bizrno?: string;
  manageSttus?: string;
  hvofBgnde?: string; // 날짜 관련 필드는 문자열로 가정
  hvofEndde?: string;
  featureNm?: string;
  induty?: string;
  lctCl?: string; // 환경 필드
  doNm?: string;
  sigunguNm?: string;
  addr1?: string;
  addr2?: string;
  mapX?: number; // 좌표는 문자열 또는 숫자로 받을 수 있음
  mapY?: number;
  tel?: string;
  homepage?: string;
  gnrlSiteCo?: string; // 숫자 또는 문자열로 가정
  caravInnerFclty?: string;
  operPdCl?: string;
  operDeCl?: string;
  trlerAcmpnyAt?: string; // 동반 여부는 boolean일 가능성도 있음
  caravAcmpnyAt?: string;
  sbrsCl?: string;
  toiletCo?: string;
  swrmCo?: string;
  posblFcltyCl?: string;
  themaEnvrnCl?: string;
  eqpmnLendCl?: string;
  animalCmgCl?: string;
  firstImageUrl?: string;
  contentId?: string;
};
