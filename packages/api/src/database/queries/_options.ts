const points = {
  graph: `references`,
}

const demarchesTypes = {
  graph: `[etapesTypes]`,
}

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

const entreprisesRelateTrue = [] as string[]
const entreprisesRelateFalse = [...documentsRelateFalse.map(k => `documents.${k}`)]

const entreprises = {
  graph: `[utilisateurs, etablissements(orderDesc), documents.${documents.graph}]`,
  update: {
    insertMissing: true,
    relate: entreprisesRelateTrue,
    unrelate: entreprisesRelateTrue,
  },
}

const utilisateursRelateTrue = ['entreprises']

const utilisateursRelateFalse = [...entreprisesRelateFalse.map(k => `entreprises.${k}`)]

const utilisateurs = {
  graph: `[administration.activitesTypes, entreprises.etablissements]`,
  update: {
    relate: utilisateursRelateTrue,
    unrelate: utilisateursRelateTrue,
    noDelete: utilisateursRelateFalse,
  },
}

const utilisateursTitres = {
  graph: `[utilisateur]`,
}

const administrations = {
  graph: `[utilisateurs]`,
  update: {
    insertMissing: true,
  },
}

const titresEtapesRelateTrue = ['type', 'titulaires', 'amodiataires', 'justificatifs']

const titresEtapesRelateFalse = [
  'titulaires.etablissements',
  'titulaires.utilisateurs',
  'titulaires.documents',
  'titulaires.documents.type',
  'amodiataires.etablissements',
  'amodiataires.utilisateurs',
  ...documentsRelateFalse.map(k => `documents.${k}`),
  ...documentsRelateFalse.map(k => `justificatifs.${k}`),
]

const titresEtapes = {
  graph: `[
    points(orderAsc).${points.graph},
    type,
    documents.${documents.graph},
    justificatifs.${documents.graph},
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

const titresDemarchesRelateTrue = ['type', ...titresEtapesRelateTrue.map(k => `etapes.${k}`)]

const titresDemarchesRelateFalse = ['type.etapesTypes', 'titreType', ...titresTypesRelateFalse.map(k => `titreType.${k}`)]

const titresDemarches = {
  graph: `[
     type.${demarchesTypes.graph},
     titreType,
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

const activitesTypesRelateTrue = ['titresTypes', 'administrations', 'documentsTypes']

const activitesTypesRelateFalse = [...titresTypesRelateFalse.map(k => `type.titresTypes.${k}`)]

const activitesTypes = {
  graph: `[titresTypes, administrations, documentsTypes]`,

  update: {
    relate: activitesTypesRelateTrue,
    unrelate: activitesTypesRelateTrue,
    noInsert: activitesTypesRelateFalse,
    noUpdate: activitesTypesRelateFalse,
    noDelete: activitesTypesRelateFalse,
    insertMissing: false,
  },
}

const titresActivitesRelateTrue = ['type', 'utilisateur']

const titresActivitesRelateFalse = [...activitesTypesRelateFalse.map(k => `type.${k}`), ...documents.update.relate.map(k => `documents.${k}`)]

const titresActivites = {
  graph: `[type.${activitesTypes.graph}, utilisateur]`,
  update: {
    relate: titresActivitesRelateTrue,
    unrelate: titresActivitesRelateTrue,
    noInsert: titresActivitesRelateFalse,
    noUpdate: titresActivitesRelateFalse,
    noDelete: titresActivitesRelateFalse,
    insertMissing: true,
  },
}

const domaines = {
  graph: `[titresTypes(orderAsc).${titresTypes.graph}]`,
}

const titresRelateTrue = ['type', ...titresActivitesRelateTrue.map(k => `activites.${k}`), ...titresDemarchesRelateTrue.map(k => `demarches.${k}`)]

const titresRelateFalse = [
  ...titresTypesRelateFalse.map(k => `type.${k}`),
  'points',
  'points.references',
  'substancesEtape',
  'pointsEtape',
  'titulaires',
  'titulaires.etablissements',
  'titulaires.utilisateurs',
  'titulaires.documents',
  'titulaires.documents.type',
  'amodiataires',
  'amodiataires.etablissements',
  'amodiataires.utilisateurs',
  'surfaceEtape',
  ...titresActivitesRelateFalse.map(k => `activites.${k}`),
  ...titresDemarchesRelateFalse.map(k => `demarches.${k}`),
]

const titres = {
  graph: `[
    type.${titresTypes.graph},
    points(orderAsc).${points.graph},
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
  activitesTypes,
  administrations,
  demarchesTypes,
  domaines,
  documents,
  entreprises,
  entreprisesEtablissements,
  points,
  titres,
  titresActivites,
  titresDemarches,
  titresEtapes,
  titresTypes,
  utilisateurs,
  utilisateursTitres,
  journaux,
}
