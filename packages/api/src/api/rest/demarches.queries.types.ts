/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */

/** Query 'GetEtapesByDemarcheIdDb' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetEtapesByDemarcheIdDbResult = never;

/** Query 'GetEtapesByDemarcheIdDb' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetEtapesByDemarcheIdDbParams = never;

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

