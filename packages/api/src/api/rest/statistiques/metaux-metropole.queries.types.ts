/** Types generated for queries found in "src/api/rest/statistiques/metaux-metropole.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTitreActiviteSubstanceParAnnee' parameters type */
export interface IGetTitreActiviteSubstanceParAnneeParams {
  substanceFiscale?: string | null | void;
}

/** 'GetTitreActiviteSubstanceParAnnee' return type */
export interface IGetTitreActiviteSubstanceParAnneeResult {
  annee: number;
  count: Json | null;
}

/** 'GetTitreActiviteSubstanceParAnnee' query type */
export interface IGetTitreActiviteSubstanceParAnneeQuery {
  params: IGetTitreActiviteSubstanceParAnneeParams;
  result: IGetTitreActiviteSubstanceParAnneeResult;
}

/** 'GetSelByAnneeByCommune' parameters type */
export type IGetSelByAnneeByCommuneParams = void;

/** 'GetSelByAnneeByCommune' return type */
export interface IGetSelByAnneeByCommuneResult {
  annee: number;
  commune_id: string;
  naca: Json | null;
  nacb: Json | null;
  nacc: Json | null;
}

/** 'GetSelByAnneeByCommune' query type */
export interface IGetSelByAnneeByCommuneQuery {
  params: IGetSelByAnneeByCommuneParams;
  result: IGetSelByAnneeByCommuneResult;
}

/** 'GetSubstancesByEntrepriseCategoryByAnnee' parameters type */
export type IGetSubstancesByEntrepriseCategoryByAnneeParams = void;

/** 'GetSubstancesByEntrepriseCategoryByAnnee' return type */
export interface IGetSubstancesByEntrepriseCategoryByAnneeResult {
  aloh: string | null;
  annee: number;
  categorie: string | null;
  naca: string | null;
  nacb: string | null;
  nacc: string | null;
}

/** 'GetSubstancesByEntrepriseCategoryByAnnee' query type */
export interface IGetSubstancesByEntrepriseCategoryByAnneeQuery {
  params: IGetSubstancesByEntrepriseCategoryByAnneeParams;
  result: IGetSubstancesByEntrepriseCategoryByAnneeResult;
}

