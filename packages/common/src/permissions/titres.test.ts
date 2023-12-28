import { assertsCanCreateTitre, canCreateTitre, canDeleteTitre, canEditTitre, canHaveActiviteTypeId, canLinkTitres, getLinkConfig } from './titres.js'
import { TitresTypesIds, TitreTypeId } from '../static/titresTypes.js'
import { ADMINISTRATION_IDS, AdministrationId } from '../static/administrations.js'
import { test, expect, describe } from 'vitest'
import { testBlankUser, TestUser } from '../tests-utils.js'
import { User } from '../roles.js'
import { newEntrepriseId } from '../entreprise.js'
import { ACTIVITES_TYPES_IDS } from '../static/activitesTypes.js'
import { toCommuneId } from '../static/communes.js'
import { TitreStatutId, titresStatutsArray } from '../static/titresStatuts.js'

test('getTitreFromTypeId pas de fusions', () => {
  const titreFromTypeId = TitresTypesIds.reduce<{
    [key in TitreTypeId]?: {
      count: 'single' | 'multiple'
      typeId: TitreTypeId
    }
  }>((acc, titreTypeId) => {
    const linkConfig = getLinkConfig(titreTypeId, [])
    if (linkConfig !== null) {
      acc[titreTypeId] = linkConfig
    }

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
})
test('getTitreFromTypeId fusions', () => {
  const titreFromTypeId = TitresTypesIds.reduce<{
    [key in TitreTypeId]?: {
      count: 'single' | 'multiple'
      typeId: TitreTypeId
    }
  }>((acc, titreTypeId) => {
    const fusion = getLinkConfig(titreTypeId, [{ demarche_type_id: 'fus' }])
    if (fusion !== null) {
      acc[titreTypeId] = fusion
    }

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
})

test.each<[TestUser, AdministrationId[], boolean]>([
  [{ role: 'super' }, [], true],
  [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'] }, [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']], true],
  [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'] }, [ADMINISTRATION_IDS['DREAL - PAYS DE LA LOIRE']], false],
  [{ role: 'defaut' }, [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']], false],
])('un utilisateur $user peut modifier les liaisons d’un titre: $can ', (user, administrationIds, can) => {
  expect(canLinkTitres({ ...user, ...testBlankUser }, administrationIds)).toBe(can)
})

describe('canCreateTitre', () => {
  test('vérifie si une entreprise peut créer un titre de type', () => {
    const result: { [key in TitreTypeId]?: true } = {}

    const user: User = { role: 'entreprise', entreprises: [], ...testBlankUser }
    for (const titreTypeid of TitresTypesIds) {
      const itCan = canCreateTitre(user, titreTypeid)
      if (itCan) {
        result[titreTypeid] = itCan
        assertsCanCreateTitre(user, titreTypeid)
      } else {
        expect(() => assertsCanCreateTitre(user, titreTypeid)).toThrowError('permissions insuffisantes')
      }
    }
    expect(result).toMatchSnapshot()
  })
  test.each<TitreTypeId>(TitresTypesIds)('vérifie si un utilisateur super peut créer un titre de type %p', titreTypeId => {
    const user: User = { role: 'super', ...testBlankUser }
    expect(canCreateTitre(user, titreTypeId)).toBe(true)
    expect(() => assertsCanCreateTitre(user, titreTypeId)).not.toThrowError()
  })

  test.each<TitreTypeId>(TitresTypesIds)('vérifie si un utilisateur administrateur lecteur ne peut pas créer de titre de type %p', titreTypeId => {
    const user: User = { role: 'lecteur', administrationId: ADMINISTRATION_IDS['DEAL - MARTINIQUE'], ...testBlankUser }
    expect(canCreateTitre(user, titreTypeId)).toBe(false)
    expect(() => assertsCanCreateTitre(user, titreTypeId)).toThrowError('permissions insuffisantes')
  })

  test('vérifie si un utilisateur administrateur admin peut créer des titres', () => {
    const result: { [key in AdministrationId]?: { [key in TitreTypeId]?: true } } = {}

    Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
      const user: User = { role: 'admin', administrationId, ...testBlankUser }
      for (const titreTypeid of TitresTypesIds) {
        const itCan = canCreateTitre(user, titreTypeid)
        if (itCan) {
          ;(result[administrationId] ??= {})[titreTypeid] = itCan
          assertsCanCreateTitre(user, titreTypeid)
        } else {
          expect(() => assertsCanCreateTitre(user, titreTypeid)).toThrowError('permissions insuffisantes')
        }
      }
    })

    expect(result).toMatchSnapshot()
  })
})

describe('canEditTitre', () => {
  test.each<TitreTypeId>(TitresTypesIds)('vérifie si une entreprise ne peut pas modifier un titre de type %p', titreTypeId => {
    const user: User = { role: 'entreprise', entreprises: [], ...testBlankUser }
    titresStatutsArray.forEach(titreStatut => {
      expect(canEditTitre(user, titreTypeId, titreStatut.id)).toBe(false)
    })
  })
  test.each<TitreTypeId>(TitresTypesIds)('vérifie si un utilisateur super peut créer un titre de type %p', titreTypeId => {
    const user: User = { role: 'super', ...testBlankUser }
    titresStatutsArray.forEach(titreStatut => {
      expect(canEditTitre(user, titreTypeId, titreStatut.id)).toBe(true)
    })
  })

  test.each<TitreTypeId>(TitresTypesIds)('vérifie si un utilisateur administrateur lecteur ne peut pas modifier de titre de type %p', titreTypeId => {
    const user: User = { role: 'lecteur', administrationId: ADMINISTRATION_IDS['DEAL - MARTINIQUE'], ...testBlankUser }
    titresStatutsArray.forEach(titreStatut => {
      expect(canEditTitre(user, titreTypeId, titreStatut.id)).toBe(false)
    })
  })

  test('vérifie si un utilisateur administrateur admin peut modifier des titres', () => {
    const result: { [key in AdministrationId]?: { [key in TitreTypeId]?: { [key in TitreStatutId]?: true } } } = {}

    Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
      const user: User = { role: 'admin', administrationId, ...testBlankUser }
      for (const titreTypeid of TitresTypesIds) {
        for (const titreStatutId of titresStatutsArray) {
          const itCan = canEditTitre(user, titreTypeid, titreStatutId.id)
          if (itCan) {
            ;((result[administrationId] ??= {})[titreTypeid] ??= {})[titreStatutId.id] = itCan
          }
        }
      }
    })

    expect(result).toMatchSnapshot()
  })
})

test('canDeleteTitre', () => {
  expect(canDeleteTitre({ role: 'super', ...testBlankUser })).toEqual(true)
  expect(canDeleteTitre({ role: 'admin', administrationId: 'min-mtes-dgaln-01', ...testBlankUser })).toEqual(false)
  expect(canDeleteTitre({ role: 'editeur', administrationId: 'min-mtes-dgaln-01', ...testBlankUser })).toEqual(false)
  expect(canDeleteTitre({ role: 'lecteur', administrationId: 'min-mtes-dgaln-01', ...testBlankUser })).toEqual(false)
  expect(canDeleteTitre({ role: 'entreprise', entreprises: [{ id: newEntrepriseId('entrepriseId') }], ...testBlankUser })).toEqual(false)
  expect(canDeleteTitre({ role: 'bureau d’études', entreprises: [{ id: newEntrepriseId('entrepriseId') }], ...testBlankUser })).toEqual(false)
  expect(canDeleteTitre({ role: 'defaut', ...testBlankUser })).toEqual(false)
})

describe('canHaveActivites', () => {
  describe("vérifie si un titre a des activités d'un certain type", () => {
    test("ne retourne aucun type d'activité relié à un pays sur un titre sans pays", () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], {
          titreTypeId: 'axm',
          demarches: [{}],
          communes: [],
        })
      ).toEqual(false)
    })

    test("retourne un type d'activité sur un titre AXM de Guyane", () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], {
          titreTypeId: 'axm',
          demarches: [{}],
          communes: [{ id: toCommuneId('97300') }],
        })
      ).toEqual(true)
    })

    test("ne retourne aucun type d'activité sur un titre AXM de métropole", () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], { titreTypeId: 'axm', demarches: [{}], communes: [{ id: toCommuneId('72000') }] })
      ).toEqual(false)
    })

    test("retourne un type d'activité sur un titre AXM de métropole", () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration'], {
          titreTypeId: 'prm',
          demarches: [{}],
          communes: [{ id: toCommuneId('72000') }],
        })
      ).toEqual(true)
    })

    test("ne retourne aucun type d'activité de titre AXM Guyane sur un titre PRM de métropole", () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], {
          titreTypeId: 'prm',
          demarches: [{}],
          communes: [{ id: toCommuneId('72000') }],
        })
      ).toEqual(false)
    })

    test("retourne un type d'activité de titre  qui n'a pas de pays et qui est liée à un type de titre", () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], {
          titreTypeId: 'pxw',
          demarches: [{}],
          communes: [],
        })
      ).toEqual(true)
    })
    test('un titre sans démarche ne peut pas avoir d’activité', () => {
      expect(
        canHaveActiviteTypeId(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], {
          titreTypeId: 'pxw',
          demarches: [],
          communes: [],
        })
      ).toEqual(false)
    })
  })
})
