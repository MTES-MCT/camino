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

/** 'GetsubstancesByAnneeByCommune' parameters type */
export interface IGetsubstancesByAnneeByCommuneParams {
  substancesFiscales: readonly (string | null | void)[];
}

/** 'GetsubstancesByAnneeByCommune' return type */
export interface IGetsubstancesByAnneeByCommuneResult {
  annee: number;
  commune_id: string;
  substances: Json | null;
}

/** 'GetsubstancesByAnneeByCommune' query type */
export interface IGetsubstancesByAnneeByCommuneQuery {
  params: IGetsubstancesByAnneeByCommuneParams;
  result: IGetsubstancesByAnneeByCommuneResult;
}

/** 'GetSubstancesByEntrepriseCategoryByAnnee' parameters type */
export interface IGetSubstancesByEntrepriseCategoryByAnneeParams {
  bauxite?: string | null | void;
  selAbattage?: string | null | void;
  selContenu?: string | null | void;
  selSondage?: string | null | void;
}

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

