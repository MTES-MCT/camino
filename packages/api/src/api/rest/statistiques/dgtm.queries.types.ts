/** Types generated for queries found in "src/api/rest/statistiques/dgtm.queries.ts" */

/** 'GetProductionOr' parameters type */
export interface IGetProductionOrParams {
  substance?: string | null | void;
}

/** 'GetProductionOr' return type */
export interface IGetProductionOrResult {
  annee: number;
  count: string | null;
}

/** 'GetProductionOr' query type */
export interface IGetProductionOrQuery {
  params: IGetProductionOrParams;
  result: IGetProductionOrResult;
}

