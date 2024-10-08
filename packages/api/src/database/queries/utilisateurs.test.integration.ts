import { dbManager } from '../../../tests/db-manager'
import { beforeAll, expect, afterAll, test, vi, describe } from 'vitest'
import { createUtilisateur, getUtilisateurByKeycloakId, getUtilisateursByTitreId, getUtilisateursEmailsByEntrepriseIds, newGetUtilisateurById, updateUtilisateur } from './utilisateurs.queries'
import { Pool } from 'pg'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { entrepriseUpsert } from './entreprises'
import { newUtilisateurId } from '../models/_format/id-create'
import { getCurrent } from 'camino-common/src/date'
import { callAndExit } from '../../tools/fp-tools'
import { userSuper } from '../user-super'
import { createTitre } from '../../api/rest/titre-demande.queries'
import { utilisateurTitreCreate } from './utilisateurs-titres'
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
    await createUtilisateur(dbPool, {
      id: utilisateurId,
      prenom: `jean`,
      nom: `dupont`,
      email: `jean@dupont.fr`,
      date_creation: getCurrent(),
      keycloak_id: 'iduser-keycloak',
      role: 'entreprise',
      entrepriseIds: [entrepriseId],
      telephone_fixe: null,
      telephone_mobile: null,
    })
    await createUtilisateur(dbPool, {
      id: newUtilisateurId('utilisateur_id2'),
      prenom: `antoine`,
      nom: `dupont`,
      email: `antoine@dupont.fr`,
      date_creation: getCurrent(),
      keycloak_id: 'iduser-keycloak',
      role: 'entreprise',
      entrepriseIds: [entrepriseId2],
      telephone_fixe: null,
      telephone_mobile: null,
    })

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
    await createUtilisateur(dbPool, {
      id: utilisateurId,
      prenom: `jean`,
      nom: `dupont`,
      email: newUtilisateurId(),
      date_creation: getCurrent(),
      keycloak_id: 'iduser-keycloak',
      role: 'entreprise',
      entrepriseIds: [entrepriseId],
      telephone_fixe: null,
      telephone_mobile: null,
    })

    const result = await callAndExit(newGetUtilisateurById(dbPool, utilisateurId, userSuper), async r => r)

    expect(result.id).toEqual(utilisateurId)
  })
  test('peut récupérer un utilisateur admin', async () => {
    const utilisateurId = newUtilisateurId()
    await createUtilisateur(dbPool, {
      id: utilisateurId,
      prenom: `jean`,
      nom: `dupont`,
      email: newUtilisateurId(),
      date_creation: getCurrent(),
      keycloak_id: 'iduser-keycloak',
      role: 'admin',
      administrationId: 'aut-mrae-guyane-01',
      telephone_fixe: null,
      telephone_mobile: null,
    })

    const result = await callAndExit(newGetUtilisateurById(dbPool, utilisateurId, userSuper), async r => r)

    expect(result.id).toEqual(utilisateurId)
  })
})

describe('getUtilisateurByKeycloakId', () => {
  test('peut récupérer un utilisateur admin', async () => {
    const utilisateurId = newUtilisateurId()
    await createUtilisateur(dbPool, {
      id: utilisateurId,
      prenom: `jean`,
      nom: `dupont`,
      email: newUtilisateurId(),
      date_creation: getCurrent(),
      keycloak_id: utilisateurId,
      role: 'admin',
      administrationId: 'aut-mrae-guyane-01',
      telephone_fixe: null,
      telephone_mobile: null,
    })

    const result = await getUtilisateurByKeycloakId(dbPool, utilisateurId)
    expect(result?.id).toEqual(utilisateurId)
  })
})

describe('updateUtilisateur', () => {
  test('peut récupérer un utilisateur admin', async () => {
    const utilisateurId = newUtilisateurId()
    const utilisateur = await createUtilisateur(dbPool, {
      id: utilisateurId,
      prenom: `jean`,
      nom: `dupont`,
      email: newUtilisateurId(),
      date_creation: getCurrent(),
      keycloak_id: utilisateurId,
      role: 'admin',
      administrationId: 'aut-mrae-guyane-01',
      telephone_fixe: null,
      telephone_mobile: null,
    })

    await updateUtilisateur(dbPool, { ...utilisateur, nom: 'nouveau nom', prenom: 'nouveau prenom', email: 'nouveau email' })

    const newUtilisateur = await getUtilisateurByKeycloakId(dbPool, utilisateurId)
    expect(newUtilisateur).toMatchObject({
      nom: 'nouveau nom',
      prenom: 'nouveau prenom',
      email: 'nouveau email',
    })
  })
})

describe('getUtilisateursByTitreId', () => {
  test('peut récupérer les utilisateurs abonnés à un titre', async () => {
    const utilisateurId = newUtilisateurId()
    await createUtilisateur(dbPool, {
      id: utilisateurId,
      prenom: `jean`,
      nom: `dupont`,
      email: utilisateurId,
      date_creation: getCurrent(),
      keycloak_id: utilisateurId,
      role: 'admin',
      administrationId: 'aut-mrae-guyane-01',
      telephone_fixe: null,
      telephone_mobile: null,
    })

    const titreId = await callAndExit(createTitre(dbPool, userSuper, { nom: 'mon super titre', references: [], titreTypeId: 'arm' }), async t => t)

    let result = await getUtilisateursByTitreId(dbPool, titreId)
    expect(result).toHaveLength(0)

    await utilisateurTitreCreate({ titreId, utilisateurId })

    result = await getUtilisateursByTitreId(dbPool, titreId)
    expect(result[0]).toMatchObject({
      administrationId: 'aut-mrae-guyane-01',
      email: utilisateurId,
      id: utilisateurId,
      nom: 'dupont',
      prenom: 'jean',
      role: 'admin',
      telephone_fixe: null,
      telephone_mobile: null,
    })
  })
})
