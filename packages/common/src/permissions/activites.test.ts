import { User } from '../roles.js'
import { ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { canReadActivites } from './activites.js'

test.each<[User, boolean]>([
  [{ role: 'super', administrationId: undefined }, true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']
    },
    true
  ],
  [
    {
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']
    },
    true
  ],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DEAL - GUADELOUPE']
    },
    true
  ],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    },
    false
  ],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS["DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"]
    },
    true
  ],
  [{ role: 'entreprise', administrationId: undefined }, true],
  [{ role: 'defaut', administrationId: undefined }, false]
])('utilisateur %s peur voir les activités: %s', async (user, lecture) => {
  expect(canReadActivites(user)).toBe(lecture)
})
