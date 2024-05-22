/** Types generated for queries found in "src/business/processes/titres-public-update.queries.ts" */

/** 'GetTitrePublicUpdateDataDb' parameters type */
export interface IGetTitrePublicUpdateDataDbParams {
  titreIds: readonly (string | null | void)[];
}

/** 'GetTitrePublicUpdateDataDb' return type */
export interface IGetTitrePublicUpdateDataDbResult {
  has_demarche_public: boolean;
  id: string;
  public_lecture: boolean;
  titre_statut_id: string;
  titre_type_id: string;
}

/** 'GetTitrePublicUpdateDataDb' query type */
export interface IGetTitrePublicUpdateDataDbQuery {
  params: IGetTitrePublicUpdateDataDbParams;
  result: IGetTitrePublicUpdateDataDbResult;
}

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

