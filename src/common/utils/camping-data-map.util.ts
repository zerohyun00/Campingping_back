import { CampingListType } from 'src/camping/type/camping-list-type';
import { CampingDetailType } from 'src/camping/type/camping-detail.type';
import { ImageDataType } from 'src/image/type/image.data-type';

export function mapImageData(result: any[]): ImageDataType[] {
  return result.map((row) => ({
    id: row.image_id,
    url: row.image_url,
  }));
}

export function mapCampingData(result: any): CampingDetailType {
  const campingData = result[0];
  return {
    id: campingData.camping_id,
    createdAt: campingData.camping_createdAt,
    updatedAt: campingData.camping_updatedAt,
    deletedAt: campingData.camping_deletedAt,
    lineIntro: campingData.camping_lineIntro,
    intro: campingData.camping_intro,
    factDivNm: campingData.camping_factDivNm,
    manageDivNm: campingData.camping_manageDivNm,
    bizrno: campingData.camping_bizrno,
    manageSttus: campingData.camping_manageSttus,
    hvofBgnde: campingData.camping_hvofBgnde,
    hvofEndde: campingData.camping_hvofEndde,
    featureNm: campingData.camping_featureNm,
    induty: campingData.camping_induty,
    lccl: campingData.camping_lccl,
    doNm: campingData.camping_doNm,
    signguNm: campingData.camping_signguNm,
    addr1: campingData.camping_addr1,
    addr2: campingData.camping_addr2,
    tel: campingData.camping_tel,
    homepage: campingData.camping_homepage,
    gplnInnerFclty: campingData.camping_gplnInnerFclty,
    caravnInnerFclty: campingData.camping_caravnInnerFclty,
    operPdCl: campingData.camping_operPdCl,
    operDeCl: campingData.camping_operDeCl,
    trlerAcmpnyAt: campingData.camping_trlerAcmpnyAt,
    caravAcmpnyAt: campingData.camping_caravAcmpnyAt,
    sbrsCl: campingData.camping_sbrsCl,
    toiletCo: campingData.camping_toiletCo,
    swrmCo: campingData.camping_swrmCo,
    posblFcltyCl: campingData.camping_posblFcltyCl,
    themaEnvrnCl: campingData.camping_themaEnvrnCl,
    eqpmnLendCl: campingData.camping_eqpmnLendCl,
    animalCmgCl: campingData.camping_animalCmgCl,
    contentId: campingData.camping_contentId,
    location: campingData.camping_location,
  };
}

export function mapCampingListData(result: any[]): CampingListType[] {
  return result.map((camp) => {
    let location: any = null;

    try {
      location = JSON.parse(camp.camp_location);
    } catch (error) {
      // custom logger 달기
      // console.error(`Error parsing location JSON for camp ID ${camp.camp_id}:`, error.message);
    }

    return {
      id: camp.camp_id,
      lineIntro: camp.camp_lineIntro,
      intro: camp.camp_intro,
      factDivNm: camp.camp_factDivNm,
      manageDivNm: camp.camp_manageDivNm,
      bizrno: camp.camp_bizrno,
      manageSttus: camp.camp_manageSttus,
      hvofBgnde: camp.camp_hvofBgnde,
      hvofEndde: camp.camp_hvofEndde,
      featureNm: camp.camp_featureNm,
      induty: camp.camp_induty,
      lccl: camp.camp_lccl,
      doNm: camp.camp_doNm,
      signguNm: camp.camp_signguNm,
      addr1: camp.camp_addr1,
      addr2: camp.camp_addr2,
      tel: camp.camp_tel,
      homepage: camp.camp_homepage,
      gplnInnerFclty: camp.camp_gplnInnerFclty,
      caravnInnerFclty: camp.camp_caravnInnerFclty,
      operPdCl: camp.camp_operPdCl,
      operDeCl: camp.camp_operDeCl,
      trlerAcmpnyAt: camp.camp_trlerAcmpnyAt,
      caravAcmpnyAt: camp.camp_caravAcmpnyAt,
      sbrsCl: camp.camp_sbrsCl,
      toiletCo: camp.camp_toiletCo,
      swrmCo: camp.camp_swrmCo,
      posblFcltyCl: camp.camp_posblFcltyCl,
      themaEnvrnCl: camp.camp_themaEnvrnCl,
      eqpmnLendCl: camp.camp_eqpmnLendCl,
      animalCmgCl: camp.camp_animalCmgCl,
      contentId: camp.camp_contentId,
      location,
      images: {
        id: camp.image_id,
        url: camp.image_url,
      } as ImageDataType,
    };
  });
}
