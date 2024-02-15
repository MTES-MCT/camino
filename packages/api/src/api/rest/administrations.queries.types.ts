/** Types generated for queries found in "src/api/rest/administrations.queries.ts" */

/** 'GetUtilisateursByAdministrationIdDb' parameters type */
export interface IGetUtilisateursByAdministrationIdDbParams {
  administrationId: string;
}

/** 'GetUtilisateursByAdministrationIdDb' return type */
export interface IGetUtilisateursByAdministrationIdDbResult {
  administration_id: string | null;
  email: string | null;
  id: string;
  nom: string | null;
  prenom: string | null;
  role: string;
}

/** 'GetUtilisateursByAdministrationIdDb' query type */
export interface IGetUtilisateursByAdministrationIdDbQuery {
  params: IGetUtilisateursByAdministrationIdDbParams;
  result: IGetUtilisateursByAdministrationIdDbResult;
}

/** 'GetActiviteTypeEmailsByAdministrationIdDb' parameters type */
export interface IGetActiviteTypeEmailsByAdministrationIdDbParams {
  administrationId: string;
}

/** 'GetActiviteTypeEmailsByAdministrationIdDb' return type */
export interface IGetActiviteTypeEmailsByAdministrationIdDbResult {
  activite_type_id: string;
  email: string;
}

/** 'GetActiviteTypeEmailsByAdministrationIdDb' query type */
export interface IGetActiviteTypeEmailsByAdministrationIdDbQuery {
  params: IGetActiviteTypeEmailsByAdministrationIdDbParams;
  result: IGetActiviteTypeEmailsByAdministrationIdDbResult;
}

/** 'DeleteAdministrationActiviteTypeEmailDb' parameters type */
export interface IDeleteAdministrationActiviteTypeEmailDbParams {
  activite_type_id: string;
  administrationId: string;
  email: string;
}

/** 'DeleteAdministrationActiviteTypeEmailDb' return type */
export type IDeleteAdministrationActiviteTypeEmailDbResult = void;

/** 'DeleteAdministrationActiviteTypeEmailDb' query type */
export interface IDeleteAdministrationActiviteTypeEmailDbQuery {
  params: IDeleteAdministrationActiviteTypeEmailDbParams;
  result: IDeleteAdministrationActiviteTypeEmailDbResult;
}

/** 'InsertAdministrationActiviteTypeEmailDb' parameters type */
export interface IInsertAdministrationActiviteTypeEmailDbParams {
  activite_type_id: string;
  administrationId: string;
  email: string;
}

/** 'InsertAdministrationActiviteTypeEmailDb' return type */
export type IInsertAdministrationActiviteTypeEmailDbResult = void;

/** 'InsertAdministrationActiviteTypeEmailDb' query type */
export interface IInsertAdministrationActiviteTypeEmailDbQuery {
  params: IInsertAdministrationActiviteTypeEmailDbParams;
  result: IInsertAdministrationActiviteTypeEmailDbResult;
}

/** 'GetActiviteTypeEmailsByAdministrationIdsDb' parameters type */
export interface IGetActiviteTypeEmailsByAdministrationIdsDbParams {
  administrationIds: string;
}

/** 'GetActiviteTypeEmailsByAdministrationIdsDb' return type */
export interface IGetActiviteTypeEmailsByAdministrationIdsDbResult {
  activite_type_id: string;
  administration_id: string;
  email: string;
}

/** 'GetActiviteTypeEmailsByAdministrationIdsDb' query type */
export interface IGetActiviteTypeEmailsByAdministrationIdsDbQuery {
  params: IGetActiviteTypeEmailsByAdministrationIdsDbParams;
  result: IGetActiviteTypeEmailsByAdministrationIdsDbResult;
}

