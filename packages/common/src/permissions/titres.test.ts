import { getLinkConfig } from './titres'
import { TitresTypesIds, TitreTypeId } from '../titresTypes'

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
