import { titreEtapeDemarcheEtapeTypeFind } from './titre-etape-demarche-etape-type-find'
import { IDemarcheType } from '../../types'
import { describe, test, expect } from 'vitest'

const demarcheType = {
  etapesTypes: [{ id: 'mfr' }],
  nom: 'demarche'
} as IDemarcheType

describe("retourne le type d'étape provenant des types d'étapes d'un type de démarche", () => {
  test("le titre d'étape est retourné", () => {
    expect(
      titreEtapeDemarcheEtapeTypeFind(
        'mfr',
        demarcheType.etapesTypes,
        demarcheType.nom
      )
    ).toEqual({
      id: 'mfr'
    })
  })

  test('une erreur est retournée', () => {
    expect(() =>
      titreEtapeDemarcheEtapeTypeFind(
        'mdp',
        demarcheType.etapesTypes,
        demarcheType.nom
      )
    ).toThrow(/étape "mdp" invalide pour une démarche "demarche"/)
  })
})
