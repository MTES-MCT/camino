/** Types generated for queries found in "src/api/rest/statistiques/dgtm.queries.ts" */

/** 'GetProductionOrDb' parameters type */
export interface IGetProductionOrDbParams {
  substance?: string | null | void;
}

/** 'GetProductionOrDb' return type */
export interface IGetProductionOrDbResult {
  annee: number;
  count: string | null;
}

/** 'GetProductionOrDb' query type */
export interface IGetProductionOrDbQuery {
  params: IGetProductionOrDbParams;
  result: IGetProductionOrDbResult;
}

