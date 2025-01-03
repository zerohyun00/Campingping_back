export type NearbyCampingType = { 
    id: number;
    contentid : string;
    firstimageurl: string;
    facltnm: string;
    addr1: string;
    addr2: string;
    lineintro: string;
    location: string;
    favorite: boolean;
    distance: number;
}

export interface NearbyCampingResType {
    id: number;
    contentId: string;
    firstImageUrl: string;
    facltNm: string;
    addr1: string;
    addr2: string;
    lineIntro: string;
    favorite: boolean;
    location: string;
    distance: number;
  }