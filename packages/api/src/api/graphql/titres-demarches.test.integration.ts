import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreEtapeUpsert } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { toCaminoDate } from 'camino-common/src/date.js'

import { afterAll, beforeAll, afterEach, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { newEtapeId } from '../../database/models/_format/id-create.js'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterEach(async () => {
  await dbManager.reseedDb()
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
    const resTitreCreer = await graphQLCall(dbPool, queryImport('titre-creer'), { titre: { nom: 'titre', typeId: 'arm' } }, userSuper)

    const titreId = resTitreCreer.body.data.titreCreer.id

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
    const resTitreCreer = await graphQLCall(dbPool, queryImport('titre-creer'), { titre: { nom: 'titre', typeId: 'arm' } }, userSuper)

    const titreId = resTitreCreer.body.data.titreCreer.id

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
    expect(res.body.data.demarcheModifier.demarches[0].typeId).toBe('pro')
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
    expect(res.body.data.demarcheModifier.demarches[0].typeId).toBe('pro')
  })

  test('ne peut pas modifier une démarche d’un titre ARM en DEA (utilisateur admin)', async () => {
    const { demarcheId, titreId } = await demarcheCreate()

    const res = await graphQLCall(dbPool, demarcheModifierQuery, { demarche: { id: demarcheId, titreId, typeId: 'pro' } }, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })

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

describe('demarcheSupprimer', () => {
  const demarcheSupprimerQuery = queryImport('titre-demarche-supprimer')

  test('ne peut pas supprimer une démarche (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      dbPool,
      demarcheSupprimerQuery,
      {
        id: 'toto',
      },
      userSuper
    )
    expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
  })

  test('ne peut pas supprimer une démarche (utilisateur admin)', async () => {
    const res = await graphQLCall(dbPool, demarcheSupprimerQuery, { id: 'toto' }, { role: 'admin', administrationId: 'ope-onf-973-01' })

    expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
  })

  test('ne peut pas supprimer une démarche inexistante (utilisateur super)', async () => {
    const res = await graphQLCall(dbPool, demarcheSupprimerQuery, { id: 'toto' }, userSuper)

    expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
  })

  test('peut supprimer une démarche (utilisateur super)', async () => {
    const { demarcheId } = await demarcheCreate()
    const res = await graphQLCall(dbPool, demarcheSupprimerQuery, { id: demarcheId }, userSuper)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.demarcheSupprimer.demarches.length).toBe(0)
  })
})

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

  const resDemarchesCreer = await graphQLCall(dbPool, queryImport('titre-demarche-creer'), { demarche: { titreId: titre.id, typeId: 'oct' } }, userSuper)

  expect(resDemarchesCreer.body.errors).toBe(undefined)

  return {
    titreId: resDemarchesCreer.body.data.demarcheCreer.id,
    demarcheId: resDemarchesCreer.body.data.demarcheCreer.demarches[0].id,
  }
}
