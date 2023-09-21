import { titreIdValidator } from 'camino-common/src/titres.js'
import { ITitre } from '../../../types.js'
import { activiteIdValidator } from 'camino-common/src/activite.js'
import { toCaminoDate } from 'camino-common/src/date.js'

const titreId = titreIdValidator.parse('titre-id')
export const titresActivitesToUpdate = [
  {
    id: titreId,
    nom: 'nom du titre',
    titreStatutId: 'val',
    propsTitreEtapesIds: {},
    typeId: 'axm',
    demarches: [],
    activites: [
      {
        id: activiteIdValidator.parse('titre-activite-id-2019-03'),
        titreId,
        sections: [],
        activiteStatutId: 'abs',
        date: toCaminoDate('2019-10-01'),
        annee: 2019,
        periodeId: 3,
        typeId: 'grp',
        suppression: true,
      },
      {
        id: activiteIdValidator.parse('titre-activite-id-2019-04'),
        titreId,
        sections: [],
        activiteStatutId: 'abs',
        date: toCaminoDate('2020-01-01'),
        annee: 2019,
        periodeId: 4,
        typeId: 'grp',
      },
      {
        id: activiteIdValidator.parse('titre-activite-id-2020-01'),
        titreId,
        sections: [],
        activiteStatutId: 'abs',
        date: toCaminoDate('2020-04-01'),
        annee: 2020,
        periodeId: 1,
        typeId: 'grp',
        suppression: true,
      },
      {
        id: activiteIdValidator.parse('titre-activite-id-2020-02'),
        titreId,
        sections: [],
        activiteStatutId: 'abs',
        date: toCaminoDate('2020-07-01'),
        annee: 2020,
        periodeId: 2,
        typeId: 'grp',
      },
    ],
  },
] as ITitre[]

export const titresActivitesNotToUpdate = [
  {
    id: 'titre-id',
    typeId: 'axm',
  },
  {
    id: 'titre-id',
    typeId: 'axm',
    activites: [],
  },
  {
    id: 'titre-id',
    typeId: 'axm',
    activites: [
      {
        id: 'titre-activite-id-2019-03',
        date: '2019-10-01',
        annee: 2019,
        periodeId: 3,
        typeid: 'grp',
        suppression: true,
      },
    ],
  },
  {
    id: 'titre-id',
    typeId: 'axm',
    demarches: [],
    activites: [
      {
        id: 'titre-activite-id-2019-03',
        date: '2019-10-01',
        annee: 2019,
        statutId: 'abs',
        periodeId: 3,
        typeid: 'grp',
        suppression: true,
      },
    ],
  },
] as ITitre[]
