import { test, expect } from 'vitest'
import { newEntrepriseId } from '../entreprise.js'
import { User } from '../roles.js'
import { ADMINISTRATION_IDS } from '../static/administrations.js'
import { canEditEntreprise, canCreateEntreprise } from './entreprises.js'

const entrepriseId = newEntrepriseId('entrepriseId')
test.each<[User, boolean]>([
  [{ role: 'super', administrationId: undefined }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    true
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    true
  ],
  [
    {
      role: 'lecteur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    false
  ],
  [{ role: 'entreprise', administrationId: undefined, entreprises: [{ id: entrepriseId }] }, true],
  [{ role: 'bureau d’études', administrationId: undefined, entreprises: [{ id: entrepriseId }] }, true],
  [{ role: 'bureau d’études', administrationId: undefined, entreprises: [{ id: newEntrepriseId('autreEntrepriseId') }] }, false],
  [{ role: 'bureau d’études', administrationId: undefined, entreprises: [] }, false],
  [{ role: 'defaut', administrationId: undefined }, false]
])('l’utilisateur %p peut modifier une entreprise %p', async (user, modification) => {
  expect(canEditEntreprise(user, entrepriseId)).toEqual(modification)
})

test.each<[User, boolean]>([
  [{ role: 'super', administrationId: undefined }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    true
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    true
  ],
  [
    {
      role: 'lecteur',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    false
  ],
  [{ role: 'entreprise', administrationId: undefined, entreprises: [{ id: entrepriseId }] }, false],
  [{ role: 'bureau d’études', administrationId: undefined, entreprises: [{ id: entrepriseId }] }, false],
  [{ role: 'bureau d’études', administrationId: undefined, entreprises: [{ id: newEntrepriseId('autreEntrepriseId') }] }, false],
  [{ role: 'bureau d’études', administrationId: undefined, entreprises: [] }, false],
  [{ role: 'defaut', administrationId: undefined }, false]
])('l’utilisateur %p peut créer une entreprise %p', async (user, modification) => {
  expect(canCreateEntreprise(user)).toEqual(modification)
})
