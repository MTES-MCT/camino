/** Types generated for queries found in "src/api/rest/entreprises.queries.ts" */

/** 'GetEntrepriseDocuments' parameters type */
export interface IGetEntrepriseDocumentsParams {
  entrepriseId?: string | null | void;
}

/** 'GetEntrepriseDocuments' return type */
export interface IGetEntrepriseDocumentsResult {
  can_delete_document: boolean | null;
  date: string;
  description: string;
  id: string;
  type_id: string;
}

/** 'GetEntrepriseDocuments' query type */
export interface IGetEntrepriseDocumentsQuery {
  params: IGetEntrepriseDocumentsParams;
  result: IGetEntrepriseDocumentsResult;
}

/** 'InsertEntrepriseDocument' parameters type */
export interface IInsertEntrepriseDocumentParams {
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

