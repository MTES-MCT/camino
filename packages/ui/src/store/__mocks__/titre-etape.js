const titreEtapeHeritage1 = {
  id: 'etape-id',
  titreDemarcheId: 'demarche-id',
  date: '2020-01-02',
  statutId: '',
  typeId: 'mfr',
  dateDebut: undefined,
  dateFin: undefined,
  duree: undefined,
  surface: undefined,
  amodiataires: [],
  titulaires: [],
  substances: [],
  contenu: {
    sectionId1: { elementId1: 'valeur', elementId2: 'valeur' },
    sectionId2: {},
  },
  heritageProps: {},
  heritageContenu: {
    sectionId1: {
      elementId1: { etape: { id: 'etape-id' }, actif: true },
      elementId2: { etape: { id: 'etape-id' }, actif: false },
    },
    sectionId2: {
      elementId1: { etape: { id: 'etape-id' }, actif: true },
    },
  },
}

const titreEtapeHeritageRes1 = {
  typeId: 'mfr',
  heritageProps: {},
  heritageContenu: {
    sectionId1: {
      elementId1: { etape: { id: 'etape-id' }, actif: true },
      elementId2: { etape: { id: 'etape-id' }, actif: false },
    },
    sectionId2: {
      elementId1: { etape: { id: 'etape-id' }, actif: true },
    },
    sectionId3: {},
  },
  contenu: {
    sectionId1: { elementId1: 'valeur', elementId2: 'valeur' },
  },
}

const titreEtapeHeritage2 = {
  amodiataires: [],
  date: '2020-01-01',
  duree: undefined,
  heritageProps: {},
  statutId: '',
  substances: [],
  titreDemarcheId: 'demarche-id',
  titulaires: [],
  typeId: 'mfr',
}

const titreEtapeHeritageRes2 = {
  typeId: 'mfr',
  heritageProps: {},
  heritageContenu: {},
  contenu: {},
}

export { titreEtapeHeritage1, titreEtapeHeritageRes1, titreEtapeHeritage2, titreEtapeHeritageRes2 }
