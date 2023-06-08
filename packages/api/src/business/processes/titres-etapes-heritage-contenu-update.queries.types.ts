/** Types generated for queries found in "src/business/processes/titres-etapes-heritage-contenu-update.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetEtapesByDemarche' parameters type */
export interface IGetEtapesByDemarcheParams {
  demarcheId?: string | null | void;
  titreId?: string | null | void;
}

/** 'GetEtapesByDemarche' return type */
export interface IGetEtapesByDemarcheResult {
  communes: Json;
  contenu: Json | null;
  date: string;
  demarche_id: string;
  demarche_statut_id: string;
  demarche_type_id: string;
  heritage_contenu: Json | null;
  id: string;
  ordre: number;
  statut_id: string;
  surface: number | null;
  titre_id: string;
  titre_type_id: string;
  type_id: string;
}

/** 'GetEtapesByDemarche' query type */
export interface IGetEtapesByDemarcheQuery {
  params: IGetEtapesByDemarcheParams;
  result: IGetEtapesByDemarcheResult;
}

