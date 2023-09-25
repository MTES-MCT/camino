/** Types generated for queries found in "src/api/rest/activites.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type JsonArray = (Json)[];

/** 'UpdateActiviteDb' parameters type */
export interface IUpdateActiviteDbParams {
  activiteId?: string | null | void;
  activiteStatutId: string;
  contenu: Json;
  dateSaisie: string;
  userId: string;
}

/** 'UpdateActiviteDb' return type */
export type IUpdateActiviteDbResult = void;

/** 'UpdateActiviteDb' query type */
export interface IUpdateActiviteDbQuery {
  params: IUpdateActiviteDbParams;
  result: IUpdateActiviteDbResult;
}

/** 'GetActiviteByIdQuery' parameters type */
export interface IGetActiviteByIdQueryParams {
  activiteId: string;
}

/** 'GetActiviteByIdQuery' return type */
export interface IGetActiviteByIdQueryResult {
  activite_statut_id: string;
  annee: number;
  contenu: Json | null;
  date: string;
  date_saisie: string | null;
  id: string;
  periode_id: number;
  sections: JsonArray;
  slug: string;
  suppression: boolean;
  titre_id: string | null;
  titre_nom: string;
  titre_slug: string;
  type_id: string;
  utilisateur_id: string | null;
}

/** 'GetActiviteByIdQuery' query type */
export interface IGetActiviteByIdQueryQuery {
  params: IGetActiviteByIdQueryParams;
  result: IGetActiviteByIdQueryResult;
}

/** 'ActiviteDeleteDb' parameters type */
export interface IActiviteDeleteDbParams {
  activiteId: string;
}

/** 'ActiviteDeleteDb' return type */
export type IActiviteDeleteDbResult = void;

/** 'ActiviteDeleteDb' query type */
export interface IActiviteDeleteDbQuery {
  params: IActiviteDeleteDbParams;
  result: IActiviteDeleteDbResult;
}

/** 'ActiviteDocumentDeleteDb' parameters type */
export interface IActiviteDocumentDeleteDbParams {
  activiteId: string;
}

/** 'ActiviteDocumentDeleteDb' return type */
export type IActiviteDocumentDeleteDbResult = void;

/** 'ActiviteDocumentDeleteDb' query type */
export interface IActiviteDocumentDeleteDbQuery {
  params: IActiviteDocumentDeleteDbParams;
  result: IActiviteDocumentDeleteDbResult;
}

/** 'GetActivitesByTitreIdQuery' parameters type */
export interface IGetActivitesByTitreIdQueryParams {
  titreId: string;
}

/** 'GetActivitesByTitreIdQuery' return type */
export interface IGetActivitesByTitreIdQueryResult {
  activite_statut_id: string;
  annee: number;
  contenu: Json | null;
  date: string;
  date_saisie: string | null;
  id: string;
  periode_id: number;
  sections: JsonArray;
  slug: string;
  suppression: boolean;
  titre_id: string | null;
  titre_nom: string;
  titre_slug: string;
  type_id: string;
  utilisateur_id: string | null;
}

/** 'GetActivitesByTitreIdQuery' query type */
export interface IGetActivitesByTitreIdQueryQuery {
  params: IGetActivitesByTitreIdQueryParams;
  result: IGetActivitesByTitreIdQueryResult;
}

/** 'GetAdministrationsLocalesByActiviteId' parameters type */
export interface IGetAdministrationsLocalesByActiviteIdParams {
  activiteId: string;
}

/** 'GetAdministrationsLocalesByActiviteId' return type */
export interface IGetAdministrationsLocalesByActiviteIdResult {
  administrations_locales: Json | null;
}

/** 'GetAdministrationsLocalesByActiviteId' query type */
export interface IGetAdministrationsLocalesByActiviteIdQuery {
  params: IGetAdministrationsLocalesByActiviteIdParams;
  result: IGetAdministrationsLocalesByActiviteIdResult;
}

/** 'GetTitreTypeIdByActiviteId' parameters type */
export interface IGetTitreTypeIdByActiviteIdParams {
  activiteId: string;
}

