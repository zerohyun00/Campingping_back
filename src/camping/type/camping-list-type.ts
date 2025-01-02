export interface CampingListResType {
  id: number;
  contentId: string;
  firstImageUrl: string;
  facltNm: string;
  addr1: string;
  addr2: string;
  doNm: string;
  sigunguNm: string;
  lineIntro: string;
  intro: string;
  favorite: boolean;
  location: string;
}
export interface CampingWithDetails {
  result: CampingListResType[];
  nextCursor: any;
}

export type CampingListType = {
  id: number;
  contentid: string;
  firstimageurl: string;
  facltnm: string;
  addr1: string;
  addr2: string;
  donm: string;
  sigungunm: string;
  lineintro: string;
  intro: string;
  location: string;
  favorite: boolean;
};