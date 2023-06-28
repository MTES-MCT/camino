/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */

/** 'GetDemarcheDbInternal' parameters type */
export interface IGetDemarcheDbInternalParams {
  id?: string | null | void;
}

/** 'GetDemarcheDbInternal' return type */
export interface IGetDemarcheDbInternalResult {
  titre_id: string;
  type_id: string;
}

/** 'GetDemarcheDbInternal' query type */
export interface IGetDemarcheDbInternalQuery {
  params: IGetDemarcheDbInternalParams;
  result: IGetDemarcheDbInternalResult;
}

