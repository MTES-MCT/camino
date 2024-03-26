/** Types generated for queries found in "src/api/rest/etapes.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetEtapeByIdDb' parameters type */
export interface IGetEtapeByIdDbParams {
  etapeId: string;
}

/** 'GetEtapeByIdDb' return type */
export interface IGetEtapeByIdDbResult {
  demarche_id: string;
  etape_id: string;
  etape_type_id: string;
  geojson4326_perimetre: Json | null;
  sdom_zones: Json;
}

/** 'GetEtapeByIdDb' query type */
export interface IGetEtapeByIdDbQuery {
  params: IGetEtapeByIdDbParams;
  result: IGetEtapeByIdDbResult;
}

/** 'GetEtapeDocumentsDb' parameters type */
export type IGetEtapeDocumentsDbParams = void;

/** 'GetEtapeDocumentsDb' return type */
export interface IGetEtapeDocumentsDbResult {
  description: string | null;
  etape_document_type_id: string;
  etape_id: string;
  id: string;
}

/** 'GetEtapeDocumentsDb' query type */
export interface IGetEtapeDocumentsDbQuery {
  params: IGetEtapeDocumentsDbParams;
  result: IGetEtapeDocumentsDbResult;
}

/** 'GetLargeobjectIdByEtapeDocumentIdInternal' parameters type */
export interface IGetLargeobjectIdByEtapeDocumentIdInternalParams {
  etapeDocumentId: string;
}

/** 'GetLargeobjectIdByEtapeDocumentIdInternal' return type */
export interface IGetLargeobjectIdByEtapeDocumentIdInternalResult {
  entreprises_lecture: boolean;
  etape_id: string;
  largeobject_id: number | null;
  public_lecture: boolean;
}

/** 'GetLargeobjectIdByEtapeDocumentIdInternal' query type */
export interface IGetLargeobjectIdByEtapeDocumentIdInternalQuery {
  params: IGetLargeobjectIdByEtapeDocumentIdInternalParams;
  result: IGetLargeobjectIdByEtapeDocumentIdInternalResult;
}

/** 'GetEtapeDataForEditionDb' parameters type */
export interface IGetEtapeDataForEditionDbParams {
  etapeId: string;
}

/** 'GetEtapeDataForEditionDb' return type */
export interface IGetEtapeDataForEditionDbResult {
  demarche_entreprises_lecture: boolean;
  demarche_public_lecture: boolean;
  demarche_type_id: string;
  etape_type_id: string;
  titre_public_lecture: boolean;
  titre_type_id: string;
}

/** 'GetEtapeDataForEditionDb' query type */
export interface IGetEtapeDataForEditionDbQuery {
  params: IGetEtapeDataForEditionDbParams;
  result: IGetEtapeDataForEditionDbResult;
}

/** 'GetAdministrationsLocalesByEtapeId' parameters type */
export interface IGetAdministrationsLocalesByEtapeIdParams {
  etapeId: string;
}

/** 'GetAdministrationsLocalesByEtapeId' return type */
export interface IGetAdministrationsLocalesByEtapeIdResult {
  administrations_locales: Json;
}

/** 'GetAdministrationsLocalesByEtapeId' query type */
export interface IGetAdministrationsLocalesByEtapeIdQuery {
  params: IGetAdministrationsLocalesByEtapeIdParams;
  result: IGetAdministrationsLocalesByEtapeIdResult;
}

/** 'GetTitulairesAmodiatairesTitreEtape' parameters type */
export interface IGetTitulairesAmodiatairesTitreEtapeParams {
  etapeId: string;
}

/** 'GetTitulairesAmodiatairesTitreEtape' return type */
export interface IGetTitulairesAmodiatairesTitreEtapeResult {
  id: string;
}

/** 'GetTitulairesAmodiatairesTitreEtape' query type */
export interface IGetTitulairesAmodiatairesTitreEtapeQuery {
  params: IGetTitulairesAmodiatairesTitreEtapeParams;
  result: IGetTitulairesAmodiatairesTitreEtapeResult;
}

