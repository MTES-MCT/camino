import { describe, expect, test } from 'vitest'
import { canReadDemarche } from './demarches'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { isAssociee, isGestionnaire } from 'camino-common/src/static/administrationsTitresTypes'
import { entrepriseIdValidator, newEntrepriseId } from 'camino-common/src/entreprise'

const shouldNotBeCalled = () => Promise.reject(new Error('should not be called'))

describe('canReadDemarche', () => {
  test('en tant que super je peux lire toutes les démarches', async () => {
    expect(
      await canReadDemarche(
        { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
        { ...testBlankUser, role: 'super' },
        shouldNotBeCalled,
        shouldNotBeCalled,
        shouldNotBeCalled
      )
    ).toBe(true)
  })

  test('en tant que super je peux lire un travaux', async () => {
    expect(
      await canReadDemarche(
        { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'aom' },
        { ...testBlankUser, role: 'super' },
        shouldNotBeCalled,
        shouldNotBeCalled,
        shouldNotBeCalled
      )
    ).toBe(true)
  })

  test('si la démarche est en lecture publique et que son titre est en lecture publique, tout le monde y a accès', async () => {
    expect(
      await canReadDemarche({ entreprises_lecture: false, public_lecture: true, titre_public_lecture: true, demarche_type_id: 'oct' }, null, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled)
    ).toBe(true)
  })

  describe("pour les utilisateurs administrations, on peut lire une démarche si l'utilisateur fait partie d'une administration gestionnaire, associé ou locale", () => {
    test('gestionnaire', async () => {
      const adminId = 'dea-guyane-01'
      const titreTypeId = 'axm'
      expect(isGestionnaire(adminId, titreTypeId)).toBe(true)
      expect(isAssociee(adminId, titreTypeId)).toBe(false)
      expect(
        await canReadDemarche(
          { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'admin', administrationId: adminId },
          () => Promise.resolve(titreTypeId),
          () => Promise.resolve([]),
          shouldNotBeCalled
        )
      ).toBe(true)
    })
    test('associée', async () => {
      const adminId = 'dea-guyane-01'
      const titreTypeId = 'arm'
      expect(isGestionnaire(adminId, titreTypeId)).toBe(false)
      expect(isAssociee(adminId, titreTypeId)).toBe(true)
      expect(
        await canReadDemarche(
          { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'admin', administrationId: adminId },
          () => Promise.resolve(titreTypeId),
          () => Promise.resolve([]),
          shouldNotBeCalled
        )
      ).toBe(true)
    })
    test('locale', async () => {
      const adminId = 'dre-aura-01'
      const titreTypeId = 'cxm'
      expect(isGestionnaire(adminId, titreTypeId)).toBe(false)
      expect(isAssociee(adminId, titreTypeId)).toBe(false)
      expect(
        await canReadDemarche(
          { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'admin', administrationId: adminId },
          () => Promise.resolve(titreTypeId),
          () => Promise.resolve([adminId]),
          shouldNotBeCalled
        )
      ).toBe(true)
    })

    test('ni gestionnaire, ni associée, ni locale', async () => {
      const adminId = 'dre-aura-01'
      const titreTypeId = 'cxm'
      expect(isGestionnaire(adminId, titreTypeId)).toBe(false)
      expect(isAssociee(adminId, titreTypeId)).toBe(false)
      expect(
        await canReadDemarche(
          { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'admin', administrationId: adminId },
          () => Promise.resolve(titreTypeId),
          () => Promise.resolve([]),
          shouldNotBeCalled
        )
      ).toBe(false)
    })
  })

  describe("pour les utilisateurs entreprises, on peut lire une démarche si la démarche entreprise_lecture ET que l'utilisateur fait partie d'une entreprise titulaire ou amodiataire", () => {
    test('pas lisible par une entreprise', async () => {
      const entrepriseId = newEntrepriseId('idEntreprise')
      expect(
        await canReadDemarche(
          { entreprises_lecture: false, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseId }] },
          shouldNotBeCalled,
          shouldNotBeCalled,
          () => Promise.resolve([entrepriseId])
        )
      ).toBe(false)
    })

    test('entreprise titulaire', async () => {
      const entrepriseId = entrepriseIdValidator.parse('entrepriseId')
      expect(
        await canReadDemarche(
          { entreprises_lecture: true, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseId }] },
          shouldNotBeCalled,
          shouldNotBeCalled,
          () => Promise.resolve([entrepriseId])
        )
      ).toBe(true)
    })

    test('entreprise non titulaire', async () => {
      const entrepriseIdTitulaire = entrepriseIdValidator.parse('entrepriseIdTitulaire')
      const entrepriseIdNonTitulaire = entrepriseIdValidator.parse('entrepriseIdNonTitulaire')
      expect(
        await canReadDemarche(
          { entreprises_lecture: true, public_lecture: false, titre_public_lecture: false, demarche_type_id: 'oct' },
          { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdTitulaire }] },
          shouldNotBeCalled,
          shouldNotBeCalled,
          () => Promise.resolve([entrepriseIdNonTitulaire])
        )
      ).toBe(false)
    })
  })
})
