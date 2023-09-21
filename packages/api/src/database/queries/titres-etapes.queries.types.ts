/** Types generated for queries found in "src/database/queries/titres-etapes.queries.ts" */

/** 'InsertTitreEtapeEntrepriseDocumentInternal' parameters type */
export interface IInsertTitreEtapeEntrepriseDocumentInternalParams {
  entreprise_document_id?: string | null | void;
  titre_etape_id?: string | null | void;
}

/** 'InsertTitreEtapeEntrepriseDocumentInternal' return type */
export type IInsertTitreEtapeEntrepriseDocumentInternalResult = void;

/** 'InsertTitreEtapeEntrepriseDocumentInternal' query type */
export interface IInsertTitreEtapeEntrepriseDocumentInternalQuery {
  params: IInsertTitreEtapeEntrepriseDocumentInternalParams;
  result: IInsertTitreEtapeEntrepriseDocumentInternalResult;
}

/** 'DeleteTitreEtapeEntrepriseDocumentInternal' parameters type */
export interface IDeleteTitreEtapeEntrepriseDocumentInternalParams {
  titre_etape_id?: string | null | void;
}

/** 'DeleteTitreEtapeEntrepriseDocumentInternal' return type */
export type IDeleteTitreEtapeEntrepriseDocumentInternalResult = void;

/** 'DeleteTitreEtapeEntrepriseDocumentInternal' query type */
export interface IDeleteTitreEtapeEntrepriseDocumentInternalQuery {
  params: IDeleteTitreEtapeEntrepriseDocumentInternalParams;
  result: IDeleteTitreEtapeEntrepriseDocumentInternalResult;
}

/** 'GetEntrepriseDocumentIdsByEtapeIdQuery' parameters type */
export interface IGetEntrepriseDocumentIdsByEtapeIdQueryParams {
  titre_etape_id?: string | null | void;
}

/** 'GetEntrepriseDocumentIdsByEtapeIdQuery' return type */
export interface IGetEntrepriseDocumentIdsByEtapeIdQueryResult {
  date: string;
  description: string | null;
  entreprise_document_type_id: string;
  entreprise_id: string | null;
  id: string;
}

/** 'GetEntrepriseDocumentIdsByEtapeIdQuery' query type */
export interface IGetEntrepriseDocumentIdsByEtapeIdQueryQuery {
  params: IGetEntrepriseDocumentIdsByEtapeIdQueryParams;
  result: IGetEntrepriseDocumentIdsByEtapeIdQueryResult;
}

/** 'GetEntrepriseDocumentLargeObjectIdsByEtapeIdQuery' parameters type */
export interface IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryParams {
  titre_etape_id?: string | null | void;
}

/** 'GetEntrepriseDocumentLargeObjectIdsByEtapeIdQuery' return type */
export interface IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryResult {
  entreprise_id: string | null;
  id: string;
  largeobject_id: number;
}

/** 'GetEntrepriseDocumentLargeObjectIdsByEtapeIdQuery' query type */
export interface IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryQuery {
  params: IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryParams;
  result: IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryResult;
}

