const points = {
  graph: `references`,
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
  graph: `[administration, entreprises.etablissements]`,
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

const titresEtapesRelateTrue = ['type', 'titulaires', 'amodiataires']

const titresEtapesRelateFalse = ['titulaires.etablissements', 'titulaires.utilisateurs', 'amodiataires.etablissements', 'amodiataires.utilisateurs', ...documentsRelateFalse.map(k => `documents.${k}`)]

const titresEtapes = {
  graph: `[
    points(orderAsc).${points.graph},
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

const titresDemarchesRelateTrue = ['type', ...titresEtapesRelateTrue.map(k => `etapes.${k}`)]

const titresDemarchesRelateFalse = ['titreType', ...titresTypesRelateFalse.map(k => `titreType.${k}`)]

const titresDemarches = {
  graph: `[
     type,
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

const titresActivitesRelateTrue = ['type', 'utilisateur']

const titresActivites = {
  graph: `[utilisateur]`,
  update: {
    relate: titresActivitesRelateTrue,
    unrelate: titresActivitesRelateTrue,
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
  'amodiataires',
  'amodiataires.etablissements',
  'amodiataires.utilisateurs',
  'surfaceEtape',
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
  administrations,
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
