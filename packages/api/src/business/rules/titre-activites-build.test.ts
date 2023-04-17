import { IActiviteType, ITitreActivite, ITitreDemarche } from '../../types.js'

import { titreActivitesBuild } from './titre-activites-build.js'

import { describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { SubstancesFiscale } from 'camino-common/src/static/substancesFiscales.js'
import { UNITES } from 'camino-common/src/static/unites.js'
describe("construction des activités d'un titre", () => {
  const activiteTypeGrp = {
    id: 'grp',
    frequenceId: 'tri',
    sections: [
      {
        id: 'renseignements',
        nom: 'Renseignements',
        elements: [
          {
            id: 'champ-1',
            nom: 'Nom champ 1',
            type: 'number',
            optionnel: true,
            description: 'Description champs 1',
          },
          {
            id: 'champ-2',
            nom: 'Nom champs 2',
            type: 'checkboxes',
            valeurs: [{ id: 'un', nom: 'Uno' }],
            dateFin: '2018-04-01',
            description: 'Description champs 2',
          },
          {
            id: 'champ-3',
            nom: 'Nom champs 3',
            type: 'checkboxes',
            valeursMetasNom: 'unites',
            dateDebut: '2018-07-01',
            description: 'Description champs 3',
            periodesIds: [3],
          },
        ],
      },
    ],
  } as IActiviteType
  const aujourdhui = toCaminoDate('2021-01-01')

  test("ne crée pas d'activité pour un titre qui n'a pas de phase de démarches", () => {
    const titreActivites1 = titreActivitesBuild(activiteTypeGrp, [2020], aujourdhui, 'titre-id', 'pxm', undefined)

    expect(titreActivites1.length).toEqual(0)

    const titreActivites2 = titreActivitesBuild(activiteTypeGrp, [2020], aujourdhui, 'titre-id', 'pxm', [])

    expect(titreActivites2.length).toEqual(0)

    const titreActivites3 = titreActivitesBuild(activiteTypeGrp, [2020], aujourdhui, 'titre-id', 'pxm', [{ id: 'demarche-id' } as unknown as ITitreDemarche])

    expect(titreActivites3.length).toEqual(0)
  })

  test('ne crée pas une activité si elle existe déjà', () => {
    const res = titreActivitesBuild(
      {
        id: 'gra',
        frequenceId: 'ann',
        sections: [{ id: 'substancesFiscales' }],
      } as IActiviteType,
      [2018],
      aujourdhui,
      'titre-id',
      'pxm',
      [{ id: 'demarche-id', phase: {} } as unknown as ITitreDemarche],
      [{ typeId: 'gra', annee: 2018, periodeId: 1 }] as ITitreActivite[]
    )

    expect(res.length).toEqual(0)
  })

  test("ne crée pas une activité si sa date de fin n'a pas eu lieu", () => {
    const res = titreActivitesBuild(activiteTypeGrp, [2021], aujourdhui, 'titre-id', 'pxm', [{ id: 'demarche-id', phase: {} } as unknown as ITitreDemarche])

    expect(res.length).toEqual(0)
  })

  test('crée des activités', () => {
    const titreActivitesA = titreActivitesBuild(
      {
        id: 'gra',
        frequenceId: 'ann',
        sections: [{ id: 'substancesFiscales' }],
      } as IActiviteType,
      [2018],
      aujourdhui,
      'titre-id',
      'pxm',
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: 'titreId',
          statutId: 'acc',
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2018-01-01'),
          demarcheDateFin: toCaminoDate('2018-12-31'),
          etapes: [
            {
              id: 'etape-id',
              titreDemarcheId: newDemarcheId('demarche-id'),
              date: toCaminoDate('2018-01-01'),
              typeId: 'dpu',
              statutId: 'fai',
              substances: ['auru', 'nacl'],
            },
          ],
        },
      ]
    )

    expect(titreActivitesA).toEqual([
      {
        titreId: 'titre-id',
        date: '2019-01-01',
        typeId: 'gra',
        activiteStatutId: 'abs',
        periodeId: 1,
        annee: 2018,
        sections: [
          {
            id: 'substancesFiscales',
            elements: [
              {
                id: SubstancesFiscale.auru.id,
                nom: SubstancesFiscale.auru.nom,
                type: 'number',
                description: '<b>g (gramme)</b> contenu dans les minerais',
                referenceUniteRatio: 0.001,
                uniteId: SubstancesFiscale.auru.uniteId,
              },
              {
                id: SubstancesFiscale.naca.id,
                nom: SubstancesFiscale.naca.nom,
                type: 'number',
                description: '<b>x 1000 t (millier de tonnes)</b> extrait par abattage net livré',
                referenceUniteRatio: 1000000,
                uniteId: SubstancesFiscale.naca.uniteId,
              },
              {
                description: '<b>x 1000 t (millier de tonnes)</b> extrait en dissolution par sondage et livré raffiné',
                id: SubstancesFiscale.nacb.id,
                nom: SubstancesFiscale.nacb.nom,
                referenceUniteRatio: 1000000,
                type: 'number',
                uniteId: SubstancesFiscale.nacb.uniteId,
              },
              {
                description: '<b>x 1000 t (millier de tonnes)</b> extrait en dissolution par sondage et livré en dissolution',
                id: SubstancesFiscale.nacc.id,
                nom: SubstancesFiscale.nacc.nom,
                referenceUniteRatio: 1000000,
                type: 'number',
                uniteId: SubstancesFiscale.nacc.uniteId,
              },
            ],
          },
        ],
      },
    ])

    const titreActivitesB = titreActivitesBuild(activiteTypeGrp, [2018], aujourdhui, 'titre-id', 'pxm', [
      {
        id: 'demarche-id',
        demarcheDateDebut: '2018-01-01',
        demarcheDateFin: '2018-12-31',
        typeId: 'oct',
      } as ITitreDemarche,
    ])

    expect(titreActivitesB).toEqual([
      {
        titreId: 'titre-id',
        date: '2018-04-01',
        typeId: 'grp',
        activiteStatutId: 'abs',
        periodeId: 1,
        annee: 2018,
        sections: [
          {
            id: 'renseignements',
            elements: [
              {
                id: 'champ-1',
                nom: 'Nom champ 1',
                optionnel: true,
                type: 'number',
                description: 'Description champs 1',
              },
              {
                id: 'champ-2',
                nom: 'Nom champs 2',
                type: 'checkboxes',
                description: 'Description champs 2',
                valeurs: [{ id: 'un', nom: 'Uno' }],
              },
            ],
            nom: 'Renseignements',
          },
        ],
      },
      {
        titreId: 'titre-id',
        date: '2018-07-01',
        typeId: 'grp',
        activiteStatutId: 'abs',
        periodeId: 2,
        annee: 2018,
        sections: [
          {
            id: 'renseignements',
            elements: [
              {
                id: 'champ-1',
                nom: 'Nom champ 1',
                optionnel: true,
                type: 'number',
                description: 'Description champs 1',
              },
            ],
            nom: 'Renseignements',
          },
        ],
      },
      {
        titreId: 'titre-id',
        date: '2018-10-01',
        typeId: 'grp',
        activiteStatutId: 'abs',
        periodeId: 3,
        annee: 2018,
        sections: [
          {
            id: 'renseignements',
            elements: [
              {
                id: 'champ-1',
                nom: 'Nom champ 1',
                optionnel: true,
                type: 'number',
                description: 'Description champs 1',
              },
              {
                id: 'champ-3',
                nom: 'Nom champs 3',
                type: 'checkboxes',
                description: 'Description champs 3',
                valeurs: UNITES,
              },
            ],
            nom: 'Renseignements',
          },
        ],
      },
      {
        titreId: 'titre-id',
        date: '2019-01-01',
        typeId: 'grp',
        activiteStatutId: 'abs',
        periodeId: 4,
        annee: 2018,
        sections: [
          {
            id: 'renseignements',
            elements: [
              {
                id: 'champ-1',
                nom: 'Nom champ 1',
                optionnel: true,
                type: 'number',
                description: 'Description champs 1',
              },
            ],
            nom: 'Renseignements',
          },
        ],
      },
    ])
  })

  test("ne crée pas d'activité si le titre n'est pas valide pour la période", () => {
    const titreActivites = titreActivitesBuild(activiteTypeGrp, [2018], aujourdhui, 'titre-id', 'pxm', [{ id: 'demarche-id', phase: {}, type: {} } as unknown as ITitreDemarche])

    expect(titreActivites.length).toEqual(0)
  })

  test("ne crée pas d'activités si les sections sont vides", () => {
    const titreActivitesA = titreActivitesBuild(
      {
        id: 'gra',
        frequenceId: 'ann',
        sections: [{ id: 'substancesFiscales' }],
      } as IActiviteType,
      [2018],
      aujourdhui,
      'titre-id',
      'pxm',
      [
        {
          id: 'demarche-id',
          statutId: 'acc',
          typeId: 'oct',
          type: { id: 'oct' },
          phase: { dateDebut: '2018-01-01', dateFin: '2018-12-31' },
          etapes: [
            {
              id: 'etape-id',
              date: '2018-01-01',
              typeId: 'dpu',
              statutId: 'fai',
              substances: [],
            },
          ],
        } as unknown as ITitreDemarche,
      ]
    )

    expect(titreActivitesA).toEqual([])

    const titreActivitesB = titreActivitesBuild(
      {
        id: 'gra',
        frequenceId: 'ann',
        sections: [{ id: 'substancesFiscales' }],
      } as IActiviteType,
      [2018],
      aujourdhui,
      'titre-id',
      'pxm',
      [
        {
          id: 'demarche-id',
          statutId: 'acc',
          typeId: 'oct',
          type: { id: 'oct' },
          phase: { dateDebut: '2018-01-01', dateFin: '2018-12-31' },
          etapes: [
            {
              id: 'etape-id',
              date: '2018-01-01',
              typeId: 'dpu',
              statutId: 'fai',
              substances: null,
            },
          ],
        } as unknown as ITitreDemarche,
      ]
    )

    expect(titreActivitesB).toEqual([])

    const titreActivitesD = titreActivitesBuild(
      {
        id: 'gra',
        frequenceId: 'ann',
        sections: [{ id: 'renseignements' }],
      } as IActiviteType,
      [2018],
      aujourdhui,
      'titre-id',
      'pxm',
      [
        {
          id: 'demarche-id',
          activiteStatutId: 'acc',
          typeId: 'oct',
          type: {},
          phase: { dateDebut: '2018-01-01', dateFin: '2018-12-31' },
        } as unknown as ITitreDemarche,
      ]
    )

    expect(titreActivitesD).toEqual([])
  })
})
