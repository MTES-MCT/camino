const titresTypes = {
  graph: `[type]`,
}

const documentsRelateTrue = ['type']
const documentsRelateFalse = [] as string[]

const documents = {
  graph: `[type]`,
  update: {
    insertMissing: true,
    relate: documentsRelateTrue,
    unrelate: documentsRelateFalse,
  },
}

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

const titresEtapesRelateTrue = ['type', 'titulaires', 'amodiataires']

const titresEtapesRelateFalse = ['titulaires.etablissements', 'titulaires.utilisateurs', 'amodiataires.etablissements', 'amodiataires.utilisateurs', ...documentsRelateFalse.map(k => `documents.${k}`)]

const titresEtapes = {
  graph: `[
    type,
    documents.${documents.graph},
    titulaires.${entreprises.graph},
    amodiataires.${entreprises.graph}
  ]`,

  update: {
    relate: titresEtapesRelateTrue,
    unrelate: titresEtapesRelateTrue,
    noInsert: titresEtapesRelateFalse,
    noUpdate: titresEtapesRelateFalse,
    noDelete: titresEtapesRelateFalse,
    insertMissing: true,
  },
}

const titresTypesRelateFalse = ['type']

const titresDemarchesRelateTrue = [...titresEtapesRelateTrue.map(k => `etapes.${k}`)]

const titresDemarchesRelateFalse: string[] = []

const titresDemarches = {
  graph: `[
     etapes.${titresEtapes.graph},
  ]`,

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

const titresRelateTrue = ['type', ...titresActivitesRelateTrue.map(k => `activites.${k}`), ...titresDemarchesRelateTrue.map(k => `demarches.${k}`)]

const titresRelateFalse = [
  ...titresTypesRelateFalse.map(k => `type.${k}`),
  'substancesEtape',
  'pointsEtape',
  'titulaires',
  'titulaires.etablissements',
  'titulaires.utilisateurs',
  'amodiataires',
  'amodiataires.etablissements',
  'amodiataires.utilisateurs',
  ...titresDemarchesRelateFalse.map(k => `demarches.${k}`),
]

const titres = {
  graph: `[
    type.${titresTypes.graph},
    titulaires.${entreprises.graph},
    amodiataires.${entreprises.graph},
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
  documents,
  entreprises,
  entreprisesEtablissements,
  titres,
  titresActivites,
  titresDemarches,
  titresEtapes,
  titresTypes,
  utilisateurs,
  utilisateursTitres,
  journaux,
}

export type FieldId = { id?: Record<string, never> }
export type FieldsEntreprise = FieldId & {
  utilisateurs?: FieldsUtilisateur
  etablissements?: FieldId
  titulaireTitres?: FieldId
  amodiataireTitres?: FieldId
}

type FieldDocumentType = FieldId
export type FieldsDocument = FieldId & {
  type?: FieldDocumentType
  etape?: FieldsEtape
}
export type FieldsUtilisateur = FieldId & {
  entreprises?: FieldsEntreprise
}
export type FieldsTitre = FieldId & {
  type?: FieldId & {
    type?: FieldId
  }
  titulaires?: FieldsEntreprise
  amodiataires?: FieldsEntreprise
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
}
export type FieldsDemarche = FieldId & {
  titre?: FieldsTitre
  etapes?: FieldsEtape
}

export type FieldsEtape = FieldId & {
  titulaires?: FieldsEntreprise
  amodiataires?: FieldsEntreprise
  demarche?: FieldsDemarche
  type?: FieldId
  documents?: FieldsDocument
}

export type FieldsActivite = FieldId & {
  titre?: FieldsTitre
}

export type FieldsUtilisateurTitre = FieldId & {
  utilisateur?: FieldsUtilisateur
}
