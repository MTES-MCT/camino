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
  entreprise_document_type_id: string;
  entreprise_id: string | null;
  id: string;
  largeobject_id: number;
}

/** 'GetEntrepriseDocumentLargeObjectIdsByEtapeIdQuery' query type */
export interface IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryQuery {
  params: IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryParams;
  result: IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryResult;
}

/** 'UpdateEtapeDocumentFileDb' parameters type */
export interface IUpdateEtapeDocumentFileDbParams {
  id: string;
  largeobject_id: number;
}

/** 'UpdateEtapeDocumentFileDb' return type */
export type IUpdateEtapeDocumentFileDbResult = void;

/** 'UpdateEtapeDocumentFileDb' query type */
export interface IUpdateEtapeDocumentFileDbQuery {
  params: IUpdateEtapeDocumentFileDbParams;
  result: IUpdateEtapeDocumentFileDbResult;
}

/** 'UpdateEtapeDocumentInfoDb' parameters type */
export interface IUpdateEtapeDocumentInfoDbParams {
  description?: string | null | void;
  entreprises_lecture: boolean;
  id: string;
  public_lecture: boolean;
}

/** 'UpdateEtapeDocumentInfoDb' return type */
export type IUpdateEtapeDocumentInfoDbResult = void;

/** 'UpdateEtapeDocumentInfoDb' query type */
export interface IUpdateEtapeDocumentInfoDbQuery {
  params: IUpdateEtapeDocumentInfoDbParams;
  result: IUpdateEtapeDocumentInfoDbResult;
}

/** 'DeleteEtapeDocumentsDb' parameters type */
export interface IDeleteEtapeDocumentsDbParams {
  ids: readonly (string)[];
}

/** 'DeleteEtapeDocumentsDb' return type */
export type IDeleteEtapeDocumentsDbResult = void;

/** 'DeleteEtapeDocumentsDb' query type */
export interface IDeleteEtapeDocumentsDbQuery {
  params: IDeleteEtapeDocumentsDbParams;
  result: IDeleteEtapeDocumentsDbResult;
}

/** 'InsertEtapeDocumentDb' parameters type */
export interface IInsertEtapeDocumentDbParams {
  description?: string | null | void;
  entreprises_lecture: boolean;
  etape_document_type_id: string;
  etape_id: string;
  id: string;
  largeobject_id: number;
  public_lecture: boolean;
}

/** 'InsertEtapeDocumentDb' return type */
export type IInsertEtapeDocumentDbResult = void;

/** 'InsertEtapeDocumentDb' query type */
export interface IInsertEtapeDocumentDbQuery {
  params: IInsertEtapeDocumentDbParams;
  result: IInsertEtapeDocumentDbResult;
}

/** 'GetTitulairesByEtapeIdQueryDb' parameters type */
export interface IGetTitulairesByEtapeIdQueryDbParams {
  etapeId: string;
}

/** 'GetTitulairesByEtapeIdQueryDb' return type */
export interface IGetTitulairesByEtapeIdQueryDbResult {
  id: string;
  nom: string;
  operateur: boolean | null;
}

/** 'GetTitulairesByEtapeIdQueryDb' query type */
export interface IGetTitulairesByEtapeIdQueryDbQuery {
  params: IGetTitulairesByEtapeIdQueryDbParams;
  result: IGetTitulairesByEtapeIdQueryDbResult;
}

/** 'GetAmodiatairesByEtapeIdQueryDb' parameters type */
export interface IGetAmodiatairesByEtapeIdQueryDbParams {
  etapeId: string;
}

/** 'GetAmodiatairesByEtapeIdQueryDb' return type */
export interface IGetAmodiatairesByEtapeIdQueryDbResult {
  id: string;
  nom: string;
  operateur: boolean | null;
}

/** 'GetAmodiatairesByEtapeIdQueryDb' query type */
export interface IGetAmodiatairesByEtapeIdQueryDbQuery {
  params: IGetAmodiatairesByEtapeIdQueryDbParams;
  result: IGetAmodiatairesByEtapeIdQueryDbResult;
}

/** 'GetDocumentsByEtapeIdQuery' parameters type */
export interface IGetDocumentsByEtapeIdQueryParams {
  titre_etape_id: string;
}

/** 'GetDocumentsByEtapeIdQuery' return type */
export interface IGetDocumentsByEtapeIdQueryResult {
  description: string | null;
  entreprises_lecture: boolean;
  etape_document_type_id: string;
  id: string;
  public_lecture: boolean;
}

/** 'GetDocumentsByEtapeIdQuery' query type */
export interface IGetDocumentsByEtapeIdQueryQuery {
  params: IGetDocumentsByEtapeIdQueryParams;
  result: IGetDocumentsByEtapeIdQueryResult;
}

