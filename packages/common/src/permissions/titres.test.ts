import { assertsCanCreateTitre, canCreateTitre, canLinkTitres, getLinkConfig } from './titres.js'
import { TitresTypesIds, TitreTypeId } from '../static/titresTypes.js'
import { User } from '../roles.js'
import { ADMINISTRATION_IDS, AdministrationId } from '../static/administrations.js'
import { test, expect } from 'vitest'

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

test.each<[User, AdministrationId[], boolean]>([
  [{ role: 'super', administrationId: undefined }, [], true],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']
    },
    [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']],
    true
  ],
  [
    {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']
    },
    [ADMINISTRATION_IDS['DREAL - PAYS DE LA LOIRE']],
    false
  ],
  [{ role: 'defaut', administrationId: undefined }, [ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']], false]
])('un utilisateur $user peut modifier les liaisons d’un titre: $can ', (user, administrationIds, can) => {
  expect(canLinkTitres(user, administrationIds)).toBe(can)
})

test.each<TitreTypeId>(TitresTypesIds)('vérifie si une entreprise peut créer un titre de type %p', titreTypeId => {
  const user: User = { role: 'entreprise', administrationId: null }
  const actual = canCreateTitre(user, titreTypeId)
  expect(actual).toMatchSnapshot()
  if (actual) {
    assertsCanCreateTitre(user, titreTypeId)
  } else {
    expect(() => assertsCanCreateTitre(user, titreTypeId)).toThrowError('permissions insuffisantes')
  }
})
test.each<TitreTypeId>(TitresTypesIds)('vérifie si un utilisateur super peut créer un titre de type %p', titreTypeId => {
  const user: User = { role: 'super', administrationId: null }
  expect(canCreateTitre(user, titreTypeId)).toBe(true)
  expect(() => assertsCanCreateTitre(user, titreTypeId)).not.toThrowError()
})

test.each<TitreTypeId>(TitresTypesIds)('vérifie si un utilisateur administrateur lecteur ne peut pas créer de titre de type %p', titreTypeId => {
  const user: User = { role: 'lecteur', administrationId: ADMINISTRATION_IDS['DEAL - MARTINIQUE'] }
  expect(canCreateTitre(user, titreTypeId)).toBe(false)
  expect(() => assertsCanCreateTitre(user, titreTypeId)).toThrowError('permissions insuffisantes')
})

test('vérifie si un utilisateur administrateur admin peut créer des titres', () => {
  const result: { [key in AdministrationId]?: { [key in TitreTypeId]?: boolean } } = {}

  Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
    const user: User = { role: 'admin', administrationId }
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
