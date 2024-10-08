const entreprisesEtablissements = {
  update: { insertMissing: true },
}

const entreprisesRelateTrue: string[] = []

const entreprises = {
  graph: `[utilisateurs, etablissements(orderDesc)]`,
  update: {
    insertMissing: true,
    relate: entreprisesRelateTrue,
    unrelate: entreprisesRelateTrue,
  },
}

const utilisateursRelateTrue = ['entreprises']
const utilisateursRelateFalse = ['entreprises']

const utilisateurs = {
  graph: `[entreprises.etablissements]`,
  update: {
    relate: utilisateursRelateTrue,
    unrelate: utilisateursRelateTrue,
    noDelete: utilisateursRelateFalse,
  },
}

const utilisateursTitres = {
  graph: `[utilisateur]`,
}

const titresEtapes = {
  update: {
    insertMissing: true,
  },
}

const titresDemarchesRelateTrue = ['etapes']

const titresDemarchesRelateFalse: string[] = []

const titresDemarches = {
  graph: `[etapes]`,

  update: {
    relate: titresDemarchesRelateTrue,
    unrelate: titresDemarchesRelateTrue,
    noInsert: titresDemarchesRelateFalse,
    noUpdate: titresDemarchesRelateFalse,
    noDelete: titresDemarchesRelateFalse,
    insertMissing: true,
  },
}

const titresActivitesRelateTrue = ['utilisateur']

const titresActivites = {
  graph: `[utilisateur]`,
  update: {
    relate: titresActivitesRelateTrue,
    unrelate: titresActivitesRelateTrue,
    insertMissing: true,
  },
}

const titresRelateTrue = [...titresActivitesRelateTrue.map(k => `activites.${k}`), ...titresDemarchesRelateTrue.map(k => `demarches.${k}`)]

const titresRelateFalse = ['substancesEtape', 'pointsEtape', 'titulairesEtape', 'amodiatairesEtape', ...titresDemarchesRelateFalse.map(k => `demarches.${k}`)]

const titres = {
  graph: `[
    demarches(orderDesc).${titresDemarches.graph},
    activites(orderDesc).${titresActivites.graph},
   ]`,

  update: {
    relate: titresRelateTrue,
    unrelate: titresRelateTrue,
    noInsert: titresRelateFalse,
    noUpdate: titresRelateFalse,
    noDelete: titresRelateFalse,
    insertMissing: true,
  },
}

const journaux = {
  graph: `[utilisateur.${utilisateurs.graph}]`,
}

export default {
  entreprises,
  entreprisesEtablissements,
  titres,
  titresActivites,
  titresDemarches,
  titresEtapes,
  utilisateurs,
  utilisateursTitres,
  journaux,
}

export type FieldId = { id?: Record<string, never> }
export type FieldsEntreprise = FieldId

export type FieldsTitre = FieldId & {
  demarches?: FieldsDemarche
  substances?: FieldId
  surface?: FieldId
  secteursMaritime?: FieldId
  administrationsLocale?: FieldId
  administrations?: FieldId
  sdomZones?: FieldId
  communes?: FieldId
  forets?: FieldId
  activites?: FieldsActivite

  pointsEtape?: FieldId
  substancesEtape?: FieldId
  titulairesEtape?: FieldId
  amodiatairesEtape?: FieldId
}
export type FieldsDemarche = FieldId & {
  titre?: FieldsTitre
  etapes?: FieldsEtape
}

export type FieldsEtape = FieldId & {
  demarche?: FieldsDemarche
}

export type FieldsActivite = FieldId & {
  titre?: FieldsTitre
}
