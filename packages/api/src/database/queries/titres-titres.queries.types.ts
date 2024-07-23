/** Types generated for queries found in "src/database/queries/titres-titres.queries.ts" */

/** 'DeleteTitreTitreInternal' parameters type */
export interface IDeleteTitreTitreInternalParams {
  linkTo: string;
}

/** 'DeleteTitreTitreInternal' return type */
export type IDeleteTitreTitreInternalResult = void;

/** 'DeleteTitreTitreInternal' query type */
export interface IDeleteTitreTitreInternalQuery {
  params: IDeleteTitreTitreInternalParams;
  result: IDeleteTitreTitreInternalResult;
}

/** 'InsertTitreTitreInternal' parameters type */
export interface IInsertTitreTitreInternalParams {
  linkTo: string;
  titreFromId: string;
}

/** 'InsertTitreTitreInternal' return type */
export type IInsertTitreTitreInternalResult = void;

/** 'InsertTitreTitreInternal' query type */
export interface IInsertTitreTitreInternalQuery {
  params: IInsertTitreTitreInternalParams;
  result: IInsertTitreTitreInternalResult;
}

