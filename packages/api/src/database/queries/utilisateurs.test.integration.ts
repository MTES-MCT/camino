import { dbManager } from '../../../tests/db-manager'
import { beforeAll, expect, afterAll, test, vi, describe } from 'vitest'
import { getUtilisateurByKeycloakId, getUtilisateursEmailsByEntrepriseIds, newGetUtilisateurById } from './utilisateurs.queries'
import { Pool } from 'pg'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { entrepriseUpsert } from './entreprises'
import { utilisateurCreate } from './utilisateurs'
import { newUtilisateurId } from '../models/_format/id-create'
import { getCurrent } from 'camino-common/src/date'
import { callAndExit } from '../../tools/fp-tools'
import { userSuper } from '../user-super'
console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('getUtilisateursEmailsByEntrepriseIds', () => {
  test("renvoie une liste vide quand aucun utilisateur n'existe pour les entreprises demandées", async () => {
    const result = await getUtilisateursEmailsByEntrepriseIds(dbPool, [newEntrepriseId('entrepriseId1')])

    expect(result).toHaveLength(0)
  })

  test('récupère les emails des utilisateurs de plusieurs entreprises', async () => {
    const entrepriseId = newEntrepriseId('entreprise_id1')
    const entrepriseId2 = newEntrepriseId('entreprise_id2')
    await entrepriseUpsert({
      id: entrepriseId,
      nom: 'Mon Entreprise',
    })
    await entrepriseUpsert({
      id: entrepriseId2,
      nom: 'Mon Entreprise',
    })

    const utilisateurId = newUtilisateurId('utilisateur_id')
    await utilisateurCreate(
      {
        id: utilisateurId,
        prenom: `jean`,
        nom: `dupont`,
        email: `jean@dupont.fr`,
        dateCreation: getCurrent(),
        keycloakId: 'iduser-keycloak',
        role: 'entreprise',
        entreprises: [{ id: entrepriseId }],
      },
      {}
    )
    await utilisateurCreate(
      {
        id: newUtilisateurId('utilisateur_id2'),
        prenom: `antoine`,
        nom: `dupont`,
        email: `antoine@dupont.fr`,
        dateCreation: getCurrent(),
        keycloakId: 'iduser-keycloak',
        role: 'entreprise',
        entreprises: [{ id: entrepriseId2 }],
      },
      {}
    )

    const result = await getUtilisateursEmailsByEntrepriseIds(dbPool, [entrepriseId])
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('jean@dupont.fr')
  })
})

describe('newGetUtilisateurById', () => {
  test('peut récupérer un utilisateur entreprise', async () => {
    const entrepriseId = newEntrepriseId('entreprise_id1')
    await entrepriseUpsert({
      id: entrepriseId,
      nom: 'Mon Entreprise',
    })

    const utilisateurId = newUtilisateurId()
    await utilisateurCreate(
      {
        id: utilisateurId,
        prenom: `jean`,
        nom: `dupont`,
        email: newUtilisateurId(),
        dateCreation: getCurrent(),
        keycloakId: 'iduser-keycloak',
        role: 'entreprise',
        entreprises: [{ id: entrepriseId }],
      },
      {}
    )

    const result = await callAndExit(newGetUtilisateurById(dbPool, utilisateurId, userSuper), async r => r)

    expect(result.id).toEqual(utilisateurId)
  })
  test('peut récupérer un utilisateur admin', async () => {
    const utilisateurId = newUtilisateurId()
    await utilisateurCreate(
      {
        id: utilisateurId,
        prenom: `jean`,
        nom: `dupont`,
        email: newUtilisateurId(),
        dateCreation: getCurrent(),
        keycloakId: 'iduser-keycloak',
        role: 'admin',
        administrationId: 'aut-mrae-guyane-01',
      },
      {}
    )

    const result = await callAndExit(newGetUtilisateurById(dbPool, utilisateurId, userSuper), async r => r)

    expect(result.id).toEqual(utilisateurId)
  })
})

describe('getUtilisateurByKeycloakId', () => {
  test('peut récupérer un utilisateur admin', async () => {
    const utilisateurId = newUtilisateurId()
    await utilisateurCreate(
      {
        id: utilisateurId,
        prenom: `jean`,
        nom: `dupont`,
        email: newUtilisateurId(),
        dateCreation: getCurrent(),
        keycloakId: utilisateurId,
        role: 'admin',
        administrationId: 'aut-mrae-guyane-01',
      },
      {}
    )

    const result = await getUtilisateurByKeycloakId(dbPool, utilisateurId)
    expect(result?.id).toEqual(utilisateurId)
  })
})
