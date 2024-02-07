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

