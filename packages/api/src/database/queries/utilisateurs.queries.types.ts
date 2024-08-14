/** Types generated for queries found in "src/database/queries/utilisateurs.queries.ts" */
export type stringArray = (string)[];

/** 'GetUtilisateursDb' parameters type */
export type IGetUtilisateursDbParams = void;

/** 'GetUtilisateursDb' return type */
export interface IGetUtilisateursDbResult {
  administration_id: string | null;
  email: string | null;
  entreprise_ids: stringArray | null;
  id: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  telephone_fixe: string | null;
  telephone_mobile: string | null;
}

/** 'GetUtilisateursDb' query type */
export interface IGetUtilisateursDbQuery {
  params: IGetUtilisateursDbParams;
  result: IGetUtilisateursDbResult;
}

/** 'GetUtilisateursEmailsByEntrepriseIdsDb' parameters type */
export interface IGetUtilisateursEmailsByEntrepriseIdsDbParams {
  entrepriseIds: readonly (string | null | void)[];
}

/** 'GetUtilisateursEmailsByEntrepriseIdsDb' return type */
export interface IGetUtilisateursEmailsByEntrepriseIdsDbResult {
  email: string | null;
}

/** 'GetUtilisateursEmailsByEntrepriseIdsDb' query type */
export interface IGetUtilisateursEmailsByEntrepriseIdsDbQuery {
  params: IGetUtilisateursEmailsByEntrepriseIdsDbParams;
  result: IGetUtilisateursEmailsByEntrepriseIdsDbResult;
}

/** 'GetUtilisateurByIdDb' parameters type */
export interface IGetUtilisateurByIdDbParams {
  id: string;
}

/** 'GetUtilisateurByIdDb' return type */
export interface IGetUtilisateurByIdDbResult {
  administration_id: string | null;
  email: string | null;
  entreprise_ids: stringArray | null;
  id: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  telephone_fixe: string | null;
  telephone_mobile: string | null;
}

/** 'GetUtilisateurByIdDb' query type */
export interface IGetUtilisateurByIdDbQuery {
  params: IGetUtilisateurByIdDbParams;
  result: IGetUtilisateurByIdDbResult;
}

/** 'GetKeycloakIdByUserIdDb' parameters type */
export interface IGetKeycloakIdByUserIdDbParams {
  id: string;
}

/** 'GetKeycloakIdByUserIdDb' return type */
export interface IGetKeycloakIdByUserIdDbResult {
  keycloak_id: string | null;
}

/** 'GetKeycloakIdByUserIdDb' query type */
export interface IGetKeycloakIdByUserIdDbQuery {
  params: IGetKeycloakIdByUserIdDbParams;
  result: IGetKeycloakIdByUserIdDbResult;
}

/** 'GetUtilisateurByEmailDb' parameters type */
export interface IGetUtilisateurByEmailDbParams {
  email: string;
}

/** 'GetUtilisateurByEmailDb' return type */
export interface IGetUtilisateurByEmailDbResult {
  email: string | null;
  keycloak_id: string | null;
  nom: string | null;
  prenom: string | null;
  qgis_token: string | null;
}

/** 'GetUtilisateurByEmailDb' query type */
export interface IGetUtilisateurByEmailDbQuery {
  params: IGetUtilisateurByEmailDbParams;
  result: IGetUtilisateurByEmailDbResult;
}

/** 'GetUtilisateurByKeycloakIdDb' parameters type */
export interface IGetUtilisateurByKeycloakIdDbParams {
  keycloakId: string;
}

/** 'GetUtilisateurByKeycloakIdDb' return type */
export interface IGetUtilisateurByKeycloakIdDbResult {
  administration_id: string | null;
  email: string | null;
  entreprise_ids: stringArray | null;
  id: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  telephone_fixe: string | null;
  telephone_mobile: string | null;
}

/** 'GetUtilisateurByKeycloakIdDb' query type */
export interface IGetUtilisateurByKeycloakIdDbQuery {
  params: IGetUtilisateurByKeycloakIdDbParams;
  result: IGetUtilisateurByKeycloakIdDbResult;
}

