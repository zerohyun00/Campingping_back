import { CamppingListType } from "src/campping/type/campping-list-type";
import { CamppingDetailType } from "src/campping/type/campping-detail.type";
import { ImageDataType } from "src/image/type/image.data-type";

export function mapImageData(result: any[]): ImageDataType[] {
  return result.map((row) => ({
    id: row.image_id,
    url: row.image_url,
  }));
}

export function mapCamppingData(result: any): CamppingDetailType {
  const camppingData = result[0];
  return {
    id: camppingData.campping_id,
    createdAt: camppingData.campping_createdAt,
    updatedAt: camppingData.campping_updatedAt,
    deletedAt: camppingData.campping_deletedAt,
    lineIntro: camppingData.campping_lineIntro,
    intro: camppingData.campping_intro,
    factDivNm: camppingData.campping_factDivNm,
    manageDivNm: camppingData.campping_manageDivNm,
    bizrno: camppingData.campping_bizrno,
    manageSttus: camppingData.campping_manageSttus,
    hvofBgnde: camppingData.campping_hvofBgnde,
    hvofEndde: camppingData.campping_hvofEndde,
    featureNm: camppingData.campping_featureNm,
    induty: camppingData.campping_induty,
    lccl: camppingData.campping_lccl,
    doNm: camppingData.campping_doNm,
    signguNm: camppingData.campping_signguNm,
    addr1: camppingData.campping_addr1,
    addr2: camppingData.campping_addr2,
    tel: camppingData.campping_tel,
    homepage: camppingData.campping_homepage,
    gplnInnerFclty: camppingData.campping_gplnInnerFclty,
    caravnInnerFclty: camppingData.campping_caravnInnerFclty,
    operPdCl: camppingData.campping_operPdCl,
    operDeCl: camppingData.campping_operDeCl,
    trlerAcmpnyAt: camppingData.campping_trlerAcmpnyAt,
    caravAcmpnyAt: camppingData.campping_caravAcmpnyAt,
    sbrsCl: camppingData.campping_sbrsCl,
    toiletCo: camppingData.campping_toiletCo,
    swrmCo: camppingData.campping_swrmCo,
    posblFcltyCl: camppingData.campping_posblFcltyCl,
    themaEnvrnCl: camppingData.campping_themaEnvrnCl,
    eqpmnLendCl: camppingData.campping_eqpmnLendCl,
    animalCmgCl: camppingData.campping_animalCmgCl,
    contentId: camppingData.campping_contentId,
    location: camppingData.campping_location,
  };
}

export function mapCamppingListData(result: any[]): CamppingListType[] {
    return result.map((camp) => ({
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
      location: JSON.parse(camp.camp_location),
      images: {
        id: camp.image_id,
        url: camp.image_url,
      } as ImageDataType,
    }));
}