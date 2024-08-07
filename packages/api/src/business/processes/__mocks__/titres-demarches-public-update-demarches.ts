import Titres from '../../../database/models/titres'

const titresDemarchesPublicModifie = [
  {
    typeId: 'cxh',
    demarches: [
      {
        id: 'h-cx-courdemanges-1988-oct01',
        titreId: 'h-cx-courdemanges-1988',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        publicLecture: true,
        entreprisesLecture: true,
      },
    ],
  },
] as Titres[]

const titresDemarchesPublicIdentique = [
  {
    typeId: 'cxh',
    demarches: [
      {
        id: 'h-cx-courdemanges-1988-oct01',
        titreId: 'h-cx-courdemanges-1988',
        typeId: 'oct',
        statutId: 'rej',
        ordre: 1,
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dex01',
            titreDemarcheIdId: 'h-cx-courdemanges-1988-oct01',
            typeId: 'dex',
            statutId: 'rej',
            ordre: 1,
            date: '1988-03-06',
            dateFin: '2013-03-11',
          },
        ],
        publicLecture: false,
        entreprisesLecture: true,
      },
    ],
  },
] as unknown as Titres[]

export { titresDemarchesPublicModifie, titresDemarchesPublicIdentique }
