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

/** 'GetLargeobjectIdByEntrepriseDocumentIdInternal' parameters type */
export interface IGetLargeobjectIdByEntrepriseDocumentIdInternalParams {
  entrepriseDocumentId: string;
}

/** 'GetLargeobjectIdByEntrepriseDocumentIdInternal' return type */
export interface IGetLargeobjectIdByEntrepriseDocumentIdInternalResult {
  entreprise_id: string | null;
  largeobject_id: number;
}

/** 'GetLargeobjectIdByEntrepriseDocumentIdInternal' query type */
export interface IGetLargeobjectIdByEntrepriseDocumentIdInternalQuery {
  params: IGetLargeobjectIdByEntrepriseDocumentIdInternalParams;
  result: IGetLargeobjectIdByEntrepriseDocumentIdInternalResult;
}

/** 'InsertEntrepriseDocumentInternal' parameters type */
export interface IInsertEntrepriseDocumentInternalParams {
  date?: string | null | void;
  description?: string | null | void;
  entreprise_document_type_id?: string | null | void;
  entreprise_id?: string | null | void;
  id?: string | null | void;
  largeobject_id: number;
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
  entrepriseId: string;
  id?: string | null | void;
}

/** 'DeleteEntrepriseDocumentQuery' return type */
export type IDeleteEntrepriseDocumentQueryResult = void;

/** 'DeleteEntrepriseDocumentQuery' query type */
export interface IDeleteEntrepriseDocumentQueryQuery {
  params: IDeleteEntrepriseDocumentQueryParams;
  result: IDeleteEntrepriseDocumentQueryResult;
}

/** 'GetEntrepriseDb' parameters type */
export interface IGetEntrepriseDbParams {
  entreprise_id: string;
}

/** 'GetEntrepriseDb' return type */
export interface IGetEntrepriseDbResult {
  adresse: string | null;
  archive: boolean;
  categorie: string | null;
  code_postal: string | null;
  commune: string | null;
  email: string | null;
  id: string;
  legal_etranger: string | null;
  legal_forme: string | null;
  legal_siren: string | null;
  nom: string;
  telephone: string | null;
  url: string | null;
}

/** 'GetEntrepriseDb' query type */
export interface IGetEntrepriseDbQuery {
  params: IGetEntrepriseDbParams;
  result: IGetEntrepriseDbResult;
}

/** 'GetEntreprisesDb' parameters type */
export type IGetEntreprisesDbParams = void;

/** 'GetEntreprisesDb' return type */
export interface IGetEntreprisesDbResult {
  adresse: string | null;
  categorie: string | null;
  code_postal: string | null;
  commune: string | null;
  id: string;
  legal_etranger: string | null;
  legal_siren: string | null;
  nom: string;
}

/** 'GetEntreprisesDb' query type */
export interface IGetEntreprisesDbQuery {
  params: IGetEntreprisesDbParams;
  result: IGetEntreprisesDbResult;
}

/** 'GetEntrepriseUtilisateursDb' parameters type */
export interface IGetEntrepriseUtilisateursDbParams {
  entreprise_id: string;
}

/** 'GetEntrepriseUtilisateursDb' return type */
export interface IGetEntrepriseUtilisateursDbResult {
  email: string | null;
}

/** 'GetEntrepriseUtilisateursDb' query type */
export interface IGetEntrepriseUtilisateursDbQuery {
  params: IGetEntrepriseUtilisateursDbParams;
  result: IGetEntrepriseUtilisateursDbResult;
}

