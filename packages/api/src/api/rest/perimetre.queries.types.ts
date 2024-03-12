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
  st_isvalid: boolean | null;
}

/** 'GetGeojsonByGeoSystemeIdDb' query type */
export interface IGetGeojsonByGeoSystemeIdDbQuery {
  params: IGetGeojsonByGeoSystemeIdDbParams;
  result: IGetGeojsonByGeoSystemeIdDbResult;
}

/** Query 'GetTitresIntersectionWithGeojsonDb' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTitresIntersectionWithGeojsonDbResult = never;

/** Query 'GetTitresIntersectionWithGeojsonDb' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTitresIntersectionWithGeojsonDbParams = never;

/** 'GetGeojsonInformationDb' parameters type */
export interface IGetGeojsonInformationDbParams {
  geojson4326_perimetre: string;
}

/** 'GetGeojsonInformationDb' return type */
export interface IGetGeojsonInformationDbResult {
  communes: Json | null;
  forets: Json | null;
  sdom: Json | null;
  secteurs: Json | null;
  surface: number | null;
}

/** 'GetGeojsonInformationDb' query type */
export interface IGetGeojsonInformationDbQuery {
  params: IGetGeojsonInformationDbParams;
  result: IGetGeojsonInformationDbResult;
}

