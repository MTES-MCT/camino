/** Types generated for queries found in "src/database/queries/titres-utilisateurs.queries.ts" */

/** 'GetTitresWithBrouillonsDb' parameters type */
export type IGetTitresWithBrouillonsDbParams = void;

/** 'GetTitresWithBrouillonsDb' return type */
export interface IGetTitresWithBrouillonsDbResult {
  demarche_slug: string | null;
  demarche_type_id: string;
  etape_date: string;
  etape_slug: string | null;
  etape_type_id: string;
  titre_nom: string;
  titre_slug: string;
  titre_statut_id: string;
  titre_type_id: string;
}

/** 'GetTitresWithBrouillonsDb' query type */
export interface IGetTitresWithBrouillonsDbQuery {
  params: IGetTitresWithBrouillonsDbParams;
  result: IGetTitresWithBrouillonsDbResult;
}

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

