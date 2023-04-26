/** Types generated for queries found in "src/business/processes/titres-phases-update.queries.ts" */

/** 'UpdateDatesDemarcheDb' parameters type */
export interface IUpdateDatesDemarcheDbParams {
  demarcheId?: string | null | void;
  newDateDebut?: string | null | void;
  newDateFin?: string | null | void;
}

/** 'UpdateDatesDemarcheDb' return type */
export type IUpdateDatesDemarcheDbResult = void;

/** 'UpdateDatesDemarcheDb' query type */
export interface IUpdateDatesDemarcheDbQuery {
  params: IUpdateDatesDemarcheDbParams;
  result: IUpdateDatesDemarcheDbResult;
}

