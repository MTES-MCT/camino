/** Types generated for queries found in "src/database/queries/titres-utilisateurs.queries.ts" */

/** 'GetTitreUtilisateurDb' parameters type */
export interface IGetTitreUtilisateurDbParams {
  titreId: string;
  userId: string;
}

/** 'GetTitreUtilisateurDb' return type */
export interface IGetTitreUtilisateurDbResult {
  titre_id: string;
  utilisateur_id: string;
}

/** 'GetTitreUtilisateurDb' query type */
export interface IGetTitreUtilisateurDbQuery {
  params: IGetTitreUtilisateurDbParams;
  result: IGetTitreUtilisateurDbResult;
}

