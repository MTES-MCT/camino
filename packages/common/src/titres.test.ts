import { describe, expect, test } from 'vitest'
import { TitrePropTitreEtapeFindDemarcheEtape, getMostRecentValuePropFromEtapeFondamentaleValide } from './titres'
import { toCaminoDate } from './date'
import { entrepriseIdValidator } from './entreprise'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON } from './etape'
describe('getMostRecentValuePropFromEtapeFondamentaleValide', () => {
  test("retourne le titulaire de la demande même si elle est en brouillon, si elle est l'unique étape", () => {
    const asl: TitrePropTitreEtapeFindDemarcheEtape = {
      etape_type_id: 'asl',
      etape_statut_id: 'fai',
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 1,
    }
    const mfr: TitrePropTitreEtapeFindDemarcheEtape = {
      etape_type_id: 'mfr',
      fondamentale: {
        date_debut: null,
        date_fin: null,
        duree: 240,
        substances: [],
        titulaireIds: [entrepriseIdValidator.parse('fr-310380811')],
        amodiataireIds: null,
        perimetre: null,
      },
      etape_statut_id: 'fai',
      is_brouillon: ETAPE_IS_BROUILLON,
      ordre: 1,
    }

    expect(
      getMostRecentValuePropFromEtapeFondamentaleValide('titulaireIds', [
        {
          etapes: [asl, mfr],
          ordre: 1,
        },
      ])
    ).toStrictEqual(mfr.fondamentale.titulaireIds)
  })
  test('retourne le dernier titulaire même si les étapes ne sont pas dans le bon ordre', () => {
    const dpu: TitrePropTitreEtapeFindDemarcheEtape = {
      etape_type_id: 'dpu',
      fondamentale: {
        date_debut: null,
        date_fin: toCaminoDate('2032-08-18'),
        duree: 240,
        substances: [],
        titulaireIds: [entrepriseIdValidator.parse('fr-791652399')],
        amodiataireIds: null,
        perimetre: null,
      },
      etape_statut_id: 'acc',
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 2,
    }

    const dex: TitrePropTitreEtapeFindDemarcheEtape = {
      etape_type_id: 'dex',
      fondamentale: {
        date_debut: null,
        date_fin: null,
        duree: 240,
        substances: [],
        titulaireIds: [entrepriseIdValidator.parse('fr-310380811')],
        amodiataireIds: null,
        perimetre: null,
      },
      etape_statut_id: 'acc',
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 1,
    }

    expect(
      getMostRecentValuePropFromEtapeFondamentaleValide('titulaireIds', [
        {
          etapes: [dpu, dex],
          ordre: 1,
        },
      ])
    ).toStrictEqual(dpu.fondamentale.titulaireIds)

    expect(
      getMostRecentValuePropFromEtapeFondamentaleValide('titulaireIds', [
        {
          etapes: [dex, dpu],
          ordre: 1,
        },
      ])
    ).toStrictEqual(dpu.fondamentale.titulaireIds)
  })
})
