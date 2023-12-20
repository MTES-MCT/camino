/** Types generated for queries found in "src/api/rest/titres.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTitreInternal' parameters type */
export interface IGetTitreInternalParams {
  id: string;
}

/** 'GetTitreInternal' return type */
export interface IGetTitreInternalResult {
  id: string;
  nb_activites_to_do: string | null;
  nom: string;
  public_lecture: boolean;
  references: Json;
  slug: string;
  titre_doublon_id: string;
  titre_doublon_nom: string;
  titre_statut_id: string;
  titre_type_id: string;
}

/** 'GetTitreInternal' query type */
export interface IGetTitreInternalQuery {
  params: IGetTitreInternalParams;
  result: IGetTitreInternalResult;
}

/** 'GetTitreCommunesInternal' parameters type */
export interface IGetTitreCommunesInternalParams {
  id?: string | null | void;
}

/** 'GetTitreCommunesInternal' return type */
export interface IGetTitreCommunesInternalResult {
  id: string;
  nom: string;
}

/** 'GetTitreCommunesInternal' query type */
export interface IGetTitreCommunesInternalQuery {
  params: IGetTitreCommunesInternalParams;
  result: IGetTitreCommunesInternalResult;
}

/** 'GetTitreTypeIdByTitreIdDb' parameters type */
export interface IGetTitreTypeIdByTitreIdDbParams {
  titreId: string;
}

/** 'GetTitreTypeIdByTitreIdDb' return type */
export interface IGetTitreTypeIdByTitreIdDbResult {
  titre_type_id: string;
}

/** 'GetTitreTypeIdByTitreIdDb' query type */
export interface IGetTitreTypeIdByTitreIdDbQuery {
  params: IGetTitreTypeIdByTitreIdDbParams;
  result: IGetTitreTypeIdByTitreIdDbResult;
}

/** 'GetAdministrationsLocalesByTitreIdDb' parameters type */
export interface IGetAdministrationsLocalesByTitreIdDbParams {
  titreId: string;
}

/** 'GetAdministrationsLocalesByTitreIdDb' return type */
export interface IGetAdministrationsLocalesByTitreIdDbResult {
  administrations_locales: Json | null;
}

/** 'GetAdministrationsLocalesByTitreIdDb' query type */
export interface IGetAdministrationsLocalesByTitreIdDbQuery {
  params: IGetAdministrationsLocalesByTitreIdDbParams;
  result: IGetAdministrationsLocalesByTitreIdDbResult;
}

/** 'GetTitulairesAmodiatairesByTitreIdDb' parameters type */
export interface IGetTitulairesAmodiatairesByTitreIdDbParams {
  titreId: string;
}

/** 'GetTitulairesAmodiatairesByTitreIdDb' return type */
export interface IGetTitulairesAmodiatairesByTitreIdDbResult {
  id: string;
}

/** 'GetTitulairesAmodiatairesByTitreIdDb' query type */
export interface IGetTitulairesAmodiatairesByTitreIdDbQuery {
  params: IGetTitulairesAmodiatairesByTitreIdDbParams;
  result: IGetTitulairesAmodiatairesByTitreIdDbResult;
}

/** 'GetDemarchesByTitreIdQueryDb' parameters type */
export interface IGetDemarchesByTitreIdQueryDbParams {
  titreId: string;
}

/** 'GetDemarchesByTitreIdQueryDb' return type */
export interface IGetDemarchesByTitreIdQueryDbResult {
  demarche_date_debut: string | null;
  demarche_date_fin: string | null;
  demarche_statut_id: string;
  demarche_type_id: string;
  description: string | null;
  entreprises_lecture: boolean;
  id: string;
  public_lecture: boolean;
  slug: string | null;
}

/** 'GetDemarchesByTitreIdQueryDb' query type */
export interface IGetDemarchesByTitreIdQueryDbQuery {
  params: IGetDemarchesByTitreIdQueryDbParams;
  result: IGetDemarchesByTitreIdQueryDbResult;
}

