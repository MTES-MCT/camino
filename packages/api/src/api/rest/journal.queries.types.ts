/** Types generated for queries found in "src/api/rest/journal.queries.ts" */

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

/** 'GetTitresModifiesByMonthDb' parameters type */
export type IGetTitresModifiesByMonthDbParams = void;

/** 'GetTitresModifiesByMonthDb' return type */
export interface IGetTitresModifiesByMonthDbResult {
  mois: string | null;
  quantite: string | null;
}

/** 'GetTitresModifiesByMonthDb' query type */
export interface IGetTitresModifiesByMonthDbQuery {
  params: IGetTitresModifiesByMonthDbParams;
  result: IGetTitresModifiesByMonthDbResult;
}

