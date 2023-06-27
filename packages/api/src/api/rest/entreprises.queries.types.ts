/** Types generated for queries found in "src/api/rest/entreprises.queries.ts" */

/** 'GetEntrepriseDocumentsInternal' parameters type */
export interface IGetEntrepriseDocumentsInternalParams {
  entrepriseId?: string | null | void;
}

/** 'GetEntrepriseDocumentsInternal' return type */
export interface IGetEntrepriseDocumentsInternalResult {
  can_delete_document: boolean | null;
  date: string;
  description: string;
  id: string;
  type_id: string;
}

/** 'GetEntrepriseDocumentsInternal' query type */
export interface IGetEntrepriseDocumentsInternalQuery {
  params: IGetEntrepriseDocumentsInternalParams;
  result: IGetEntrepriseDocumentsInternalResult;
}

/** 'InsertEntrepriseDocumentInternal' parameters type */
export interface IInsertEntrepriseDocumentInternalParams {
  date?: string | null | void;
  description?: string | null | void;
  entreprise_id?: string | null | void;
  entreprises_lecture?: boolean | null | void;
  fichier?: boolean | null | void;
  fichier_type_id?: string | null | void;
  id?: string | null | void;
  public_lecture?: boolean | null | void;
  type_id?: string | null | void;
}

/** 'InsertEntrepriseDocumentInternal' return type */
export interface IInsertEntrepriseDocumentInternalResult {
  id: string;
}

/** 'InsertEntrepriseDocumentInternal' query type */
export interface IInsertEntrepriseDocumentInternalQuery {
  params: IInsertEntrepriseDocumentInternalParams;
  result: IInsertEntrepriseDocumentInternalResult;
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

