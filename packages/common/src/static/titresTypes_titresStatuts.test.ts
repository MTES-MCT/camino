import { TitresStatutIds } from './titresStatuts'
import { titrePublicFind } from './titresTypes_titresStatuts'
import { test, expect, describe } from 'vitest'
import { TITRES_TYPES_IDS } from './titresTypes'

describe("publicité d'un titre", () => {
  test("un titre sans démarche n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.CONCESSION_METAUX, false)).toBe(false)
  })

  test("un titre dont l'autorisation pour son statut est mise à `false` n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.INDETERMINE_METAUX, true)).toBe(false)
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la démarche d'octroi n'est pas publique n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.CONCESSION_METAUX, false)).toBe(false)
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la démarche de mutation virtuelle n'est pas publique n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.CONCESSION_METAUX, false)).toBe(false)
  })

  test('un titre est public si une de ses démarches est publique', () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.CONCESSION_METAUX, true)).toBe(true)
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la démarche d'octroi est publique est public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.CONCESSION_METAUX, true)).toBe(true)
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la mutation partielle est publique est public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_IDS.CONCESSION_METAUX, true)).toBe(true)
  })

  test("les permis exclusifs de carrières du domaine carrière avec une démarche d'octroi publique est publique", () => {
    expect(titrePublicFind(TitresStatutIds.Echu, TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES, true)).toBe(true)
  })
})
