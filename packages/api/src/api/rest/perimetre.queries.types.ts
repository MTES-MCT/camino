/** Types generated for queries found in "src/api/rest/perimetre.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetGeojsonByGeoSystemeIdDb' parameters type */
export interface IGetGeojsonByGeoSystemeIdDbParams {
  geojson: string;
  geoSystemeId: number;
  precision: number;
}

/** 'GetGeojsonByGeoSystemeIdDb' return type */
export interface IGetGeojsonByGeoSystemeIdDbResult {
  geojson: Json | null;
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

