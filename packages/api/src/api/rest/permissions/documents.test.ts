import { describe, expect, test } from 'vitest'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { canReadDocument } from './documents'
import { ADMINISTRATION_ROLES, EntrepriseUserNotNull, User } from 'camino-common/src/roles'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const shouldNotBeCalled = () => Promise.reject(new Error('should not be called'))

describe('canReadDocument', () => {
  test('en tant que super je peux lire tous les documnents', async () => {
    expect(
      await canReadDocument({ public_lecture: false, entreprises_lecture: false }, { ...testBlankUser, role: 'super' }, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', {
        public_lecture: false,
        entreprises_lecture: false,
        titre_public_lecture: false,
        demarche_type_id: 'oct',
      })
    ).toBe(true)
  })

  test('en tant qu’administration je peux lire tous les documents', async () => {
    for (const role of ADMINISTRATION_ROLES) {
      expect(
        await canReadDocument(
          { public_lecture: false, entreprises_lecture: false },
          { ...testBlankUser, role, administrationId: 'dea-guyane-01' },
          () => Promise.resolve('arm'),
          () => Promise.resolve(['dea-guyane-01']),
          shouldNotBeCalled,
          'mfr',
          { public_lecture: false, entreprises_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' }
        )
      ).toBe(true)
    }
  })

  test('en tant qu’entreprise ou non connecté, je peux lire les documents public', async () => {
    const users: User[] = [
      { ...testBlankUser, role: 'defaut' },
      { ...testBlankUser, role: 'entreprise', entreprises: [{ id: newEntrepriseId('entreprise1'), nom: 'nom' }] },
      { ...testBlankUser, role: 'bureau d’études', entreprises: [{ id: newEntrepriseId('entreprise2'), nom: 'nom' }] },
    ]
    for (const user of users) {
      expect(
        await canReadDocument({ public_lecture: true, entreprises_lecture: false }, user, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', {
          public_lecture: true,
          entreprises_lecture: false,
          titre_public_lecture: true,
          demarche_type_id: 'oct',
        })
      ).toBe(true)
    }
  })

  test('en tant qu’entreprise je peux lire les documents en fonction de entreprise_lecture', async () => {
    const users: EntrepriseUserNotNull[] = [
      { ...testBlankUser, role: 'entreprise', entreprises: [{ id: newEntrepriseId('entreprise1'), nom: 'nom' }] },
      { ...testBlankUser, role: 'bureau d’études', entreprises: [{ id: newEntrepriseId('entreprise2'), nom: 'nom' }] },
    ]
    for (const user of users) {
      expect(
        await canReadDocument({ public_lecture: false, entreprises_lecture: false }, user, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', {
          public_lecture: true,
          entreprises_lecture: false,
          titre_public_lecture: true,
          demarche_type_id: 'oct',
        })
      ).toBe(false)
      expect(
        await canReadDocument({ public_lecture: false, entreprises_lecture: true }, user, shouldNotBeCalled, shouldNotBeCalled, () => Promise.resolve(user.entreprises.map(({ id }) => id)), 'mfr', {
          public_lecture: true,
          entreprises_lecture: false,
          titre_public_lecture: true,
          demarche_type_id: 'oct',
        })
      ).toBe(true)
      expect(
        await canReadDocument({ public_lecture: false, entreprises_lecture: true }, user, shouldNotBeCalled, shouldNotBeCalled, () => Promise.resolve([]), 'mfr', {
          public_lecture: true,
          entreprises_lecture: false,
          titre_public_lecture: true,
          demarche_type_id: 'oct',
        })
      ).toBe(false)
    }
  })

  test('en tant non connecté, je peux lire seulement les documents public', async () => {
    expect(
      await canReadDocument({ public_lecture: true, entreprises_lecture: false }, { ...testBlankUser, role: 'defaut' }, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', {
        public_lecture: true,
        entreprises_lecture: false,
        titre_public_lecture: true,
        demarche_type_id: 'oct',
      })
    ).toBe(true)
    expect(
      await canReadDocument({ public_lecture: false, entreprises_lecture: false }, { ...testBlankUser, role: 'defaut' }, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', {
        public_lecture: true,
        entreprises_lecture: false,
        titre_public_lecture: true,
        demarche_type_id: 'oct',
      })
    ).toBe(false)
  })
})
