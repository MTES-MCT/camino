/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type JsonArray = (Json)[];

/** 'GetEtapesByDemarcheIdDb' parameters type */
export interface IGetEtapesByDemarcheIdDbParams {
  demarcheId: string;
}

/** 'GetEtapesByDemarcheIdDb' return type */
export interface IGetEtapesByDemarcheIdDbResult {
  communes: Json;
  contenu: Json | null;
  date: string;
  date_debut: string | null;
  date_fin: string | null;
  decisions_annexes_contenu: Json | null;
  decisions_annexes_sections: JsonArray | null;
  duree: number | null;
  etape_statut_id: string;
  etape_type_id: string;
  forets: Json;
  geojson4326_perimetre: Json | null;
  geojson4326_points: Json | null;
  heritage_contenu: Json | null;
  heritage_props: Json | null;
  id: string;
  notes: string | null;
  ordre: number;
  sdom_zones: Json;
  secteurs_maritime: Json;
  slug: string | null;
  substances: Json;
  surface: number | null;
}

/** 'GetEtapesByDemarcheIdDb' query type */
export interface IGetEtapesByDemarcheIdDbQuery {
  params: IGetEtapesByDemarcheIdDbParams;
  result: IGetEtapesByDemarcheIdDbResult;
}

/** 'GetDemarcheByIdOrSlugDb' parameters type */
export interface IGetDemarcheByIdOrSlugDbParams {
  idOrSlug: string;
}

/** 'GetDemarcheByIdOrSlugDb' return type */
export interface IGetDemarcheByIdOrSlugDbResult {
  demarche_id: string;
  demarche_slug: string | null;
  demarche_type_id: string;
  entreprises_lecture: boolean;
  public_lecture: boolean;
  titre_id: string;
}

/** 'GetDemarcheByIdOrSlugDb' query type */
export interface IGetDemarcheByIdOrSlugDbQuery {
  params: IGetDemarcheByIdOrSlugDbParams;
  result: IGetDemarcheByIdOrSlugDbResult;
}

