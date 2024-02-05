import { describe, expect, test } from 'vitest'
import { TitrePropTitreEtapeFindDemarcheEtape, getMostRecentValuePropFromEtapeFondamentaleValide } from './titres'
import { toCaminoDate } from './date'
import { entrepriseIdValidator } from './entreprise'
describe('getMostRecentValuePropFromEtapeFondamentaleValide', () => {
  test('retourne le dernier titulaire même si les étapes ne sont pas dans le bon ordre', () => {
    const dpu: TitrePropTitreEtapeFindDemarcheEtape = {
      etape_type_id: 'dpu',
      fondamentale: {
        date_debut: null,
        date_fin: toCaminoDate('2032-08-18'),
        duree: 240,
        substances: [],
        titulaires: [
          {
            id: entrepriseIdValidator.parse('fr-791652399'),
            nom: 'AMAZONE GOLD',
            operateur: false,
          },
        ],
        amodiataires: null,
        perimetre: null,
      },
      etape_statut_id: 'acc',
      ordre: 2,
    }

    const dex: TitrePropTitreEtapeFindDemarcheEtape = {
      etape_type_id: 'dex',
      fondamentale: {
        date_debut: null,
        date_fin: null,
        duree: 240,
        substances: [],
        titulaires: [
          {
            id: entrepriseIdValidator.parse('fr-310380811'),
            nom: 'GARROT-CHAILLAC',
            operateur: false,
          },
        ],
        amodiataires: null,
        perimetre: null,
      },
      etape_statut_id: 'acc',
      ordre: 1,
    }

    expect(
      getMostRecentValuePropFromEtapeFondamentaleValide('titulaires', [
        {
          etapes: [dpu, dex],
          ordre: 1,
        },
      ])
    ).toStrictEqual(dpu.fondamentale.titulaires)

    expect(
      getMostRecentValuePropFromEtapeFondamentaleValide('titulaires', [
        {
          etapes: [dex, dpu],
          ordre: 1,
        },
      ])
    ).toStrictEqual(dpu.fondamentale.titulaires)
  })
})
