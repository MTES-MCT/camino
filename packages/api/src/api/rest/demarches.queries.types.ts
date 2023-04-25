/** Types generated for queries found in "src/api/rest/demarches.queries.ts" */

/** 'GetDemarcheDb' parameters type */
export interface IGetDemarcheDbParams {
  id?: string | null | void;
}

/** 'GetDemarcheDb' return type */
export interface IGetDemarcheDbResult {
  titre_id: string;
  type_id: string;
}

/** 'GetDemarcheDb' query type */
export interface IGetDemarcheDbQuery {
  params: IGetDemarcheDbParams;
  result: IGetDemarcheDbResult;
}

