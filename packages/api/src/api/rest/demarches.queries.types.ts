/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetEtapesByDemarcheIdDb' parameters type */
export interface IGetEtapesByDemarcheIdDbParams {
  demarcheId: string;
}

/** 'GetEtapesByDemarcheIdDb' return type */
export interface IGetEtapesByDemarcheIdDbResult {
  amodiataire_ids: Json;
  communes: Json;
  contenu: Json | null;
  date: string;
  date_debut: string | null;
  date_fin: string | null;
  duree: number | null;
  etape_statut_id: string;
  etape_type_id: string;
  forets: Json;
  geojson_origine_forages: Json | null;
  geojson_origine_geo_systeme_id: string | null;
  geojson_origine_perimetre: Json | null;
  geojson_origine_points: Json | null;
  geojson4326_forages: Json | null;
  geojson4326_perimetre: Json | null;
  geojson4326_points: Json | null;
  heritage_contenu: Json | null;
  heritage_props: Json | null;
  id: string;
  is_brouillon: boolean;
  note: Json;
  ordre: number;
  sdom_zones: Json;
  secteurs_maritime: Json;
  slug: string | null;
  substances: Json;
  surface: number | null;
  titulaire_ids: Json;
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
  demarche_description: string | null;
  demarche_id: string;
  demarche_slug: string | null;
  demarche_type_id: string;
  entreprises_lecture: boolean;
  public_lecture: boolean;
  titre_id: string;
  titre_nom: string;
  titre_slug: string;
  titre_type_id: string;
}

/** 'GetDemarcheByIdOrSlugDb' query type */
export interface IGetDemarcheByIdOrSlugDbQuery {
  params: IGetDemarcheByIdOrSlugDbParams;
  result: IGetDemarcheByIdOrSlugDbResult;
}

