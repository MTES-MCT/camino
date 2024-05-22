/** Types generated for queries found in "src/api/rest/statistiques/datagouv.queries.ts" */

/** 'GetUtilisateursStatsDb' parameters type */
export type IGetUtilisateursStatsDbParams = void;

/** 'GetUtilisateursStatsDb' return type */
export interface IGetUtilisateursStatsDbResult {
  administration_id: string | null;
  role: string;
}

/** 'GetUtilisateursStatsDb' query type */
export interface IGetUtilisateursStatsDbQuery {
  params: IGetUtilisateursStatsDbParams;
  result: IGetUtilisateursStatsDbResult;
}

