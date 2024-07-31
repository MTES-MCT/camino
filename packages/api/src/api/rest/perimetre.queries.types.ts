/** Types generated for queries found in "src/api/rest/perimetre.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'ConvertMultiPointDb' parameters type */
export interface IConvertMultiPointDbParams {
  fromGeoSystemeId: number;
  geojson: string;
  toGeoSystemeId: number;
}

/** 'ConvertMultiPointDb' return type */
export interface IConvertMultiPointDbResult {
  geojson: Json | null;
}

/** 'ConvertMultiPointDb' query type */
export interface IConvertMultiPointDbQuery {
  params: IConvertMultiPointDbParams;
  result: IConvertMultiPointDbResult;
}

/** 'GetGeojsonByGeoSystemeIdDb' parameters type */
export interface IGetGeojsonByGeoSystemeIdDbParams {
  fromGeoSystemeId: number;
  geojson: string;
  toGeoSystemeId: number;
}

/** 'GetGeojsonByGeoSystemeIdDb' return type */
export interface IGetGeojsonByGeoSystemeIdDbResult {
  geojson: Json | null;
  is_valid: boolean | null;
}

/** 'GetGeojsonByGeoSystemeIdDb' query type */
export interface IGetGeojsonByGeoSystemeIdDbQuery {
  params: IGetGeojsonByGeoSystemeIdDbParams;
  result: IGetGeojsonByGeoSystemeIdDbResult;
}

/** 'GetTitresIntersectionWithGeojsonDb' parameters type */
export interface IGetTitresIntersectionWithGeojsonDbParams {
  domaine_id: string;
  geojson4326_perimetre: string;
  titre_slug: string;
  titre_statut_ids: readonly (string)[];
}

/** 'GetTitresIntersectionWithGeojsonDb' return type */
export interface IGetTitresIntersectionWithGeojsonDbResult {
  nom: string;
  slug: string;
  titre_statut_id: string;
}

/** 'GetTitresIntersectionWithGeojsonDb' query type */
export interface IGetTitresIntersectionWithGeojsonDbQuery {
  params: IGetTitresIntersectionWithGeojsonDbParams;
  result: IGetTitresIntersectionWithGeojsonDbResult;
}

/** Query 'GetGeojsonInformationDb' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetGeojsonInformationDbResult = never;

/** Query 'GetGeojsonInformationDb' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetGeojsonInformationDbParams = never;

