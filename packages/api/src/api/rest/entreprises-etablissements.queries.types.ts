/** Types generated for queries found in "src/api/rest/entreprises-etablissements.queries.ts" */

/** 'GetEntrepriseEtablissementsDb' parameters type */
export interface IGetEntrepriseEtablissementsDbParams {
  entreprise_id: string;
}

/** 'GetEntrepriseEtablissementsDb' return type */
export interface IGetEntrepriseEtablissementsDbResult {
  date_debut: string;
  date_fin: string | null;
  id: string;
  nom: string;
}

/** 'GetEntrepriseEtablissementsDb' query type */
export interface IGetEntrepriseEtablissementsDbQuery {
  params: IGetEntrepriseEtablissementsDbParams;
  result: IGetEntrepriseEtablissementsDbResult;
}

