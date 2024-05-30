/** Types generated for queries found in "src/api/rest/logs.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertLogInternal' parameters type */
export interface IInsertLogInternalParams {
  body?: Json | null | void;
  method: string;
  path: string;
  utilisateur_id: string;
}

/** 'InsertLogInternal' return type */
export type IInsertLogInternalResult = void;

/** 'InsertLogInternal' query type */
export interface IInsertLogInternalQuery {
  params: IInsertLogInternalParams;
  result: IInsertLogInternalResult;
}

