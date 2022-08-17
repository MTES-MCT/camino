import { dbManager } from '../../../tests/db-manager'
import { graphQLCall, queryImport } from '../../../tests/_utils/index'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches'
import { titreCreate } from '../../database/queries/titres'
import { titreEtapePropsIds } from '../../business/utils/titre-etape-heritage-props-find'
import Titres from '../../database/models/titres'
import TitresTypesDemarchesTypesEtapesTypes from '../../database/models/titres-types--demarches-types-etapes-types'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../../database/models/titres-types--demarches-types-etapes-types-justificatifs-types'
import TitresTypesDemarchesTypesEtapesTypesDocumentsTypes from '../../database/models/titres-types--demarches-types-etapes-types-documents-types'
import { documentCreate } from '../../database/queries/documents'
import {
  ADMINISTRATION_IDS,
  Administrations
} from 'camino-common/src/static/administrations'
import { Role } from 'camino-common/src/roles'

jest.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../tools/file-stream-create', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../tools/file-delete', () => ({
  __esModule: true,
  default: jest.fn()
}))
console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()

  await TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().delete()
  await TitresTypesDemarchesTypesEtapesTypesDocumentsTypes.query().delete()

  const mfrTDE = (await TitresTypesDemarchesTypesEtapesTypes.query()
    .where('titreTypeId', 'arm')
    .andWhere('demarcheTypeId', 'oct')
    .andWhere('etapeTypeId', 'mfr')
    .first()) as TitresTypesDemarchesTypesEtapesTypes
  mfrTDE!
    .sections!.find(s => s.id === 'arm')!
    .elements!.find(e => e.id === 'franchissements')!.optionnel = false
  await TitresTypesDemarchesTypesEtapesTypes.query().upsertGraph(mfrTDE)
})

beforeEach(async () => {
  await Titres.query().delete()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const demarcheCreate = async () => {
  const titre = await titreCreate(
    {
      nom: 'mon titre',
      domaineId: 'm',
      typeId: 'arm',
      propsTitreEtapesIds: {},
      administrationsGestionnaires: [
        {
          ...Administrations[
            ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
          ]
        },
        { ...Administrations[ADMINISTRATION_IDS['DGTM - GUYANE']] }
      ]
    },
    {}
  )

  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct'
  })

  return titreDemarche.id
}

describe('etapeCreer', () => {
  const etapeCreerQuery = queryImport('titre-etape-creer')

  test.each([undefined, 'editeur' as Role])(
    'ne peut pas créer une étape (utilisateur %s)',
    async (role: Role | undefined) => {
      const res = await graphQLCall(
        etapeCreerQuery,
        { etape: { typeId: '', statutId: '', titreDemarcheId: '', date: '' } },
        role,
        'ope-onf-973-01'
      )

      expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
    }
  )

  test('ne peut pas créer une étape sur une démarche inexistante (utilisateur super)', async () => {
    const res = await graphQLCall(
      etapeCreerQuery,
      { etape: { typeId: '', statutId: '', titreDemarcheId: '', date: '' } },
      'admin',
      'ope-onf-973-01'
    )

    expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
  })

  test('peut créer une étape mfr avec un statut fai (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()

    await documentCreate({
      id: 'dep',
      typeId: 'dep',
      date: '2020-01-01',
      uri: 'https://camino.beta.gouv.fr'
    })
    await documentCreate({
      id: 'doe',
      typeId: 'doe',
      date: '2020-01-01',
      uri: 'https://camino.beta.gouv.fr'
    })

    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mfr',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          heritageProps: titreEtapePropsIds.reduce(
            (acc, prop) => {
              acc[prop] = { actif: false }

              return acc
            },
            {} as {
              [key: string]: { actif: boolean }
            }
          ),
          heritageContenu: {
            arm: {
              mecanise: { actif: true },
              franchissements: { actif: true }
            }
          },
          contenu: { arm: { mecanise: true, franchissements: 3 } },
          substances: [{ substanceId: 'auru', ordre: 0 }],
          duree: 10,
          documentIds: ['dep', 'doe'],
          points: [
            {
              groupe: 1,
              contour: 1,
              point: 1,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 1, y: 2 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 2,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 2, y: 2 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 3,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 2, y: 1 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 4,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 1, y: 1 } }
              ]
            }
          ]
        }
      },
      'super'
    )

    expect(res.body.errors).toBeUndefined()
  })

  test('ne peut pas créer une étape mia avec un statut fav (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mia',
          statutId: 'fav',
          titreDemarcheId,
          date: '2018-01-01'
        }
      },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body.errors[0].message).toBe(
      'statut de l\'étape "fav" invalide pour une type d\'étape mia pour une démarche de type octroi'
    )
  })

  test('peut créer une étape mia avec un statut fai (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mia',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01'
        }
      },
      'super'
    )

    expect(res.body.errors).toBeUndefined()
  })

  test('peut créer une étape MEN sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'men',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01'
        }
      },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body.errors).toBeUndefined()
  })

  test('ne peut pas créer une étape EDE sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'ede',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          heritageContenu: {
            deal: { motifs: { actif: false }, agent: { actif: false } }
          },
          contenu: {
            deal: { motifs: 'motif', agent: 'agent' }
          }
        }
      },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body.errors[0].message).toBe(
      'statut de l\'étape "fai" invalide pour une type d\'étape ede pour une démarche de type octroi'
    )
  })

  test('ne peut pas créer une étape mfr avec un statut fai avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mfr',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          duree: 10,
          heritageProps: titreEtapePropsIds.reduce(
            (acc, prop) => {
              acc[prop] = { actif: false }

              return acc
            },
            {} as {
              [key: string]: { actif: boolean }
            }
          ),
          heritageContenu: {
            arm: {
              mecanise: { actif: true },
              franchissements: { actif: true }
            }
          },
          substances: [{ substanceId: 'auru', ordre: 0 }],
          points: [
            {
              groupe: 1,
              contour: 1,
              point: 1,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 1, y: 2 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 2,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 2, y: 2 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 3,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 2, y: 1 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 4,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 1, y: 1 } }
              ]
            }
          ]
        }
      },
      'super'
    )

    expect(res.body.errors[0].message).toBe(
      'l’élément "Franchissements de cours d\'eau" de la section "Caractéristiques ARM" est obligatoire'
    )
  })

  test('peut créer une étape mfr avec un statut aco avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await graphQLCall(
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mfr',
          statutId: 'aco',
          titreDemarcheId,
          date: '2018-01-01',
          heritageProps: titreEtapePropsIds.reduce(
            (acc, prop) => {
              acc[prop] = { actif: false }

              return acc
            },
            {} as {
              [key: string]: { actif: boolean }
            }
          ),
          heritageContenu: {
            arm: {
              mecanise: { actif: true },
              franchissements: { actif: true }
            }
          }
        }
      },
      'super'
    )

    expect(res.body.errors).toBeUndefined()
  })
})
