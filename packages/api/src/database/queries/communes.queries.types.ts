/** Types generated for queries found in "src/database/queries/communes.queries.ts" */

/** 'GetCommunes' parameters type */
export interface IGetCommunesParams {
  ids: readonly (string | null | void)[];
}

/** 'GetCommunes' return type */
export interface IGetCommunesResult {
  id: string;
  nom: string;
}

/** 'GetCommunes' query type */
export interface IGetCommunesQuery {
  params: IGetCommunesParams;
  result: IGetCommunesResult;
}

/** 'InsertCommune' parameters type */
export interface IInsertCommuneParams {
  id?: string | null | void;
  nom?: string | null | void;
}

/** 'InsertCommune' return type */
export type IInsertCommuneResult = void;

/** 'InsertCommune' query type */
export interface IInsertCommuneQuery {
  params: IInsertCommuneParams;
  result: IInsertCommuneResult;
}

