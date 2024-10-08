import { test, expect } from 'vitest'
import { newEntrepriseId } from '../entreprise'
import { ADMINISTRATION_IDS } from '../static/administrations'
import { canEditEntreprise, canCreateEntreprise, canSeeEntrepriseDocuments } from './entreprises'
import { testBlankUser, TestUser } from '../tests-utils'

const entrepriseId = newEntrepriseId('entrepriseId')
test.each<[TestUser, boolean]>([
  [{ role: 'super' }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'lecteur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    false,
  ],
  [{ role: 'entreprise', entrepriseIds: [entrepriseId] }, true],
  [{ role: 'bureau d’études', entrepriseIds: [entrepriseId] }, true],
  [{ role: 'bureau d’études', entrepriseIds: [newEntrepriseId('autreEntrepriseId')] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [] }, false],
  [{ role: 'defaut' }, false],
])('l’utilisateur %p peut modifier une entreprise %p', async (user, modification) => {
  expect(canEditEntreprise({ ...user, ...testBlankUser }, entrepriseId)).toEqual(modification)
})

test.each<[TestUser, boolean]>([
  [{ role: 'super' }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'lecteur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    false,
  ],
  [{ role: 'entreprise', entrepriseIds: [entrepriseId] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [entrepriseId] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [newEntrepriseId('autreEntrepriseId')] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [] }, false],
  [{ role: 'defaut' }, false],
])('l’utilisateur %p peut créer une entreprise %p', async (user, creation) => {
  expect(canCreateEntreprise({ ...user, ...testBlankUser })).toEqual(creation)
})

test.each<[TestUser, boolean]>([
  [{ role: 'super' }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'lecteur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    false,
  ],
  [{ role: 'entreprise', entrepriseIds: [entrepriseId] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [entrepriseId] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [newEntrepriseId('autreEntrepriseId')] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [] }, false],
  [{ role: 'defaut' }, false],
])('l’utilisateur %p peut créer une entreprise %p', async (user, modification) => {
  expect(canCreateEntreprise({ ...user, ...testBlankUser })).toEqual(modification)
})

test.each<[TestUser, boolean]>([
  [{ role: 'super' }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [
    {
      role: 'lecteur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    true,
  ],
  [{ role: 'entreprise', entrepriseIds: [entrepriseId] }, true],
  [{ role: 'bureau d’études', entrepriseIds: [entrepriseId] }, true],
  [{ role: 'bureau d’études', entrepriseIds: [newEntrepriseId('autreEntrepriseId')] }, false],
  [{ role: 'bureau d’études', entrepriseIds: [] }, false],
  [{ role: 'defaut' }, false],
])("l’utilisateur %p peut voir les documents d'une entreprise %p", async (user, canSee) => {
  expect(canSeeEntrepriseDocuments({ ...user, ...testBlankUser }, entrepriseId)).toEqual(canSee)
})
