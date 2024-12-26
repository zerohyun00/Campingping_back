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
    // console.log(camp);
    try {
      location = JSON.parse(camp.camp_location);
    } catch (error) {
      // custom logger 달기
      // console.error(`Error parsing location JSON for camp ID ${camp.camp_id}:`, error.message);
    }

    return {
      id: camp.camping_id,
      lineIntro: camp.camping_lineIntro,
      intro: camp.camping_intro,
      factDivNm: camp.camping_factDivNm,
      manageDivNm: camp.camping_manageDivNm,
      bizrno: camp.camping_bizrno,
      manageSttus: camp.camping_manageSttus,
      hvofBgnde: camp.camping_hvofBgnde,
      hvofEndde: camp.camping_hvofEndde,
      featureNm: camp.camping_featureNm,
      induty: camp.camping_induty,
      lccl: camp.camping_lccl,
      doNm: camp.camping_doNm,
      signguNm: camp.camping_signguNm,
      addr1: camp.camping_addr1,
      addr2: camp.camping_addr2,
      tel: camp.camping_tel,
      homepage: camp.camping_homepage,
      gplnInnerFclty: camp.camping_gplnInnerFclty,
      caravnInnerFclty: camp.camping_caravnInnerFclty,
      operPdCl: camp.camping_operPdCl,
      operDeCl: camp.camping_operDeCl,
      trlerAcmpnyAt: camp.camping_trlerAcmpnyAt,
      caravAcmpnyAt: camp.camping_caravAcmpnyAt,
      sbrsCl: camp.camping_sbrsCl,
      toiletCo: camp.camping_toiletCo,
      swrmCo: camp.camping_swrmCo,
      posblFcltyCl: camp.camping_posblFcltyCl,
      themaEnvrnCl: camp.camping_themaEnvrnCl,
      eqpmnLendCl: camp.camping_eqpmnLendCl,
      animalCmgCl: camp.camping_animalCmgCl,
      contentId: camp.camping_contentid,
      location,
      images: {
        id: camp.image_id,
        url: camp.image_url,
      } as ImageDataType,
    };
  });
}
