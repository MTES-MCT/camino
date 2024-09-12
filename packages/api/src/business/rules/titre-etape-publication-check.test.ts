import { titreEtapePublicationCheck } from './titre-etape-publication-check'
import { describe, expect, test } from 'vitest'
describe("étape de publication d'une étape", () => {
  test('une étape de dpu est une étape de publication', () => {
    expect(titreEtapePublicationCheck('dpu', 'pxm')).toEqual(true)
  })

  test("une étape de mfr n'est pas une étape de publication", () => {
    expect(titreEtapePublicationCheck('mfr', 'pxm')).toEqual(false)
  })

  test("une étape de dex n'est pas une étape de publication pour un titre non-spécifique", () => {
    expect(titreEtapePublicationCheck('dex', 'pxm')).toEqual(false)
  })

  test('une étape de dex est une étape de publication pour un titre AXM', () => {
    expect(titreEtapePublicationCheck('dex', 'axm')).toEqual(true)
  })

  test('une étape de sco est une étape de publication pour un titre ARM', () => {
    expect(titreEtapePublicationCheck('sco', 'arm')).toEqual(true)
  })

  test('une étape de rpu est une étape de publication pour un titre PRM', () => {
    expect(titreEtapePublicationCheck('rpu', 'prm')).toEqual(true)
  })

  test('une étape de rpu est une étape de publication pour un titre PXG', () => {
    expect(titreEtapePublicationCheck('rpu', 'pxg')).toEqual(true)
  })

  test("une étape de dex n'est pas une étape de publication pour un titre PXG", () => {
    expect(titreEtapePublicationCheck('dex', 'pxg')).toEqual(false)
  })

  test("un titre non reconnu n'est pas géré", () => {
    // @ts-ignore
    expect(titreEtapePublicationCheck('rpu', 'xxx')).toEqual(false)
  })
})
