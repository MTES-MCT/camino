import { User } from '../roles.js'
import { ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { canReadActivites } from './activites.js'
import { testBlankUser } from '../tests-utils'

test.each<[User, boolean]>([
  [{ ...testBlankUser, role: 'super' }, true],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DEAL - GUADELOUPE'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    false,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['PRÉFECTURE - ARDÈCHE'],
    },
    false,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS["DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"],
    },
    true,
  ],
  [{ ...testBlankUser, role: 'entreprise', entreprises: [] }, true],
  [{ ...testBlankUser, role: 'defaut' }, false],
])('utilisateur %s peur voir les activités: %s', async (user, lecture) => {
  expect(canReadActivites(user)).toBe(lecture)
})
