const points = {
  graph: `references`
}

const titresDemarchesPhases = {
  graph: 'statut'
}

const demarchesTypes = {
  graph: `[etapesTypes]`
}

const titresTypes = {
  graph: `[demarchesTypes(orderAsc).${demarchesTypes.graph}, type, titresTypesTitresStatuts]`
}

const documentsRelateTrue = ['type']
const documentsRelateFalse = [] as string[]

const documents = {
  graph: `[type, etapesAssociees]`,
  update: {
    insertMissing: true,
    relate: documentsRelateTrue,
    unrelate: documentsRelateFalse
  }
}

const entreprisesEtablissements = {
  update: { insertMissing: true }
}

const entreprisesRelateTrue = [] as string[]
const entreprisesRelateFalse = [
  ...documentsRelateFalse.map(k => `documents.${k}`)
]

const entreprises = {
  graph: `[utilisateurs, etablissements(orderDesc), documents.${documents.graph}, titresTypes.${titresTypes.graph}]`,
  update: {
    insertMissing: true,
    relate: entreprisesRelateTrue,
    unrelate: entreprisesRelateTrue
  }
}

const utilisateursRelateTrue = ['entreprises']

const utilisateursRelateFalse = [
  ...entreprisesRelateFalse.map(k => `entreprises.${k}`)
]

const utilisateurs = {
  graph: `[administration.[titresTypes, activitesTypes], entreprises.etablissements]`,
  update: {
    relate: utilisateursRelateTrue,
    unrelate: utilisateursRelateTrue,
    noDelete: utilisateursRelateFalse
  }
}

const utilisateursTitres = {
  graph: `[utilisateur]`
}

const administrations = {
  graph: `[utilisateurs, titresTypes.${titresTypes.graph}, titresTypesTitresStatuts, titresTypesEtapesTypes]`,
  update: {
    insertMissing: true
  }
}

const titresEtapesRelateTrue = [
  'type',
  'titulaires',
  'amodiataires',
  'administrations',
  'communes',
  'forets',
  'justificatifs'
]

const titresEtapesRelateFalse = [
  'titulaires.etablissements',
  'titulaires.utilisateurs',
  'titulaires.documents',
  'titulaires.documents.type',
  'amodiataires.etablissements',
  'amodiataires.utilisateurs',
  'administrations.titresTypes',
  'administrations.utilisateurs',
  ...documentsRelateFalse.map(k => `documents.${k}`),
  ...documentsRelateFalse.map(k => `justificatifs.${k}`)
]

const titresEtapes = {
  graph: `[
    points(orderAsc).${points.graph},
    type,
    documents.${documents.graph},
    justificatifs.${documents.graph},
    titulaires.${entreprises.graph},
    amodiataires.${entreprises.graph},
    administrations.${administrations.graph},
    forets
  ]`,

  update: {
    relate: titresEtapesRelateTrue,
    unrelate: titresEtapesRelateTrue,
    noInsert: titresEtapesRelateFalse,
    noUpdate: titresEtapesRelateFalse,
    noDelete: titresEtapesRelateFalse,
    insertMissing: true
  }
}

const titresTypesRelateFalse = [
  'type',
  'demarchesTypes',
  'demarchesTypes.etapesTypes',
  'titresTypesTitresStatuts'
]

const titresDemarchesRelateTrue = [
  'statut',
  'type',
  'enfants',
  'parents',
  'phase.statut',
  ...titresEtapesRelateTrue.map(k => `etapes.${k}`)
]

const titresDemarchesRelateFalse = [
  'type.etapesTypes',
  'titreType',
  ...titresTypesRelateFalse.map(k => `titreType.${k}`)
]

const titresDemarches = {
  graph: `[
     type.${demarchesTypes.graph},
     statut,
     phase.${titresDemarchesPhases.graph},
     titreType,
     etapes.${titresEtapes.graph},
     parents.^1,
     enfants.^1
  ]`,

  update: {
    relate: titresDemarchesRelateTrue,
    unrelate: titresDemarchesRelateTrue,
    noInsert: titresDemarchesRelateFalse,
    noUpdate: titresDemarchesRelateFalse,
    noDelete: titresDemarchesRelateFalse,
    insertMissing: true
  }
}