/** 'GetTitreTypeIdByActiviteId' return type */
export interface IGetTitreTypeIdByActiviteIdResult {
  titre_type_id: string;
}

/** 'GetTitreTypeIdByActiviteId' query type */
export interface IGetTitreTypeIdByActiviteIdQuery {
  params: IGetTitreTypeIdByActiviteIdParams;
  result: IGetTitreTypeIdByActiviteIdResult;
}

/** 'GetTitulairesAmodiatairesTitreActivite' parameters type */
export interface IGetTitulairesAmodiatairesTitreActiviteParams {
  activiteId: string;
}

/** 'GetTitulairesAmodiatairesTitreActivite' return type */
export interface IGetTitulairesAmodiatairesTitreActiviteResult {
  id: string;
}

/** 'GetTitulairesAmodiatairesTitreActivite' query type */
export interface IGetTitulairesAmodiatairesTitreActiviteQuery {
  params: IGetTitulairesAmodiatairesTitreActiviteParams;
  result: IGetTitulairesAmodiatairesTitreActiviteResult;
}

/** 'GetActiviteDocumentsInternal' parameters type */
export interface IGetActiviteDocumentsInternalParams {
  activiteId: string;
}

/** 'GetActiviteDocumentsInternal' return type */
export interface IGetActiviteDocumentsInternalResult {
  activite_document_type_id: string;
  description: string | null;
  id: string;
}

/** 'GetActiviteDocumentsInternal' query type */
export interface IGetActiviteDocumentsInternalQuery {
  params: IGetActiviteDocumentsInternalParams;
  result: IGetActiviteDocumentsInternalResult;
}

/** 'DeleteActiviteDocumentQuery' parameters type */
export interface IDeleteActiviteDocumentQueryParams {
  id: string;
}

/** 'DeleteActiviteDocumentQuery' return type */
export type IDeleteActiviteDocumentQueryResult = void;

/** 'DeleteActiviteDocumentQuery' query type */
export interface IDeleteActiviteDocumentQueryQuery {
  params: IDeleteActiviteDocumentQueryParams;
  result: IDeleteActiviteDocumentQueryResult;
}

/** 'InsertActiviteDocumentInternal' parameters type */
export interface IInsertActiviteDocumentInternalParams {
  activite_document_type_id: string;
  activite_id: string;
  date: string;
  description: string;
  id: string;
  largeobject_id: number;
}

/** 'InsertActiviteDocumentInternal' return type */
export interface IInsertActiviteDocumentInternalResult {
  id: string;
}

/** 'InsertActiviteDocumentInternal' query type */
export interface IInsertActiviteDocumentInternalQuery {
  params: IInsertActiviteDocumentInternalParams;
  result: IInsertActiviteDocumentInternalResult;
}

/** 'GetLargeobjectIdByActiviteDocumentIdInternal' parameters type */
export interface IGetLargeobjectIdByActiviteDocumentIdInternalParams {
  activiteDocumentId: string;
}

/** 'GetLargeobjectIdByActiviteDocumentIdInternal' return type */
export interface IGetLargeobjectIdByActiviteDocumentIdInternalResult {
  activite_id: string | null;
  largeobject_id: number | null;
}

/** 'GetLargeobjectIdByActiviteDocumentIdInternal' query type */
export interface IGetLargeobjectIdByActiviteDocumentIdInternalQuery {
  params: IGetLargeobjectIdByActiviteDocumentIdInternalParams;
  result: IGetLargeobjectIdByActiviteDocumentIdInternalResult;
}

/** 'GetActiviteDocumentIdsInternal' parameters type */
export type IGetActiviteDocumentIdsInternalParams = void;

/** 'GetActiviteDocumentIdsInternal' return type */
export interface IGetActiviteDocumentIdsInternalResult {
  activite_id: string | null;
  id: string;
}

/** 'GetActiviteDocumentIdsInternal' query type */
export interface IGetActiviteDocumentIdsInternalQuery {
  params: IGetActiviteDocumentIdsInternalParams;
  result: IGetActiviteDocumentIdsInternalResult;
}

