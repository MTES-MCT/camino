import Titres from '../../../database/models/titres.js'

export const titresPublicModifie = [
  {
    typeId: 'cxh',
    type: {
      domaineId: 'h',
      typeId: 'cx',
    },
    demarches: [],
    publicLecture: true,
    entreprisesLecture: false,
  } as unknown as Titres,
]

export const titresPublicIdentique = [
  {
    typeId: 'cxh',
    type: {
      domaineId: 'h',
      typeId: 'cx',
    },
    demarches: null,
    publicLecture: false,
    entreprisesLecture: true,
  } as unknown as Titres,
]
