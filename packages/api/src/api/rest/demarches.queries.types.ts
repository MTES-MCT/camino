/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type JsonArray = (Json)[];

/** 'GetEtapesByDemarcheIdDb' parameters type */
export interface IGetEtapesByDemarcheIdDbParams {
  demarcheId: string;
}

/** 'GetEtapesByDemarcheIdDb' return type */
export interface IGetEtapesByDemarcheIdDbResult {
  communes: Json;
  contenu: Json | null;
  date: string;
  date_debut: string | null;
  date_fin: string | null;
  decisions_annexes_contenu: Json | null;
  decisions_annexes_sections: JsonArray | null;
  duree: number | null;
  etape_statut_id: string;
  etape_type_id: string;
  forets: Json;
  heritage_contenu: Json | null;
  heritage_props: Json | null;
  id: string;
  sdom_zones: Json | null;
  secteurs_maritime: Json | null;
  slug: string | null;
  substances: Json;
  surface: number | null;
}

/** 'GetEtapesByDemarcheIdDb' query type */
export interface IGetEtapesByDemarcheIdDbQuery {
  params: IGetEtapesByDemarcheIdDbParams;
  result: IGetEtapesByDemarcheIdDbResult;
}

