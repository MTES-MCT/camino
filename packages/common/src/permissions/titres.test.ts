import { assertsCanCreateTitre, canCreateTitre, canDeleteTitre, canLinkTitres, getLinkConfig } from './titres.js'
import { TitresTypesIds, TitreTypeId } from '../static/titresTypes.js'
import { ADMINISTRATION_IDS, AdministrationId } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { testBlankUser, TestUser } from '../tests-utils.js'
import { User } from '../roles.js'
import { newEntrepriseId } from '../entreprise.js'

test('getTitreFromTypeId pas de fusions', () => {
  const titreFromTypeId = TitresTypesIds.reduce<{
    [key in TitreTypeId]?: {
      count: 'single' | 'multiple'
      typeId: TitreTypeId
    } | null
  }>((acc, titreTypeId) => {
    acc[titreTypeId] = getLinkConfig(titreTypeId, [])

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
})
test('getTitreFromTypeId fusions', () => {
  const titreFromTypeId = TitresTypesIds.reduce<{
    [key in TitreTypeId]?: {
      count: 'single' | 'multiple'
      typeId: TitreTypeId
    } | null
  }>((acc, titreTypeId) => {
    acc[titreTypeId] = getLinkConfig(titreTypeId, [{ typeId: 'fus' }])

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
})

test.each<[TestUser, AdministrationId[], boolean]>([
  [{ role: 'super' }, [], true],
  [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'] }, [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']], true],
  [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'] }, [ADMINISTRATION_IDS['DREAL - PAYS DE LA LOIRE']], false],
  [{ role: 'defaut' }, [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']], false]
])('un utilisateur $user peut modifier les liaisons d’un titre: $can ', (user, administrationIds, can) => {
  expect(canLinkTitres({ ...user, ...testBlankUser }, administrationIds)).toBe(can)
})

test.each<TitreTypeId>(TitresTypesIds)('vérifie si une entreprise peut créer un titre de type %p', titreTypeId => {
  const user: User = { role: 'entreprise', entreprises: [], ...testBlankUser }
  const actual = canCreateTitre(user, titreTypeId)
  expect(actual).toMatchSnapshot()
  if (actual) {
    assertsCanCreateTitre(user, titreTypeId)
  } else {
    expect(() => assertsCanCreateTitre(user, titreTypeId)).toThrowError('permissions insuffisantes')
  }
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
  const result: { [key in AdministrationId]?: { [key in TitreTypeId]?: boolean } } = {}

  Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
    const user: User = { role: 'admin', administrationId, ...testBlankUser }
    for (const titreTypeid of TitresTypesIds) {
      const itCan = canCreateTitre(user, titreTypeid)
      ;(result[administrationId] ??= {})[titreTypeid] = itCan
      if (itCan) {
        assertsCanCreateTitre(user, titreTypeid)
      } else {
        expect(() => assertsCanCreateTitre(user, titreTypeid)).toThrowError('permissions insuffisantes')
      }
    }
  })

  expect(result).toMatchSnapshot()
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
