/** Types generated for queries found in "src/api/rest/statistiques/evolution-titres.queries.ts" */

/** 'GetDepotDb' parameters type */
export interface IGetDepotDbParams {
  anneeDepart?: number | null | void;
  demarcheTypeIds: readonly (string | null | void)[];
  departements: readonly (string | null | void)[];
  etapeTypeId?: string | null | void;
  titreTypeId?: string | null | void;
}

/** 'GetDepotDb' return type */
export interface IGetDepotDbResult {
  annee: string | null;
  count: string | null;
}

/** 'GetDepotDb' query type */
export interface IGetDepotDbQuery {
  params: IGetDepotDbParams;
  result: IGetDepotDbResult;
}

/** 'GetOctroiDb' parameters type */
export interface IGetOctroiDbParams {
  anneeDepart?: number | null | void;
  demarcheTypeIds: readonly (string | null | void)[];
  departements: readonly (string | null | void)[];
  titreTypeId?: string | null | void;
}

/** 'GetOctroiDb' return type */
export interface IGetOctroiDbResult {
  annee: string | null;
  count: string | null;
}

/** 'GetOctroiDb' query type */
export interface IGetOctroiDbQuery {
  params: IGetOctroiDbParams;
  result: IGetOctroiDbResult;
}

/** 'GetSurfaceDb' parameters type */
export interface IGetSurfaceDbParams {
  anneeDepart?: number | null | void;
  demarcheTypeIds: readonly (string | null | void)[];
  departements: readonly (string | null | void)[];
  titreTypeId?: string | null | void;
}

/** 'GetSurfaceDb' return type */
export interface IGetSurfaceDbResult {
  annee: string | null;
  count: number | null;
}

/** 'GetSurfaceDb' query type */
export interface IGetSurfaceDbQuery {
  params: IGetSurfaceDbParams;
  result: IGetSurfaceDbResult;
}

/** 'GetEtapesTypesDecisionRefusDb' parameters type */
export interface IGetEtapesTypesDecisionRefusDbParams {
  anneeDepart?: number | null | void;
  demarcheStatutIds: readonly (string | null | void)[];
  demarcheTypeIds: readonly (string | null | void)[];
  departements: readonly (string | null | void)[];
  etapeStatutFait?: string | null | void;
  etapeStatutRejet?: string | null | void;
  etapesTypesDecisionRefus: readonly (string | null | void)[];
  etapeTypeClassementSansSuite?: string | null | void;
  titreTypeId?: string | null | void;
}

/** 'GetEtapesTypesDecisionRefusDb' return type */
export interface IGetEtapesTypesDecisionRefusDbResult {
  annee: string | null;
  count: string | null;
}

/** 'GetEtapesTypesDecisionRefusDb' query type */
export interface IGetEtapesTypesDecisionRefusDbQuery {
  params: IGetEtapesTypesDecisionRefusDbParams;
  result: IGetEtapesTypesDecisionRefusDbResult;
}

