/** Types generated for queries found in "src/business/processes/titres-etapes-consentement.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'GetEtapeConsentementDb' parameters type */
export interface IGetEtapeConsentementDbParams {
  etapeId: string;
}

/** 'GetEtapeConsentementDb' return type */
export interface IGetEtapeConsentementDbResult {
  date: string;
  demarche_ids_consentement: Json;
  geojson4326_perimetre: Json | null;
  id: string;
  substances: Json;
  titre_type_id: string;
  type_id: string;
}

/** 'GetEtapeConsentementDb' query type */
export interface IGetEtapeConsentementDbQuery {
  params: IGetEtapeConsentementDbParams;
  result: IGetEtapeConsentementDbResult;
}

/** 'GetDemarchesEnSuperpositionPourConsentementDb' parameters type */
export interface IGetDemarchesEnSuperpositionPourConsentementDbParams {
  dateDemande: string;
  perimetreDemande: string;
  substancesDemande: stringArray;
}

/** 'GetDemarchesEnSuperpositionPourConsentementDb' return type */
export interface IGetDemarchesEnSuperpositionPourConsentementDbResult {
  id: string;
}

/** 'GetDemarchesEnSuperpositionPourConsentementDb' query type */
export interface IGetDemarchesEnSuperpositionPourConsentementDbQuery {
  params: IGetDemarchesEnSuperpositionPourConsentementDbParams;
  result: IGetDemarchesEnSuperpositionPourConsentementDbResult;
}

/** 'UpdateEtapeConsentementDb' parameters type */
export interface IUpdateEtapeConsentementDbParams {
  demarcheIds: Json;
  etapeId: string;
}

/** 'UpdateEtapeConsentementDb' return type */
export type IUpdateEtapeConsentementDbResult = void;

/** 'UpdateEtapeConsentementDb' query type */
export interface IUpdateEtapeConsentementDbQuery {
  params: IUpdateEtapeConsentementDbParams;
  result: IUpdateEtapeConsentementDbResult;
}

