/** Types generated for queries found in "src/business/processes/titres-public-update.queries.ts" */

/** Query 'GetTitrePublicUpdateDataDb' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTitrePublicUpdateDataDbResult = never;

/** Query 'GetTitrePublicUpdateDataDb' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTitrePublicUpdateDataDbParams = never;

/** 'UpdateTitrePublicLectureDb' parameters type */
export interface IUpdateTitrePublicLectureDbParams {
  publicLecture: boolean;
  titreId: string;
}

/** 'UpdateTitrePublicLectureDb' return type */
export type IUpdateTitrePublicLectureDbResult = void;

/** 'UpdateTitrePublicLectureDb' query type */
export interface IUpdateTitrePublicLectureDbQuery {
  params: IUpdateTitrePublicLectureDbParams;
  result: IUpdateTitrePublicLectureDbResult;
}

