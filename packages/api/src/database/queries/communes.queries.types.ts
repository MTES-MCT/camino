/** Types generated for queries found in "src/database/queries/communes.queries.ts" */

/** 'GetCommunesInternal' parameters type */
export interface IGetCommunesInternalParams {
  ids: readonly (string | null | void)[];
}

/** 'GetCommunesInternal' return type */
export interface IGetCommunesInternalResult {
  id: string;
  nom: string;
}

/** 'GetCommunesInternal' query type */
export interface IGetCommunesInternalQuery {
  params: IGetCommunesInternalParams;
  result: IGetCommunesInternalResult;
}

/** 'GetCommuneIdsInternal' parameters type */
export type IGetCommuneIdsInternalParams = void;

/** 'GetCommuneIdsInternal' return type */
export interface IGetCommuneIdsInternalResult {
  id: string;
}

/** 'GetCommuneIdsInternal' query type */
export interface IGetCommuneIdsInternalQuery {
  params: IGetCommuneIdsInternalParams;
  result: IGetCommuneIdsInternalResult;
}

/** 'InsertCommuneInternal' parameters type */
export interface IInsertCommuneInternalParams {
  geometry?: unknown | void;
  id?: string | null | void;
  nom?: string | null | void;
}

/** 'InsertCommuneInternal' return type */
export type IInsertCommuneInternalResult = void;

/** 'InsertCommuneInternal' query type */
export interface IInsertCommuneInternalQuery {
  params: IInsertCommuneInternalParams;
  result: IInsertCommuneInternalResult;
}