const activitesTypesRelateTrue = [
  'frequence',
  'titresTypes',
  'administrations',
  'documentsTypes'
]

const activitesTypesRelateFalse = [
  'frequence.mois',
  'frequence.trimestres',
  'frequence.trimestres.mois',
  'frequence.annees',
  ...titresTypesRelateFalse.map(k => `type.titresTypes.${k}`)
]

const activitesTypes = {
  graph: `[frequence.[mois, trimestres.mois, annees], titresTypes, administrations, documentsTypes]`,

  update: {
    relate: activitesTypesRelateTrue,
    unrelate: activitesTypesRelateTrue,
    noInsert: activitesTypesRelateFalse,
    noUpdate: activitesTypesRelateFalse,
    noDelete: activitesTypesRelateFalse,
    insertMissing: false
  }
}

const titresActivitesRelateTrue = ['type', 'statut', 'utilisateur']

const titresActivitesRelateFalse = [
  ...activitesTypesRelateFalse.map(k => `type.${k}`),
  ...documents.update.relate.map(k => `documents.${k}`)
]

const titresActivites = {
  graph: `[type.${activitesTypes.graph}, statut, utilisateur]`,
  update: {
    relate: titresActivitesRelateTrue,
    unrelate: titresActivitesRelateTrue,
    noInsert: titresActivitesRelateFalse,
    noUpdate: titresActivitesRelateFalse,
    noDelete: titresActivitesRelateFalse,
    insertMissing: true
  }
}

const domaines = {
  graph: `[titresTypes(orderAsc).${titresTypes.graph}]`
}

const titresRelateTrue = [
  'type',
  'statut',
  'domaine',
  'administrationsGestionnaires',
  'references.type',
  ...titresActivitesRelateTrue.map(k => `activites.${k}`),
  ...titresDemarchesRelateTrue.map(k => `demarches.${k}`),
  'titresAdministrations'
]

const titresRelateFalse = [
  ...titresTypesRelateFalse.map(k => `type.${k}`),
  'domaine.titresTypes',
  ...titresTypesRelateFalse.map(k => `domaine.titresTypes.${k}`),
  'points',
  'points.references',
  'communes',
  'forets',
  'substancesEtape',
  'titulaires',
  'titulaires.etablissements',
  'titulaires.utilisateurs',
  'titulaires.documents',
  'titulaires.documents.type',
  'amodiataires',
  'amodiataires.etablissements',
  'amodiataires.utilisateurs',
  'administrationsGestionnaires.titresTypes',
  'administrationsGestionnaires.type',
  'administrationsGestionnaires.utilisateurs',
  'administrationsLocales',
  'administrationsLocales.titresTypes',
  'administrationsLocales.type',
  'administrationsLocales.utilisateurs',
  'surfaceEtape',
  ...titresActivitesRelateFalse.map(k => `activites.${k}`),
  ...titresDemarchesRelateFalse.map(k => `demarches.${k}`),
  'titresAdministrations.type'
]

const titres = {
  graph: `[
    type.${titresTypes.graph},
    domaine.${domaines.graph},
    statut,
    points(orderAsc).${points.graph},
    titulaires.${entreprises.graph},
    amodiataires.${entreprises.graph},
    administrationsGestionnaires.${administrations.graph},
    administrationsLocales.${administrations.graph},
    demarches(orderDesc).${titresDemarches.graph},
    forets,
    activites(orderDesc).${titresActivites.graph},
    references(orderAsc).type,
    titresAdministrations.${administrations.graph}
   ]`,

  update: {
    relate: titresRelateTrue,
    unrelate: titresRelateTrue,
    noInsert: titresRelateFalse,
    noUpdate: titresRelateFalse,
    noDelete: titresRelateFalse,
    insertMissing: true
  }
}

const journaux = {
  graph: `[utilisateur.${utilisateurs.graph}]`
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
  titresDemarchesPhases,
  titresTypes,
  utilisateurs,
  utilisateursTitres,
  journaux
}
