/** Types generated for queries found in "src/api/rest/entreprises.queries.ts" */

/** 'GetEntrepriseDocumentsInternal' parameters type */
export interface IGetEntrepriseDocumentsInternalParams {
  entrepriseDocumentIds: readonly (string | null | void)[];
  entrepriseIds: readonly (string | null | void)[];
}

/** 'GetEntrepriseDocumentsInternal' return type */
export interface IGetEntrepriseDocumentsInternalResult {
  can_delete_document: boolean | null;
  date: string;
  description: string | null;
  entreprise_document_type_id: string;
  entreprise_id: string | null;
  id: string;
}

/** 'GetEntrepriseDocumentsInternal' query type */
export interface IGetEntrepriseDocumentsInternalQuery {
  params: IGetEntrepriseDocumentsInternalParams;
  result: IGetEntrepriseDocumentsInternalResult;
}

/** 'InsertEntrepriseDocument' parameters type */
export interface IInsertEntrepriseDocumentParams {
  date?: string | null | void;
  description?: string | null | void;
  entreprise_document_type_id?: string | null | void;
  entreprise_id?: string | null | void;
  id?: string | null | void;
}

/** 'InsertEntrepriseDocument' return type */
export interface IInsertEntrepriseDocumentResult {
  id: string;
}

/** 'InsertEntrepriseDocument' query type */
export interface IInsertEntrepriseDocumentQuery {
  params: IInsertEntrepriseDocumentParams;
  result: IInsertEntrepriseDocumentResult;
}

/** 'DeleteEntrepriseDocumentQuery' parameters type */
export interface IDeleteEntrepriseDocumentQueryParams {
  entrepriseId?: string | null | void;
  id?: string | null | void;
}

/** 'DeleteEntrepriseDocumentQuery' return type */
export type IDeleteEntrepriseDocumentQueryResult = void;

/** 'DeleteEntrepriseDocumentQuery' query type */
export interface IDeleteEntrepriseDocumentQueryQuery {
  params: IDeleteEntrepriseDocumentQueryParams;
  result: IDeleteEntrepriseDocumentQueryResult;
}

