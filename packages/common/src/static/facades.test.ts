import { assertsFacade, assertsSecteur, getDepartementsBySecteurs, getSecteurMaritime, getSecteurs, secteurAJour } from './facades'
import { test, expect, describe } from 'vitest'

describe('getDepartementsBySecteur()', () => {
  test('retourne la liste des départements pour un secteur donné', () => {
    expect(getDepartementsBySecteurs(["Golfe d'Ajaccio", 'Bretagne nord'])).toStrictEqual(['35', '22', '29'])
  })
})

describe('getSecteurMaritime()', () => {
  test("retourne le secteur maritime selon l'id", () => {
    expect(getSecteurMaritime(43)).toEqual('Riviera')
  })

  test("lance une erreur si l'id ne correspond à aucun secteur maritime", () => {
    // @ts-ignore (pour permettre d'envoyer un ID naze en entrée)
    expect(() => getSecteurMaritime(2000)).to.throw("Cas impossible, l'id 2000 n'est pas connu")
  })
})

describe('getSecteurs()', () => {
  test('retourne les secteurs maritimes pour une façade', () => {
    expect(getSecteurs('Sud Atlantique')).toStrictEqual([
      "Parc Naturel Marin de l'estuaire de la Gironde et de la Mer des Pertuis",
      'Côte sableuse aquitaine',
      "Parc naturel marin du Bassin d'Arcachon",
      "Côte rocheuse basque, estuaire de l'Adour, Gouf de Capbreton",
      'Plateau continental du Golfe de Gascogne',
      'Talus du Golfe de Gascogne',
      'Plaine abyssale du Golfe de Gascogne',
    ])
  })
})

describe('assertsFacade()', () => {
  test("lance une erreur si la façade n'existe pas", () => {
    expect(() => assertsFacade('Manche Est - Mer du Nord')).not.toThrowError()
    expect(() => assertsFacade('camino')).toThrow("La façade camino n'existe pas")
  })
})

describe('assertsSecteur()', () => {
  test("lance une erreur si la façade n'existe pas", () => {
    expect(() => assertsSecteur('Manche Est - Mer du Nord', 'Baie de Seine')).not.toThrowError()
    expect(() => assertsSecteur('Manche Est - Mer du Nord', 'camino')).toThrow("Le secteur camino n'existe pas")
  })
})

describe('secteurAJour()', () => {
  test('vérifie que le secteur id correspond à la façade et secteur donnés', () => {
    expect(secteurAJour('Manche Est - Mer du Nord', 'Baie de Seine', 5, '4')).toBe(true)
    expect(secteurAJour('Manche Est - Mer du Nord', 'Baie de Seine', -1, '4')).toBe(false)
    expect(secteurAJour('Manche Est - Mer du Nord', 'Baie de Seine', 5, '-1')).toBe(false)
  })
})
