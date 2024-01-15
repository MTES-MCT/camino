/** Types generated for queries found in "src/api/rest/titres.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTitreInternal' parameters type */
export interface IGetTitreInternalParams {
  id: string;
}

/** 'GetTitreInternal' return type */
export interface IGetTitreInternalResult {
  id: string;
  nb_activites_to_do: string | null;
  nom: string;
  public_lecture: boolean;
  references: Json;
  slug: string;
  titre_doublon_id: string;
  titre_doublon_nom: string;
  titre_statut_id: string;
  titre_type_id: string;
}

/** 'GetTitreInternal' query type */
export interface IGetTitreInternalQuery {
  params: IGetTitreInternalParams;
  result: IGetTitreInternalResult;
}

/** 'GetDemarchesByTitreIdQueryDb' parameters type */
export interface IGetDemarchesByTitreIdQueryDbParams {
  titreId: string;
}

/** 'GetDemarchesByTitreIdQueryDb' return type */
export interface IGetDemarchesByTitreIdQueryDbResult {
  demarche_date_debut: string | null;
  demarche_date_fin: string | null;
  demarche_statut_id: string;
  demarche_type_id: string;
  description: string | null;
  entreprises_lecture: boolean;
  id: string;
  ordre: number;
  public_lecture: boolean;
  slug: string | null;
}

/** 'GetDemarchesByTitreIdQueryDb' query type */
export interface IGetDemarchesByTitreIdQueryDbQuery {
  params: IGetDemarchesByTitreIdQueryDbParams;
  result: IGetDemarchesByTitreIdQueryDbResult;
}

