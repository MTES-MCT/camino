import { titreEtapeTypeAndStatusValidate } from './titre-etape-type-and-status-validate.js'
import { describe, test, expect } from 'vitest'

describe("valide le type et le statut d'une étape en fonction du type de titre et du type de démarche", () => {
  test('le statut est obligatoire', () => {
    expect(
      titreEtapeTypeAndStatusValidate(
        'arm',
        'oct',
        'mdp',
        undefined,
      )
    ).toEqual(['le statut est obligatoire'])
  })
  test("le type et le statut de l'étape correspondent au type de titre et de démarche", () => {


    expect(
      titreEtapeTypeAndStatusValidate(
        'arm',
        'oct',
        'mdp',
        'fai'
      )
    ).toHaveLength(0)
  })

  test("le statut de l'étape ne correspond pas au type de titre et de démarche", () => {
    expect(
      titreEtapeTypeAndStatusValidate(
        'arm',
        'oct',
        'mdp',
        'rej'
      )
    ).toEqual(['statut de l\'étape "rej" invalide pour une type d\'étape mdp pour une démarche de type octroi'])
  })

  test("le type de l'étape n'est pas compatible avec le type de titre et de démarche", () => {
    expect(
      titreEtapeTypeAndStatusValidate(
        'arm',
        'oct',
        'dex',
        'fai'
      )
    ).toEqual(['étape "dex" invalide pour une démarche "octroi"'])
  })
})
