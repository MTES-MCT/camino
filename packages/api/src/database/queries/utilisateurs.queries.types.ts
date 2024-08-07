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

