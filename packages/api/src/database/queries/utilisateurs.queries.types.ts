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

