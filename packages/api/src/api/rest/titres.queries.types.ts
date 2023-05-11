/** Types generated for queries found in "src/api/rest/titres.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTitre' parameters type */
export interface IGetTitreParams {
  id?: string | null | void;
}

/** 'GetTitre' return type */
export interface IGetTitreResult {
  administrations_locales: Json | null;
  id: string;
  nom: string;
  slug: string;
  titre_statut_id: string;
  type_id: string;
}

/** 'GetTitre' query type */
export interface IGetTitreQuery {
  params: IGetTitreParams;
  result: IGetTitreResult;
}
