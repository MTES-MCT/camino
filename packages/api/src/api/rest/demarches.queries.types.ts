/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type JsonArray = (Json)[];

/** 'GetDemarcheQueryDb' parameters type */
export interface IGetDemarcheQueryDbParams {
  id: string;
}

/** 'GetDemarcheQueryDb' return type */
export interface IGetDemarcheQueryDbResult {
  demarche_statut_id: string;
  demarche_type_id: string;
  entreprises_lecture: boolean;
  id: string;
  public_lecture: boolean;
  slug: string | null;
  titre_id: string;
  titre_nom: string;
  titre_public_lecture: boolean;
  titre_slug: string;
  titre_statut_id: string;
  titre_type_id: string;
}

/** 'GetDemarcheQueryDb' query type */
export interface IGetDemarcheQueryDbQuery {
  params: IGetDemarcheQueryDbParams;
  result: IGetDemarcheQueryDbResult;
}

/** 'GetDemarchesByTitreIdDb' parameters type */
export interface IGetDemarchesByTitreIdDbParams {
  id: string;
}

/** 'GetDemarchesByTitreIdDb' return type */
export interface IGetDemarchesByTitreIdDbResult {
  demarche_date_debut: string | null;
  demarche_date_fin: string | null;
  demarche_type_id: string;
  entreprises_lecture: boolean;
  first_etape_date: string | null;
  public_lecture: boolean;
  slug: string | null;
}

/** 'GetDemarchesByTitreIdDb' query type */
export interface IGetDemarchesByTitreIdDbQuery {
  params: IGetDemarchesByTitreIdDbParams;
  result: IGetDemarchesByTitreIdDbResult;
}

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
  heritage_contenu: Json | null;
  heritage_props: Json | null;
  id: string;
  sdom_zones: Json | null;
  secteurs_maritime: Json | null;
  slug: string | null;
  substances: Json;
  surface: number | null;
}

/** 'GetEtapesByDemarcheIdDb' query type */
export interface IGetEtapesByDemarcheIdDbQuery {
  params: IGetEtapesByDemarcheIdDbParams;
  result: IGetEtapesByDemarcheIdDbResult;
}

