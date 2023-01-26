import { titreContenuFormat } from './titre-contenu.js'
import { describe, test, expect } from 'vitest'
describe('formatage du contenu', () => {
  test("formate le contenu d'un titre", () => {
    expect(
      titreContenuFormat({
        contenusTitreEtapesIds: {
          section: { prop1: 'etape-id', prop2: 'etape-id' }
        },
        demarches: [
          {
            etapes: [
              {
                id: 'etape-id',
                contenu: {
                  section: {
                    prop1: 'valeur 1',
                    prop2: 'valeur 2'
                  }
                }
              }
            ]
          }
        ]
      })
    ).toMatchObject({ section: { prop1: 'valeur 1', prop2: 'valeur 2' } })
  })

  test("retourne un contenu vide si le trire n'a pas de démarches ou d'étapes", () => {
    expect(
      titreContenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id'
          }
        },
        demarches: undefined
      })
    ).toMatchObject({})

    expect(
      titreContenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id'
          }
        },
        demarches: []
      })
    ).toMatchObject({})

    expect(
      titreContenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id'
          }
        },
        demarches: [{ etapes: null }]
      })
    ).toMatchObject({})

    expect(
      titreContenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id'
          }
        },
        demarches: [{ etapes: [] }]
      })
    ).toMatchObject({})
  })
})
