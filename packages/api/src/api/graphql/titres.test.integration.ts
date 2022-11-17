import { dbManager } from '../../../tests/db-manager'
import { graphQLCall, queryImport } from '../../../tests/_utils/index'
import { titreCreate } from '../../database/queries/titres'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ITitre } from '../../types'
import { newDemarcheId } from '../../database/models/_format/id-create'
import { toCaminoDate } from 'camino-common/src/date'
import {
  vi,
  afterEach,
  beforeEach,
  afterAll,
  beforeAll,
  describe,
  test,
  expect
} from 'vitest'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterEach(async () => {
  await dbManager.reseedDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const titrePublicLectureFalse: ITitre = {
  id: 'titre-id',
  nom: 'mon titre',
  domaineId: 'm',
  typeId: 'arm',
  publicLecture: false,
  propsTitreEtapesIds: {}
}

const titreDemarchesPubliques: ITitre = {
  id: 'titre-id',
  nom: 'mon titre',
  domaineId: 'm',
  typeId: 'arm',
  publicLecture: true,
  propsTitreEtapesIds: {},
  demarches: [
    {
      id: newDemarcheId('titre-id-demarche-oct'),
      titreId: 'titre-id',
      typeId: 'oct',
      publicLecture: true
    },
    {
      id: newDemarcheId('titre-id-demarche-pro'),
      titreId: 'titre-id',
      typeId: 'pro',
      publicLecture: false
    }
  ]
}
const titreEtapesPubliques: ITitre = {
  id: 'titre-id',
  nom: 'mon titre',
  domaineId: 'm',
  typeId: 'arm',
  publicLecture: true,
  propsTitreEtapesIds: { points: 'titre-id-demarche-id-dpu' },
  demarches: [
    {
      id: newDemarcheId('titre-id-demarche-id'),
      titreId: 'titre-id',
      typeId: 'oct',
      statutId: 'acc',
      publicLecture: true,
      etapes: [
        {
          id: 'titre-id-demarche-id-aof',
          typeId: 'aof',
          ordre: 8,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-eof',
          typeId: 'eof',
          ordre: 7,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-edm',
          typeId: 'edm',
          ordre: 6,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-ede',
          typeId: 'ede',
          ordre: 5,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-pfd',
          typeId: 'pfd',
          ordre: 4,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-pfc',
          typeId: 'pfc',
          ordre: 3,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-vfd',
          typeId: 'vfd',
          ordre: 2,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-vfc',
          typeId: 'vfc',
          ordre: 1,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02')
        },
        {
          id: 'titre-id-demarche-id-dpu',
          typeId: 'dpu',
          ordre: 0,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          administrationsLocales: ['dea-guyane-01']
        }
      ]
    }
  ]
}

const titreWithActiviteGrp: ITitre = {
  id: 'titre-id',
  nom: 'mon titre',
  domaineId: 'm',
  typeId: 'axm',
  publicLecture: true,
  propsTitreEtapesIds: { points: 'titre-id-demarche-id-dpu' },
  activites: [
    {
      titreId: 'titre-id',
      id: 'titre-id-grp-2020-03',
      date: toCaminoDate('2020-10-01'),
      typeId: 'grp',
      statutId: 'abs',
      periodeId: 3,
      annee: 2020,
      utilisateurId: null,
      sections: [
        {
          id: 'renseignements',
          elements: [
            {
              id: 'orBrut',
              nom: 'Or brut extrait (g)',
              type: 'number',
              description: 'Masse d’or brut'
            },
            {
              id: 'orExtrait',
              nom: 'Or extrait (g)',
              type: 'number',
              description: "Masse d'or brut extrait au cours du trimestre."
            }
          ]
        }
      ]
    }
  ],
  demarches: [
    {
      id: newDemarcheId('titre-id-demarche-id'),
      titreId: 'titre-id',
      typeId: 'oct',
      publicLecture: true,
      etapes: [
        {
          id: 'titre-id-demarche-id-dpu',
          typeId: 'dpu',
          ordre: 0,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          administrationsLocales: ['dea-guyane-01']
        }
      ]
    }
  ]
}

const titreActivites: ITitre = {
  id: 'titre-id',
  nom: 'mon titre',
  domaineId: 'm',
  typeId: 'arm',
  publicLecture: true,
  propsTitreEtapesIds: {},
  activites: [
    {
      id: 'titre-id-activites-oct',
      titreId: 'titre-id',
      typeId: 'grp',
      date: toCaminoDate('2020-01-01'),
      statutId: 'dep',
      periodeId: 1,
      annee: 2020,
      sections: [
        {
          id: 'renseignements',
          elements: [
            {
              id: 'orBrut',
              nom: 'Or brut extrait (g)',
              type: 'number',
              dateDebut: '2018-01-01',
              description: 'Masse d’or brut'
            },
            {
              id: 'orExtrait',
              nom: 'Or extrait (g)',
              type: 'number',
              description: "Masse d'or brut extrait au cours du trimestre."
            }
          ]
        }
      ]
    },
    {
      id: 'titre-id-activites-pro',
      titreId: 'titre-id',
      typeId: 'gra',
      date: toCaminoDate('2020-01-01'),
      statutId: 'dep',
      periodeId: 1,
      annee: 2020,
      sections: [
        {
          id: 'renseignements',
          elements: [
            {
              id: 'orBrut',
              nom: 'Or brut extrait (g)',
              type: 'number',
              description: 'Masse d’or brut'
            },
            {
              id: 'orExtrait',
              nom: 'Or extrait (g)',
              type: 'number',
              description: "Masse d'or brut extrait au cours du trimestre."
            }
          ]
        }
      ]
    }
  ]
}
describe('titre', () => {
  const titreQuery = queryImport('titre')

  test('peut voir un titre qui est en "lecture publique" (utilisateur anonyme)', async () => {
    const titrePublicLecture: ITitre = {
      id: 'titre-id',
      nom: 'mon titre',
      domaineId: 'm',
      typeId: 'arm',
      publicLecture: true,
      propsTitreEtapesIds: {}
    }
    await titreCreate(titrePublicLecture, {})
    const res = await graphQLCall(titreQuery, { id: 'titre-id' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({
      titre: { id: 'titre-id' }
    })
  })

  test('ne peut pas voir un titre qui n\'est pas en "lecture publique" (utilisateur anonyme)', async () => {
    await titreCreate(titrePublicLectureFalse, {})
    const res = await graphQLCall(titreQuery, { id: 'titre-id' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({ titre: null })
  })

  test('ne peut voir que les démarches qui sont en "lecture publique" (utilisateur anonyme)', async () => {
    await titreCreate(titreDemarchesPubliques, {})
    const res = await graphQLCall(titreQuery, { id: 'titre-id' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({
      titre: {
        id: 'titre-id',
        demarches: [{ id: 'titre-id-demarche-oct' }]
      }
    })

    expect(res.body.data.titre.demarches.length).toEqual(1)
  })

  test('ne peut pas voir les activités (utilisateur anonyme)', async () => {
    await titreCreate(titreActivites, {})
    const res = await graphQLCall(titreQuery, { id: 'titre-id' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({
      titre: {
        id: 'titre-id'
      }
    })

    expect(res.body.data.titre.activites.length).toEqual(0)
  })

  test('ne peut voir que les étapes qui sont en "lecture publique" (utilisateur anonyme)', async () => {
    await titreCreate(titreEtapesPubliques, {})
    const res = await graphQLCall(titreQuery, { id: 'titre-id' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({
      titre: {
        id: 'titre-id',
        demarches: [
          {
            id: 'titre-id-demarche-id',
            etapes: [{ id: 'titre-id-demarche-id-dpu' }]
          }
        ]
      }
    })
    expect(res.body.data.titre.demarches[0].etapes.length).toEqual(1)
  })

  test('ne peut pas voir certaines étapes (utilisateur DGTM)', async () => {
    await titreCreate(titreEtapesPubliques, {})
    const res = await graphQLCall(
      titreQuery,
      { id: 'titre-id' },
      'admin',
      ADMINISTRATION_IDS['DGTM - GUYANE']
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.titre.demarches[0].etapes).toHaveLength(8)
    expect(
      res.body.data.titre.demarches[0].etapes.map(({ id }: { id: string }) => ({
        id
      }))
    ).toEqual(
      expect.arrayContaining([
        { id: 'titre-id-demarche-id-aof' },
        { id: 'titre-id-demarche-id-dpu' },
        { id: 'titre-id-demarche-id-ede' },
        { id: 'titre-id-demarche-id-edm' },
        { id: 'titre-id-demarche-id-pfc' },
        { id: 'titre-id-demarche-id-pfd' },
        { id: 'titre-id-demarche-id-vfc' },
        { id: 'titre-id-demarche-id-vfd' }
      ])
    )
  })

  test('ne peut pas voir certaines étapes (utilisateur ONF)', async () => {
    await titreCreate(titreEtapesPubliques, {})
    const res = await graphQLCall(
      titreQuery,
      { id: 'titre-id' },
      'admin',
      ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.titre.demarches[0].etapes.length).toEqual(9)
    expect(
      res.body.data.titre.demarches[0].etapes.map(({ id }: { id: string }) => ({
        id
      }))
    ).toEqual(
      expect.arrayContaining([
        { id: 'titre-id-demarche-id-aof' },
        { id: 'titre-id-demarche-id-eof' },
        { id: 'titre-id-demarche-id-edm' },
        { id: 'titre-id-demarche-id-pfc' },
        { id: 'titre-id-demarche-id-pfd' },
        { id: 'titre-id-demarche-id-vfc' },
        { id: 'titre-id-demarche-id-vfd' },
        { id: 'titre-id-demarche-id-ede' },
        { id: 'titre-id-demarche-id-dpu' }
      ])
    )
  })

  test('peut modifier les activités GRP (utilisateur DEAL Guyane)', async () => {
    await titreCreate(titreWithActiviteGrp, {})
    const res = await graphQLCall(
      titreQuery,
      { id: 'titre-id' },
      'admin',
      ADMINISTRATION_IDS['DGTM - GUYANE']
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({
      titre: { activites: [{ modification: true }] }
    })
  })

  test('ne peut pas voir les activités GRP (utilisateur CACEM)', async () => {
    await titreCreate(titreWithActiviteGrp, {})
    const res = await graphQLCall(
      titreQuery,
      { id: 'titre-id' },
      'admin',
      ADMINISTRATION_IDS.CACEM
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data).toMatchObject({
      titre: { activites: [] }
    })
  })
})

describe('titreCreer', () => {
  const titreCreerQuery = queryImport('titre-creer')

  test('ne peut pas créer un titre (utilisateur anonyme)', async () => {
    const res = await graphQLCall(titreCreerQuery, {
      titre: { nom: 'titre', typeId: 'arm', domaineId: 'm' }
    })

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("ne peut pas créer un titre prm (un utilisateur 'entreprise')", async () => {
    const res = await graphQLCall(
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'prm', domaineId: 'm' } },
      'entreprise'
    )

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("crée un titre (un utilisateur 'super')", async () => {
    const res = await graphQLCall(
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'arm', domaineId: 'm' } },
      'super'
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { titreCreer: { slug: 'm-ar-titre-0000', nom: 'titre' } }
    })
  })

  test("ne peut pas créer un titre AXM (un utilisateur 'admin' PTMG)", async () => {
    const res = await graphQLCall(
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'axm', domaineId: 'm' } },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("ne peut pas créer un titre ARM (un utilisateur 'admin' Déal Guyane)", async () => {
    const res = await graphQLCall(
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'arm', domaineId: 'm' } },
      'admin',
      ADMINISTRATION_IDS['DGTM - GUYANE']
    )

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("crée un titre ARM (un utilisateur 'admin' PTMG)", async () => {
    const res = await graphQLCall(
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'arm', domaineId: 'm' } },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { titreCreer: { slug: 'm-ar-titre-0000', nom: 'titre' } }
    })
  })
})

describe('titreModifier', () => {
  const titreModifierQuery = queryImport('titre-modifier')

  let id = ''

  beforeEach(async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        domaineId: 'm',
        typeId: 'arm',
        propsTitreEtapesIds: {}
      },
      {}
    )
    id = titre.id
  })

  test('ne peut pas modifier un titre (utilisateur anonyme)', async () => {
    const res = await graphQLCall(titreModifierQuery, {
      titre: { id, nom: 'mon titre modifié' }
    })

    expect(res.body.errors[0].message).toMatch(/le titre n'existe pas/)
  })

  test("ne peut pas modifier un titre (un utilisateur 'entreprise')", async () => {
    const res = await graphQLCall(
      titreModifierQuery,
      {
        titre: { id, nom: 'mon titre modifié' }
      },
      'entreprise'
    )

    expect(res.body.errors[0].message).toMatch(/le titre n'existe pas/)
  })

  test("modifie un titre (un utilisateur 'super')", async () => {
    const res = await graphQLCall(
      titreModifierQuery,
      {
        titre: { id, nom: 'mon titre modifié' }
      },
      'super'
    )

    expect(res.body).toMatchObject({
      data: {
        titreModifier: {
          slug: 'm-ar-mon-titre-modifie-0000',
          nom: 'mon titre modifié'
        }
      }
    })
  })

  test("modifie un titre ARM (un utilisateur 'admin' PTMG)", async () => {
    const res = await graphQLCall(
      titreModifierQuery,
      {
        titre: { id, nom: 'mon titre modifié' }
      },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body).toMatchObject({
      data: {
        titreModifier: {
          id,
          slug: 'm-ar-mon-titre-modifie-0000',
          nom: 'mon titre modifié'
        }
      }
    })
  })

  test("ne peut pas modifier un titre ARM échu (un utilisateur 'admin' PTMG)", async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre échu',
        domaineId: 'm',
        typeId: 'arm',
        titreStatutId: 'ech',
        propsTitreEtapesIds: {}
      },
      {}
    )

    const res = await graphQLCall(
      titreModifierQuery,
      {
        titre: {
          id: titre.id,
          nom: 'mon titre échu modifié'
        }
      },
      'admin',
      ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test("ne peut pas modifier un titre ARM (un utilisateur 'admin' DGTM)", async () => {
    const res = await graphQLCall(
      titreModifierQuery,
      {
        titre: { id, nom: 'mon titre modifié' }
      },
      'admin',
      ADMINISTRATION_IDS['DGTM - GUYANE']
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })
})

describe('titreSupprimer', () => {
  const titreSupprimerQuery = queryImport('titre-supprimer')

  let id = ''

  beforeEach(async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        domaineId: 'm',
        typeId: 'arm',
        propsTitreEtapesIds: {}
      },
      {}
    )
    id = titre.id
  })

  test('ne peut pas supprimer un titre (utilisateur anonyme)', async () => {
    const res = await graphQLCall(titreSupprimerQuery, { id })
    expect(res.body.errors[0].message).toMatch(/le titre n'existe pas/)
  })

  test('peut supprimer un titre (utilisateur super)', async () => {
    const res = await graphQLCall(titreSupprimerQuery, { id }, 'super')

    expect(res.body).toMatchObject({
      data: { titreSupprimer: expect.any(String) }
    })
  })

  test('ne peut pas supprimer un titre inexistant (utilisateur super)', async () => {
    const res = await graphQLCall(titreSupprimerQuery, { id: 'toto' }, 'super')

    expect(res.body.errors[0].message).toMatch(/le titre n'existe pas/)
  })
})
