/** Types generated for queries found in "src/api/rest/titre-demande.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'CreateTitreInternal' parameters type */
export interface ICreateTitreInternalParams {
  id: string;
  nom: string;
  references: Json;
  slug: string;
  titreTypeId: string;
}

/** 'CreateTitreInternal' return type */
export type ICreateTitreInternalResult = void;

/** 'CreateTitreInternal' query type */
export interface ICreateTitreInternalQuery {
  params: ICreateTitreInternalParams;
  result: ICreateTitreInternalResult;
}

/** 'CreateTitreDemarcheInternal' parameters type */
export interface ICreateTitreDemarcheInternalParams {
  demarcheTypeId?: string | null | void;
  id: string;
  slug: string;
  titre_id: string;
}

/** 'CreateTitreDemarcheInternal' return type */
export type ICreateTitreDemarcheInternalResult = void;

/** 'CreateTitreDemarcheInternal' query type */
export interface ICreateTitreDemarcheInternalQuery {
  params: ICreateTitreDemarcheInternalParams;
  result: ICreateTitreDemarcheInternalResult;
}

