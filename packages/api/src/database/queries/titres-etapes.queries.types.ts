/** Types generated for queries found in "src/database/queries/titres-etapes.queries.ts" */

/** 'InsertTitreEtapeEntrepriseDocument' parameters type */
export interface IInsertTitreEtapeEntrepriseDocumentParams {
  entreprise_document_id?: string | null | void;
  titre_etape_id?: string | null | void;
}

/** 'InsertTitreEtapeEntrepriseDocument' return type */
export type IInsertTitreEtapeEntrepriseDocumentResult = void;

/** 'InsertTitreEtapeEntrepriseDocument' query type */
export interface IInsertTitreEtapeEntrepriseDocumentQuery {
  params: IInsertTitreEtapeEntrepriseDocumentParams;
  result: IInsertTitreEtapeEntrepriseDocumentResult;
}

/** 'DeleteTitreEtapeEntrepriseDocument' parameters type */
export interface IDeleteTitreEtapeEntrepriseDocumentParams {
  titre_etape_id?: string | null | void;
}

/** 'DeleteTitreEtapeEntrepriseDocument' return type */
export type IDeleteTitreEtapeEntrepriseDocumentResult = void;

/** 'DeleteTitreEtapeEntrepriseDocument' query type */
export interface IDeleteTitreEtapeEntrepriseDocumentQuery {
  params: IDeleteTitreEtapeEntrepriseDocumentParams;
  result: IDeleteTitreEtapeEntrepriseDocumentResult;
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

