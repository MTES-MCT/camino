/** Types generated for queries found in "src/api/rest/statistiques/metaux-metropole.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTitreActiviteSubstanceParAnneeInternal' parameters type */
export interface IGetTitreActiviteSubstanceParAnneeInternalParams {
  substanceFiscale?: string | null | void;
}

/** 'GetTitreActiviteSubstanceParAnneeInternal' return type */
export interface IGetTitreActiviteSubstanceParAnneeInternalResult {
  annee: number;
  count: Json | null;
}

/** 'GetTitreActiviteSubstanceParAnneeInternal' query type */
export interface IGetTitreActiviteSubstanceParAnneeInternalQuery {
  params: IGetTitreActiviteSubstanceParAnneeInternalParams;
  result: IGetTitreActiviteSubstanceParAnneeInternalResult;
}

/** 'GetsubstancesByAnneeByCommuneInternal' parameters type */
export interface IGetsubstancesByAnneeByCommuneInternalParams {
  substancesFiscales: readonly (string | null | void)[];
}

/** 'GetsubstancesByAnneeByCommuneInternal' return type */
export interface IGetsubstancesByAnneeByCommuneInternalResult {
  annee: number;
  communes: Json;
  substances: Json | null;
}

/** 'GetsubstancesByAnneeByCommuneInternal' query type */
export interface IGetsubstancesByAnneeByCommuneInternalQuery {
  params: IGetsubstancesByAnneeByCommuneInternalParams;
  result: IGetsubstancesByAnneeByCommuneInternalResult;
}

/** 'GetSubstancesByEntrepriseCategoryByAnneeInternal' parameters type */
export interface IGetSubstancesByEntrepriseCategoryByAnneeInternalParams {
  bauxite?: string | null | void;
  selAbattage?: string | null | void;
  selContenu?: string | null | void;
  selSondage?: string | null | void;
}

/** 'GetSubstancesByEntrepriseCategoryByAnneeInternal' return type */
export interface IGetSubstancesByEntrepriseCategoryByAnneeInternalResult {
  aloh: string | null;
  annee: number;
  categorie: string | null;
  naca: string | null;
  nacb: string | null;
  nacc: string | null;
}

/** 'GetSubstancesByEntrepriseCategoryByAnneeInternal' query type */
export interface IGetSubstancesByEntrepriseCategoryByAnneeInternalQuery {
  params: IGetSubstancesByEntrepriseCategoryByAnneeInternalParams;
  result: IGetSubstancesByEntrepriseCategoryByAnneeInternalResult;
}

