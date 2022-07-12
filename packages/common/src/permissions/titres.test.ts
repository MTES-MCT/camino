import { canLinkTitresFrom, getTitreFromTypeId } from './titres'
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
    acc[titreTypeId] = canLinkTitresFrom(titreTypeId)

    return acc
  }, {})
  expect(titreFromTypeId).toMatchSnapshot()
  expect(canLinkTitresFrom('fus')).toBe(true)
  expect(null).toBe(false)
})
