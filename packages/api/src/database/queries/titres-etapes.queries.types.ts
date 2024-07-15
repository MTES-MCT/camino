/** Types generated for queries found in "src/database/queries/titres-etapes.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

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

/** 'UpdateEtapeAvisFileDb' parameters type */
export interface IUpdateEtapeAvisFileDbParams {
  id: string;
  largeobject_id: number;
}

/** 'UpdateEtapeAvisFileDb' return type */
export type IUpdateEtapeAvisFileDbResult = void;

/** 'UpdateEtapeAvisFileDb' query type */
export interface IUpdateEtapeAvisFileDbQuery {
  params: IUpdateEtapeAvisFileDbParams;
  result: IUpdateEtapeAvisFileDbResult;
}

/** 'UpdateEtapeAvisInfoDb' parameters type */
export interface IUpdateEtapeAvisInfoDbParams {
  avis_statut_id: string;
  avis_type_id: string;
  avis_visibility_id: string;
  date: string;
  description?: string | null | void;
  id: string;
}

/** 'UpdateEtapeAvisInfoDb' return type */
export type IUpdateEtapeAvisInfoDbResult = void;

/** 'UpdateEtapeAvisInfoDb' query type */
export interface IUpdateEtapeAvisInfoDbQuery {
  params: IUpdateEtapeAvisInfoDbParams;
  result: IUpdateEtapeAvisInfoDbResult;
}

/** 'DeleteEtapeAvisDb' parameters type */
export interface IDeleteEtapeAvisDbParams {
  ids: readonly (string)[];
}

/** 'DeleteEtapeAvisDb' return type */
export type IDeleteEtapeAvisDbResult = void;

/** 'DeleteEtapeAvisDb' query type */
export interface IDeleteEtapeAvisDbQuery {
  params: IDeleteEtapeAvisDbParams;
  result: IDeleteEtapeAvisDbResult;
}

/** 'InsertEtapeAvisDb' parameters type */
export interface IInsertEtapeAvisDbParams {
  avis_statut_id: string;
  avis_type_id: string;
  avis_visibility_id: string;
  date: string;
  description: string;
  etape_id: string;
  id: string;
  largeobject_id: number;
}

/** 'InsertEtapeAvisDb' return type */
export type IInsertEtapeAvisDbResult = void;

/** 'InsertEtapeAvisDb' query type */
export interface IInsertEtapeAvisDbQuery {
  params: IInsertEtapeAvisDbParams;
  result: IInsertEtapeAvisDbResult;
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
  largeobject_id: number;
  public_lecture: boolean;
}

/** 'GetDocumentsByEtapeIdQuery' query type */
export interface IGetDocumentsByEtapeIdQueryQuery {
  params: IGetDocumentsByEtapeIdQueryParams;
  result: IGetDocumentsByEtapeIdQueryResult;
}

/** 'GetAvisByEtapeIdQuery' parameters type */
export interface IGetAvisByEtapeIdQueryParams {
  titre_etape_id: string;
}

/** 'GetAvisByEtapeIdQuery' return type */
export interface IGetAvisByEtapeIdQueryResult {
  avis_statut_id: string;
  avis_type_id: string;
  avis_visibility_id: string;
  date: string;
  description: string;
  id: string;
  largeobject_id: number | null;
}

/** 'GetAvisByEtapeIdQuery' query type */
export interface IGetAvisByEtapeIdQueryQuery {
  params: IGetAvisByEtapeIdQueryParams;
  result: IGetAvisByEtapeIdQueryResult;
}

/** 'GetLargeobjectIdByEtapeAvisIdInternal' parameters type */
export interface IGetLargeobjectIdByEtapeAvisIdInternalParams {
  etapeAvisId: string;
}

/** 'GetLargeobjectIdByEtapeAvisIdInternal' return type */
export interface IGetLargeobjectIdByEtapeAvisIdInternalResult {
  avis_visibility_id: string;
  etape_id: string;
  largeobject_id: number | null;
}

/** 'GetLargeobjectIdByEtapeAvisIdInternal' query type */
export interface IGetLargeobjectIdByEtapeAvisIdInternalQuery {
  params: IGetLargeobjectIdByEtapeAvisIdInternalParams;
  result: IGetLargeobjectIdByEtapeAvisIdInternalResult;
}

/** 'GetParticipationEtapesDb' parameters type */
export type IGetParticipationEtapesDbParams = void;

/** 'GetParticipationEtapesDb' return type */
export interface IGetParticipationEtapesDbResult {
  contenu: Json | null;
  date: string;
  etape_statut_id: string;
  id: string;
}

/** 'GetParticipationEtapesDb' query type */
export interface IGetParticipationEtapesDbQuery {
  params: IGetParticipationEtapesDbParams;
  result: IGetParticipationEtapesDbResult;
}

