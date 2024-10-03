/** Types generated for queries found in "src/business/processes/titres-etapes-mise-en-concurrence.queries.ts" */

/** 'GetDemarchesWithMiseEnConcurrenceDb' parameters type */
export interface IGetDemarchesWithMiseEnConcurrenceDbParams {
  demandeTypeId: string;
  etapeDemandeId?: string | null | void;
}

/** 'GetDemarchesWithMiseEnConcurrenceDb' return type */
export interface IGetDemarchesWithMiseEnConcurrenceDbResult {
  id: string;
  mise_en_concurrence_id: string;
}

/** 'GetDemarchesWithMiseEnConcurrenceDb' query type */
export interface IGetDemarchesWithMiseEnConcurrenceDbQuery {
  params: IGetDemarchesWithMiseEnConcurrenceDbParams;
  result: IGetDemarchesWithMiseEnConcurrenceDbResult;
}

/** 'UpdateEtapeIdDeMiseEnConcurrenceInternal' parameters type */
export interface IUpdateEtapeIdDeMiseEnConcurrenceInternalParams {
  demarcheIdEnConcurrence: string;
  titreEtapeId: string;
}

/** 'UpdateEtapeIdDeMiseEnConcurrenceInternal' return type */
export interface IUpdateEtapeIdDeMiseEnConcurrenceInternalResult {
  demarche_id_en_concurrence: string | null;
}

/** 'UpdateEtapeIdDeMiseEnConcurrenceInternal' query type */
export interface IUpdateEtapeIdDeMiseEnConcurrenceInternalQuery {
  params: IUpdateEtapeIdDeMiseEnConcurrenceInternalParams;
  result: IUpdateEtapeIdDeMiseEnConcurrenceInternalResult;
}