/** 'GetUtilisateurByTitreIdDb' parameters type */
export interface IGetUtilisateurByTitreIdDbParams {
  titreId: string;
}

/** 'GetUtilisateurByTitreIdDb' return type */
export interface IGetUtilisateurByTitreIdDbResult {
  administration_id: string | null;
  email: string | null;
  entreprise_ids: stringArray | null;
  id: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  telephone_fixe: string | null;
  telephone_mobile: string | null;
}

/** 'GetUtilisateurByTitreIdDb' query type */
export interface IGetUtilisateurByTitreIdDbQuery {
  params: IGetUtilisateurByTitreIdDbParams;
  result: IGetUtilisateurByTitreIdDbResult;
}

/** 'CreateUtilisateurDb' parameters type */
export interface ICreateUtilisateurDbParams {
  administrationId: string;
  date_creation: string;
  email: string;
  id: string;
  keycloak_id: string;
  nom: string;
  prenom: string;
  role: string;
  telephone_fixe: string;
  telephone_mobile: string;
}

/** 'CreateUtilisateurDb' return type */
export type ICreateUtilisateurDbResult = void;

/** 'CreateUtilisateurDb' query type */
export interface ICreateUtilisateurDbQuery {
  params: ICreateUtilisateurDbParams;
  result: ICreateUtilisateurDbResult;
}

/** 'CreateUtilisateurEntrepriseDb' parameters type */
export interface ICreateUtilisateurEntrepriseDbParams {
  entreprise_id: string;
  utilisateur_id: string;
}

/** 'CreateUtilisateurEntrepriseDb' return type */
export type ICreateUtilisateurEntrepriseDbResult = void;

/** 'CreateUtilisateurEntrepriseDb' query type */
export interface ICreateUtilisateurEntrepriseDbQuery {
  params: ICreateUtilisateurEntrepriseDbParams;
  result: ICreateUtilisateurEntrepriseDbResult;
}

/** 'DeleteUtilisateurEntrepriseDb' parameters type */
export interface IDeleteUtilisateurEntrepriseDbParams {
  utilisateur_id: string;
}

/** 'DeleteUtilisateurEntrepriseDb' return type */
export type IDeleteUtilisateurEntrepriseDbResult = void;

/** 'DeleteUtilisateurEntrepriseDb' query type */
export interface IDeleteUtilisateurEntrepriseDbQuery {
  params: IDeleteUtilisateurEntrepriseDbParams;
  result: IDeleteUtilisateurEntrepriseDbResult;
}

/** 'UpdateUtilisateurDb' parameters type */
export interface IUpdateUtilisateurDbParams {
  email: string;
  id: string;
  nom: string;
  prenom: string;
}

/** 'UpdateUtilisateurDb' return type */
export type IUpdateUtilisateurDbResult = void;

/** 'UpdateUtilisateurDb' query type */
export interface IUpdateUtilisateurDbQuery {
  params: IUpdateUtilisateurDbParams;
  result: IUpdateUtilisateurDbResult;
}

/** 'UpdateUtilisateurRoleDb' parameters type */
export interface IUpdateUtilisateurRoleDbParams {
  administrationId: string;
  id: string;
  role: string;
}

/** 'UpdateUtilisateurRoleDb' return type */
export type IUpdateUtilisateurRoleDbResult = void;

/** 'UpdateUtilisateurRoleDb' query type */
export interface IUpdateUtilisateurRoleDbQuery {
  params: IUpdateUtilisateurRoleDbParams;
  result: IUpdateUtilisateurRoleDbResult;
}

/** 'SoftDeleteUtilisateurDb' parameters type */
export interface ISoftDeleteUtilisateurDbParams {
  id: string;
}

/** 'SoftDeleteUtilisateurDb' return type */
export type ISoftDeleteUtilisateurDbResult = void;

/** 'SoftDeleteUtilisateurDb' query type */
export interface ISoftDeleteUtilisateurDbQuery {
  params: ISoftDeleteUtilisateurDbParams;
  result: ISoftDeleteUtilisateurDbResult;
}

