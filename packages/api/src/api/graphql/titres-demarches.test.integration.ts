import { dbManager } from '../../../tests/db-manager'
import { graphQLCall, queryImport } from '../../../tests/_utils/index'
import { titreCreate } from '../../database/queries/titres'
import { titreEtapeUpsert } from '../../database/queries/titres-etapes'
import { userSuper } from '../../database/user-super'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { toCaminoDate } from 'camino-common/src/date'

import { afterAll, beforeAll, afterEach, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { newEtapeId } from '../../database/models/_format/id-create'
import TitresDemarches from '../../database/models/titres-demarches'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterEach(async () => {
  await dbManager.truncateSchema()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('demarcheCreer', () => {
  const demarcheCreerQuery = queryImport('titre-demarche-creer')

  test('ne peut pas créer une démarche (utilisateur anonyme)', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
        publicLecture: true,
      },
      {}
    )

    const res = await graphQLCall(
      dbPool,
      demarcheCreerQuery,
      {
        demarche: { titreId: titre.id, typeId: 'dpu' },
      },
      undefined
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test('ne peut pas créer une démarche (utilisateur editeur)', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
        publicLecture: true,
      },
      {}
    )

    const res = await graphQLCall(
      dbPool,
      demarcheCreerQuery,
      { demarche: { titreId: titre.id, typeId: 'dpu' } },
      {
        role: 'editeur',
        administrationId: 'ope-onf-973-01',
      }
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test('peut créer une démarche (utilisateur super)', async () => {
    const titre = await titreCreate({ nom: 'titre', typeId: 'arm', titreStatutId: 'val', propsTitreEtapesIds: {} }, {})

    const titreId = titre.id

    const res = await graphQLCall(dbPool, demarcheCreerQuery, { demarche: { titreId, typeId: 'oct' } }, userSuper)

    expect(res.body.errors).toBe(undefined)
    expect(res.body).toMatchObject({ data: { demarcheCreer: {} } })
  })

  test('ne peut pas créer une démarche si titre inexistant (utilisateur admin)', async () => {
    const res = await graphQLCall(
      dbPool,
      demarcheCreerQuery,
      { demarche: { titreId: 'unknown', typeId: 'oct' } },
      {
        role: 'admin',
        administrationId: 'ope-onf-973-01',
      }
    )

    expect(res.body.errors[0].message).toBe("le titre n'existe pas")
  })

  test('peut créer une démarche (utilisateur admin)', async () => {
    const titre = await titreCreate({ nom: 'titre', typeId: 'arm', titreStatutId: 'val', propsTitreEtapesIds: {} }, {})

    const titreId = titre.id

    const res = await graphQLCall(
      dbPool,
      demarcheCreerQuery,
      { demarche: { titreId, typeId: 'oct' } },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors).toBe(undefined)
    expect(res.body).toMatchObject({ data: { demarcheCreer: {} } })
  })

  test("ne peut pas créer une démarche sur un titre ARM échu (un utilisateur 'admin' PTMG)", async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre échu',
        typeId: 'arm',
        titreStatutId: 'ech',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const res = await graphQLCall(
      dbPool,
      demarcheCreerQuery,
      { demarche: { titreId: titre.id, typeId: 'oct' } },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })
})

describe('demarcheModifier', () => {
  const demarcheModifierQuery = queryImport('titre-demarche-modifier')

  test('ne peut pas modifier une démarche (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      dbPool,
      demarcheModifierQuery,
      {
        demarche: { id: 'toto', titreId: '', typeId: '' },
      },
      undefined
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test('ne peut pas modifier une démarche (utilisateur editeur)', async () => {
    const res = await graphQLCall(dbPool, demarcheModifierQuery, { demarche: { id: 'toto', titreId: '', typeId: '' } }, { role: 'editeur', administrationId: 'ope-onf-973-01' })

    expect(res.body.errors[0].message).toBe('la démarche n’existe pas')
  })

  test('peut modifier une démarche (utilisateur super)', async () => {
    const { demarcheId, titreId } = await demarcheCreate()

    const res = await graphQLCall(dbPool, demarcheModifierQuery, { demarche: { id: demarcheId, titreId, typeId: 'pro' } }, userSuper)

    expect(res.body.errors).toBe(undefined)
    const demarche = await TitresDemarches.query().findById(demarcheId)
    expect(demarche?.typeId).toBe('pro')
  })

  test('ne peut pas modifier une démarche avec un titre inexistant (utilisateur super)', async () => {
    const res = await graphQLCall(dbPool, demarcheModifierQuery, { demarche: { id: 'toto', titreId: '', typeId: '' } }, userSuper)

    expect(res.body.errors[0].message).toBe('la démarche n’existe pas')
  })

  test('peut modifier une démarche d’un titre ARM en PTMG (utilisateur admin)', async () => {
    const { demarcheId, titreId } = await demarcheCreate()

    const res = await graphQLCall(
      dbPool,
      demarcheModifierQuery,
      { demarche: { id: demarcheId, titreId, typeId: 'pro' } },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors).toBe(undefined)

    const demarche = await TitresDemarches.query().findById(demarcheId)
    expect(demarche?.typeId).toBe('pro')
  })

  test('ne peut pas modifier une démarche d’un titre ARM en DGCL/SDFLAE/FL1 (utilisateur admin)', async () => {
    const { demarcheId, titreId } = await demarcheCreate()

    const res = await graphQLCall(dbPool, demarcheModifierQuery, { demarche: { id: demarcheId, titreId, typeId: 'pro' } }, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] })

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test('ne peut modifier une démarche inexistante', async () => {
    const { titreId } = await demarcheCreate()

    const res = await graphQLCall(dbPool, demarcheModifierQuery, { demarche: { id: 'wrongId', titreId, typeId: 'pro' } }, userSuper)

    expect(res.body.errors).toHaveLength(1)
    expect(res.body.errors[0].message).toBe('la démarche n’existe pas')
  })

  test('ne peut pas modifier le type d’une démarche si elle a au moins une étape', async () => {
    const { demarcheId, titreId } = await demarcheCreate()

    await titreEtapeUpsert(
      {
        id: newEtapeId(`${demarcheId}-mno01`),
        typeId: 'mno',
        titreDemarcheId: demarcheId,
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2020-01-01'),
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
      },
      userSuper,
      titreId
    )

    const res = await graphQLCall(
      dbPool,
      demarcheModifierQuery,
      {
        demarche: {
          id: demarcheId,
          titreId,
          typeId: 'pro',
        },
      },
      userSuper
    )

    expect(res.body.errors).toHaveLength(1)
    expect(res.body.errors[0].message).toBe('impossible de modifier le type d’une démarche si celle-ci a déjà une ou plusieurs étapes')
  })
})

// FIXME: mettre en commun avec demarches.test.integration ?
const demarcheCreate = async () => {
  const titre = await titreCreate(
    {
      nom: 'mon titre',
      typeId: 'arm',
      titreStatutId: 'ind',
      propsTitreEtapesIds: {},
    },
    {}
  )

  const titreDemarche = await TitresDemarches.query().insertAndFetch({ titreId: titre.id, typeId: 'oct' })

  return {
    titreId: titre.id,
    demarcheId: titreDemarche.id,
  }
}
