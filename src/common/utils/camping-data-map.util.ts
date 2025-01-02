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
      // console.error(`Error parsing location JSON for camp ID ${camp.camp_id}:`, error.message);
  }
  return {
    id: campingData.camping_id,
    lineIntro: filterEmptyString(campingData.camping_lineIntro),
    intro: filterEmptyString(campingData.camping_intro),
    factDivNm: filterEmptyString(campingData.camping_factDivNm),
    manageDivNm: filterEmptyString(campingData.camping_manageDivNm),
    bizrno: filterEmptyString(campingData.camping_bizrno),
    manageSttus: filterEmptyString(campingData.camping_manageSttus),
    hvofBgnde: filterEmptyString(campingData.camping_hvofBgnde),
    hvofEndde: filterEmptyString(campingData.camping_hvofEndde),
    featureNm: filterEmptyString(campingData.camping_featureNm),
    induty: filterEmptyString(campingData.camping_induty),
    lccl: filterEmptyString(campingData.camping_lccl),
    doNm: filterEmptyString(campingData.camping_doNm),
    signguNm: filterEmptyString(campingData.camping_signguNm),
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
    favorite: campingData.favorite_status ?? false,
    location,
  };
}

export function mapCampingListData(result: CampingListType[]) {
  return result.map((camp) => {
    let location: string = null;
    // console.log(camp);
    try {
      location = JSON.parse(camp.location);
    } catch (error) {
      // custom logger 달기
      // console.error(`Error parsing location JSON for camp ID ${camp.camp_id}:`, error.message);
    }

    return {
      id: camp.camping_id,
      lineIntro: filterEmptyString(camp.camping_lineIntro),
      intro: filterEmptyString(camp.camping_intro),
      factDivNm: filterEmptyString(camp.camping_factDivNm),
      manageDivNm: filterEmptyString(camp.camping_manageDivNm),
      bizrno: filterEmptyString(camp.camping_bizrno),
      manageSttus: filterEmptyString(camp.camping_manageSttus),
      hvofBgnde: filterEmptyString(camp.camping_hvofBgnde),
      hvofEndde: filterEmptyString(camp.camping_hvofEndde),
      featureNm: filterEmptyString(camp.camping_featureNm),
      induty: filterEmptyString(camp.camping_induty),
      lccl: filterEmptyString(camp.camping_lccl),
      doNm: filterEmptyString(camp.camping_doNm),
      signguNm: filterEmptyString(camp.camping_signguNm),
      addr1: filterEmptyString(camp.camping_addr1),
      addr2: filterEmptyString(camp.camping_addr2),
      tel: filterEmptyString(camp.camping_tel),
      homepage: filterEmptyString(camp.camping_homepage),
      gplnInnerFclty: filterEmptyString(camp.camping_gplnInnerFclty),
      caravnInnerFclty: filterEmptyString(camp.camping_caravnInnerFclty),
      operPdCl: filterEmptyString(camp.camping_operPdCl),
      operDeCl: filterEmptyString(camp.camping_operDeCl),
      trlerAcmpnyAt: filterEmptyString(camp.camping_trlerAcmpnyAt),
      caravAcmpnyAt: filterEmptyString(camp.camping_caravAcmpnyAt),
      sbrsCl: filterEmptyString(camp.camping_sbrsCl),
      toiletCo: camp.camping_toiletCo,
      swrmCo: camp.camping_swrmCo,
      posblFcltyCl: filterEmptyString(camp.camping_posblFcltyCl),
      themaEnvrnCl: filterEmptyString(camp.camping_themaEnvrnCl),
      eqpmnLendCl: filterEmptyString(camp.camping_eqpmnLendCl),
      animalCmgCl: filterEmptyString(camp.camping_animalCmgCl),
      contentId: camp.camping_contentId,
      firstImageUrl: camp.camping_firstImageUrl,
      favorite: camp.favorite_status ?? false,
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
      console.error(`Error parsing location JSON for camping ID ${camping.camping_id}:`, error.message);
    }

    return {
      id: camping.camping_id,
      factDivNm: camping.camping_factDivNm,
      addr1: camping.camping_addr1,
      lineinto: camping.camping_lineIntro,
      intro: camping.camping_intro,
      contentId: camping.camping_contentId,
      favorite: camping.favorite_status ?? false,
      firstImageUrl: camping.camping_firstImageUrl,
      location,
      distance: Number(camping.distance) || 0,
    };
  });
}