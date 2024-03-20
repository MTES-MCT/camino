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
  etape_id: string | null;
  id: string;
}

/** 'GetEtapeDocumentsDb' query type */
export interface IGetEtapeDocumentsDbQuery {
  params: IGetEtapeDocumentsDbParams;
  result: IGetEtapeDocumentsDbResult;
}

