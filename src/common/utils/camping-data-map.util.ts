import { CampingListType } from 'src/camping/type/camping-list-type';
import { CampingDetailType } from 'src/camping/type/camping-detail.type';
import { ImageDataType } from 'src/image/type/image.data-type';
import { NearbyCampingType } from 'src/camping/type/camping-near-map.type';

function filterEmptyString(value: string) {
  return value === "" ? null : value;
}

export function mapImageData(result: ImageDataType[]) {
  return result.map((row) => ({
    id: row.image_id,
    url: row.image_url,
  }));
}

export function mapCampingData(result: CampingDetailType[]) {
  const campingData = result[0];
  let location: string = null;
  try {
    location = JSON.parse(campingData.location)
  } catch (error) {
      console.error(`Error parsing location JSON for camp ID ${campingData.camping_id}:`, error.message);
  }
  return {
    id: campingData.camping_id,
    lineIntro: filterEmptyString(campingData.camping_lineIntro),
    intro: filterEmptyString(campingData.camping_intro),
    facltNm: filterEmptyString(campingData.camping_facltNm),
    manageDivNm: filterEmptyString(campingData.camping_manageDivNm),
    bizrno: filterEmptyString(campingData.camping_bizrno),
    manageSttus: filterEmptyString(campingData.camping_manageSttus),
    hvofBgnde: filterEmptyString(campingData.camping_hvofBgnde),
    hvofEndde: filterEmptyString(campingData.camping_hvofEndde),
    featureNm: filterEmptyString(campingData.camping_featureNm),
    induty: filterEmptyString(campingData.camping_induty),
    lccl: filterEmptyString(campingData.camping_lccl),
    doNm: filterEmptyString(campingData.camping_doNm),
    sigunguNm: filterEmptyString(campingData.camping_sigunguNm),
    addr1: filterEmptyString(campingData.camping_addr1),
    addr2: filterEmptyString(campingData.camping_addr2),
    tel: filterEmptyString(campingData.camping_tel),
    homepage: filterEmptyString(campingData.camping_homepage),
    gplnInnerFclty: filterEmptyString(campingData.camping_gplnInnerFclty),
    caravnInnerFclty: filterEmptyString(campingData.camping_caravnInnerFclty),
    operPdCl: filterEmptyString(campingData.camping_operPdCl),
    operDeCl: filterEmptyString(campingData.camping_operDeCl),
    trlerAcmpnyAt: filterEmptyString(campingData.camping_trlerAcmpnyAt),
    caravAcmpnyAt: filterEmptyString(campingData.camping_caravAcmpnyAt),
    sbrsCl: filterEmptyString(campingData.camping_sbrsCl),
    toiletCo: campingData.camping_toiletCo,
    swrmCo: campingData.camping_swrmCo,
    posblFcltyCl: filterEmptyString(campingData.camping_posblFcltyCl),
    themaEnvrnCl: filterEmptyString(campingData.camping_themaEnvrnCl),
    eqpmnLendCl: filterEmptyString(campingData.camping_eqpmnLendCl),
    animalCmgCl: filterEmptyString(campingData.camping_animalCmgCl),
    firstImageUrl: filterEmptyString(campingData.camping_firstImageUrl),
    contentId: campingData.camping_contentId,
    location,
  };
}

export function mapCampingListData(result: CampingListType[]) {
  return result.map((camp) => {
    let location: string = null;
    try {
      location = JSON.parse(camp.location);
    } catch (error) {
      console.error(`Error parsing location JSON for camp ID ${camp.id}:`, error.message);
    }
    return {
      id: camp.id,
      contentId: filterEmptyString(camp.contentid),
      firstImageUrl: filterEmptyString(camp.firstimageurl),
      facltNm: filterEmptyString(camp.facltnm),
      addr1: filterEmptyString(camp.addr1),
      addr2:  filterEmptyString(camp.addr2),
      doNm: filterEmptyString(camp.donm),
      sigunguNm: filterEmptyString(camp.sigungunm),
      lineIntro: filterEmptyString(camp.lineintro),
      intro: filterEmptyString(camp.intro),
      favorite: camp.favorite ?? false,
      location,
    };
  });
}

export function mapNearbycampingData(result: NearbyCampingType[]) {
  return result.map((camping) => {
    let location: string = null;

    try {
      location = JSON.parse(camping.location);
    } catch (error) {
      console.error(`Error parsing location JSON for camping ID ${camping.id}:`, error.message);
    }

    return {
      id: camping.id,
      contentId: filterEmptyString(camping.contentid),
      firstImageUrl: filterEmptyString(camping.firstimageurl),
      facltNm: filterEmptyString(camping.facltnm),
      addr1: filterEmptyString(camping.addr1),
      addr2:  filterEmptyString(camping.addr2),
      lineIntro: filterEmptyString(camping.lineintro),
      favorite: camping.favorite ?? false,
      location,
      distance: Number(camping.distance) || 0,
    };
  });
}