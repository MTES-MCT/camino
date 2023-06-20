/** Types generated for queries found in "src/scripts/jorf-scan.queries.ts" */

/** 'GetJorfDocuments' parameters type */
export type IGetJorfDocumentsParams = void;

/** 'GetJorfDocuments' return type */
export interface IGetJorfDocumentsResult {
  date: string;
  jorf: string | null;
  nor: string | null;
  titre_nom: string;
}

/** 'GetJorfDocuments' query type */
export interface IGetJorfDocumentsQuery {
  params: IGetJorfDocumentsParams;
  result: IGetJorfDocumentsResult;
}

