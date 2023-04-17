/** Types generated for queries found in "src/business/processes/titres-phases-update.queries.ts" */

/** 'UpdateDatesDemarche' parameters type */
export interface IUpdateDatesDemarcheParams {
  demarcheId?: string | null | void;
  newDateDebut?: string | null | void;
  newDateFin?: string | null | void;
}

/** 'UpdateDatesDemarche' return type */
export type IUpdateDatesDemarcheResult = void;

/** 'UpdateDatesDemarche' query type */
export interface IUpdateDatesDemarcheQuery {
  params: IUpdateDatesDemarcheParams;
  result: IUpdateDatesDemarcheResult;
}

