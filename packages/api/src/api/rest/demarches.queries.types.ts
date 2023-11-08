/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetDemarcheQueryDb' parameters type */
export interface IGetDemarcheQueryDbParams {
  id: string;
}

/** 'GetDemarcheQueryDb' return type */
export interface IGetDemarcheQueryDbResult {
  demarche_statut_id: string;
  demarche_type_id: string;
  entreprises_lecture: boolean | null;
  id: string;
  public_lecture: boolean | null;
  slug: string | null;
  titre_id: string;
  titre_nom: string;
  titre_slug: string;
  titre_type_id: string;
}

/** 'GetDemarcheQueryDb' query type */
export interface IGetDemarcheQueryDbQuery {
  params: IGetDemarcheQueryDbParams;
  result: IGetDemarcheQueryDbResult;
}

/** 'GetDemarchesPhasesByTitreIdDb' parameters type */
export interface IGetDemarchesPhasesByTitreIdDbParams {
  id: string;
}

/** 'GetDemarchesPhasesByTitreIdDb' return type */
export interface IGetDemarchesPhasesByTitreIdDbResult {
  demarche_date_debut: string | null;
  demarche_date_fin: string | null;
  demarche_type_id: string;
  slug: string | null;
}

/** 'GetDemarchesPhasesByTitreIdDb' query type */
export interface IGetDemarchesPhasesByTitreIdDbQuery {
  params: IGetDemarchesPhasesByTitreIdDbParams;
  result: IGetDemarchesPhasesByTitreIdDbResult;
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
  duree: number | null;
  etape_statut_id: string;
  etape_type_id: string;
  heritage_contenu: Json | null;
  heritage_props: Json | null;
  id: string;
  secteurs_maritime: Json | null;
  substances: Json;
  surface: number | null;
}

/** 'GetEtapesByDemarcheIdDb' query type */
export interface IGetEtapesByDemarcheIdDbQuery {
  params: IGetEtapesByDemarcheIdDbParams;
  result: IGetEtapesByDemarcheIdDbResult;
}

