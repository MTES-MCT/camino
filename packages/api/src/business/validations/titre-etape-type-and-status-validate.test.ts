import { tdeOldTitreEtapeTypeAndStatusValidate } from './titre-etape-type-and-status-validate'
import { describe, test, expect } from 'vitest'

describe("valide le type et le statut d'une étape en fonction du type de titre et du type de démarche", () => {
  test('le statut est obligatoire', () => {
    expect(tdeOldTitreEtapeTypeAndStatusValidate('arm', 'oct', 'mdp', undefined)).toEqual(['le statut est obligatoire'])
  })
  test("le type et le statut de l'étape correspondent au type de titre et de démarche", () => {
    expect(tdeOldTitreEtapeTypeAndStatusValidate('arm', 'oct', 'mdp', 'fai')).toHaveLength(0)
  })

  test("le statut de l'étape ne correspond pas au type de titre et de démarche", () => {
    expect(tdeOldTitreEtapeTypeAndStatusValidate('arm', 'oct', 'mdp', 'rej')).toEqual(['statut de l\'étape "rej" invalide pour une étape mdp pour une démarche de type octroi'])
  })

  test("le type de l'étape n'est pas compatible avec le type de titre et de démarche", () => {
    expect(tdeOldTitreEtapeTypeAndStatusValidate('arm', 'oct', 'dex', 'fai')).toEqual(['étape "dex" invalide pour une démarche "octroi"'])
  })
})
