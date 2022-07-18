import { canHaveLinkTitresFrom, getTitreFromTypeId } from './titres'
import { TitresTypesIds, TitreTypeId } from '../titresTypes'

test('getTitreFromTypeId', () => {
  const titreFromTypeId = TitresTypesIds.reduce<{
    [key in TitreTypeId]?: TitreTypeId | null
  }>((acc, titreTypeId) => {
    acc[titreTypeId] = getTitreFromTypeId(titreTypeId)

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
})

test('canLinkTitresFrom', () => {
  const titreFromTypeId = TitresTypesIds.reduce<{
    [key in TitreTypeId]?: boolean
  }>((acc, titreTypeId) => {
    acc[titreTypeId] = canHaveLinkTitresFrom(titreTypeId)

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
  expect(canHaveLinkTitresFrom('fus')).toBe(true)
  expect(canHaveLinkTitresFrom(null)).toBe(false)
})
