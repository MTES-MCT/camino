/** Types generated for queries found in "src/api/rest/titres.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTitreInternal' parameters type */
export interface IGetTitreInternalParams {
  id?: string | null | void;
}

/** 'GetTitreInternal' return type */
export interface IGetTitreInternalResult {
  administrations_locales: Json | null;
  id: string;
  nom: string;
  slug: string;
  titre_statut_id: string;
  type_id: string;
}

/** 'GetTitreInternal' query type */
export interface IGetTitreInternalQuery {
  params: IGetTitreInternalParams;
  result: IGetTitreInternalResult;
}

/** 'GetLastJournalInternal' parameters type */
export interface IGetLastJournalInternalParams {
  titreId?: string | null | void;
}

/** 'GetLastJournalInternal' return type */
export interface IGetLastJournalInternalResult {
  date: string | null;
}

/** 'GetLastJournalInternal' query type */
export interface IGetLastJournalInternalQuery {
  params: IGetLastJournalInternalParams;
  result: IGetLastJournalInternalResult;
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

