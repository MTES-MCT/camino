import { describe, expect, test } from 'vitest'
import { canReadEtape } from './etapes'
import { CanReadDemarche } from './demarches'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { isAssociee, isGestionnaire } from 'camino-common/src/static/administrationsTitresTypes'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

const shouldNotBeCalled = () => Promise.reject(new Error('should not be called'))

// On part du principe que le canReadDemarche est déjà testé
const demarche: CanReadDemarche = { public_lecture: true, entreprises_lecture: true, titre_public_lecture: true, demarche_type_id: 'oct' }
describe('canReadEtape', () => {
  test('en tant que super je peux lire toutes les démarches', async () => {
    expect(await canReadEtape({ ...testBlankUser, role: 'super' }, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', demarche)).toBe(true)
  })

  test("si la démarche est en lecture publique, que son titre est en lecture publique, et que l'étape est en lecture publique tout le monde y a accès", async () => {
    expect(await canReadEtape(null, shouldNotBeCalled, shouldNotBeCalled, shouldNotBeCalled, 'mfr', demarche)).toBe(true)
  })

  test("pour les utilisateurs administrations, on peut lire une étape si l'utilisateur fait partie d'une administration gestionnaire, associé ou locale et qu'il n'existe pas de restrictions pour cette administration", async () => {
    const adminId = 'aut-97300-01'
    const titreTypeId = 'arm'
    expect(isGestionnaire(adminId, titreTypeId)).toBe(false)
    expect(isAssociee(adminId, titreTypeId)).toBe(true)
    expect(
      await canReadEtape(
        { ...testBlankUser, role: 'admin', administrationId: adminId },
        () => Promise.resolve(titreTypeId),
        () => Promise.resolve([]),
        shouldNotBeCalled,
        'aof',
        demarche
      )
    ).toBe(false)

    expect(
      await canReadEtape(
        { ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' },
        () => Promise.resolve(titreTypeId),
        () => Promise.resolve([]),
        shouldNotBeCalled,
        'aof',
        demarche
      )
    ).toBe(true)
  })

  test("pour les utilisateurs entreprises, on peut lire une étape si la démarche est visible entreprise_lecture ET que l'étape est visible pour les entreprises ET que l'utilisateur fait partie d'une entreprise titulaire ou amodiataire", async () => {
    const entrepriseId = entrepriseIdValidator.parse('entrepriseId')
    expect(
      await canReadEtape(
        { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] },
        shouldNotBeCalled,
        shouldNotBeCalled,
        () => Promise.resolve([entrepriseId]),
        'cac',
        demarche
      )
    ).toBe(false)
  })
})
