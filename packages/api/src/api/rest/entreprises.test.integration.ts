import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restCall, restPutCall } from '../../../tests/_utils/index.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { afterAll, beforeAll, describe, test, expect } from 'vitest'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import { userSuper } from '../../database/user-super.js'
import { testBlankUser } from 'camino-common/src/tests-utils.js'

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('fiscalite', () => {
  test('un utilisateur defaut n’a pas les droits', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('plop'),
      nom: 'Mon Entreprise',
    })
    const tested = await restCall(CaminoRestRoutes.fiscaliteEntreprise, { entrepriseId: entreprise.id, annee: '2022' }, { role: 'defaut' })

    expect(tested.statusCode).toBe(403)
  })
})

describe('entrepriseModifier', () => {
  test('ne peut pas modifier une entreprise (utilisateur anonyme)', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('anonymous'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, undefined, { id: entreprise.id, email: 'toto@gmail.com' })
    expect(tested.statusCode).toBe(403)
  })

  test("peut modifier une entreprise (un utilisateur 'super')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('super'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, email: 'toto@gmail.com' })
    expect(tested.statusCode).toBe(204)
  })

  test("peut modifier une entreprise (un utilisateur 'entreprise')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('entreprise'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(
      CaminoRestRoutes.entreprise,
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entreprise.id }] },
      { id: entreprise.id, email: 'toto@gmail.com' }
    )
    expect(tested.statusCode).toBe(204)
  })

  test('un utilisateur entreprise ne peut pas modifier une entreprise qui ne lui appartient pas', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('otherEntreprise'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(
      CaminoRestRoutes.entreprise,
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'entreprise', entreprises: [] },
      { id: entreprise.id, email: 'toto@gmail.com' }
    )
    expect(tested.statusCode).toBe(403)
  })

  test("ne peut pas modifier une entreprise avec un email invalide (un utilisateur 'super')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('super'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, email: 'totogmailcom' })
    expect(tested.statusCode).toBe(400)
  })

  test("ne peut pas modifier une entreprise inexistante (un utilisateur 'super')", async () => {
    const entrepriseId = newEntrepriseId('unknown')
    const tested = await restPutCall(CaminoRestRoutes.entreprise, { entrepriseId: newEntrepriseId('unknown') }, userSuper, { id: entrepriseId, email: 'totogmailcom' })
    expect(tested.statusCode).toBe(400)
  })

  test('peut archiver une entreprise (super)', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('superArchive'),
      nom: 'Mon Entreprise',
      archive: false,
    })
    const tested = await restPutCall(CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, archive: true })
    expect(tested.statusCode).toBe(204)
  })
  test('ne peut pas archiver une entreprise', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('notArchive'),
      nom: 'Mon Entreprise',
      archive: false,
    })
    const tested = await restPutCall(
      CaminoRestRoutes.entreprise,
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
      { id: entreprise.id, archive: true }
    )
    expect(tested.statusCode).toBe(400)
  })
})
