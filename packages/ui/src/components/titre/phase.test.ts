import { expect, test } from 'vitest'
import { phaseWithAlterations } from './phase'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date'
import { demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { TitreGetDemarche } from 'camino-common/src/titres'
import { ETAPE_IS_NOT_BROUILLON, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'

test('phase acceptée et publiée', () => {
  const demarches: TitreGetDemarche[] = [
    {
      id: demarcheIdValidator.parse('idMut'),
      slug: demarcheSlugValidator.parse('slug-mut'),
      description: null,
      etapes: [
        {
          etape_type_id: 'dex',
          fondamentale: { date_debut: null, date_fin: null, duree: null, substances: [], titulaireIds: [], amodiataireIds: null, perimetre: null },
          etape_statut_id: 'acc',
          is_brouillon: ETAPE_IS_NOT_BROUILLON,
          date: caminoDateValidator.parse('1996-11-25'),
          id: etapeIdValidator.parse('etapeIdMutDex'),
          ordre: 1,
          note: { valeur: '', is_avertissement: false },
          slug: etapeSlugValidator.parse('etape-slug-mut-dex'),
          sections_with_values: [],
          entreprises_documents: [],
          etape_documents: [],
          avis_documents: [],
        },
      ],
      demarche_type_id: 'mut',
      demarche_statut_id: 'acp',
      demarche_date_debut: null,
      demarche_date_fin: null,
      ordre: 1,
    },
    {
      id: demarcheIdValidator.parse('idDemPro'),
      slug: demarcheSlugValidator.parse('dem-slug-pro'),
      description: null,
      etapes: [
        {
          etape_type_id: 'dex',
          fondamentale: { date_debut: null, date_fin: null, duree: null, substances: [], titulaireIds: [], amodiataireIds: null, perimetre: null },
          etape_statut_id: 'acc',
          is_brouillon: ETAPE_IS_NOT_BROUILLON,
          date: caminoDateValidator.parse('1996-11-25'),
          id: etapeIdValidator.parse('etapeIdDexPro'),
          ordre: 1,
          note: { valeur: '', is_avertissement: false },
          slug: etapeSlugValidator.parse('etape-slug-pro-dex'),
          sections_with_values: [],
          entreprises_documents: [],
          etape_documents: [],
          avis_documents: [],
        },
      ],
      demarche_type_id: 'pro',
      demarche_statut_id: 'acp',
      demarche_date_debut: caminoDateValidator.parse('1996-04-30'),
      demarche_date_fin: caminoDateValidator.parse('2000-04-30'),
      ordre: 2,
    },
  ]
  const actual = phaseWithAlterations(demarches, toCaminoDate('2024-07-11'))
  expect(actual[0]).toHaveLength(2)
  expect(actual).toMatchInlineSnapshot(`
    [
      [
        {
          "demarche_date_debut": "1996-04-30",
          "demarche_date_fin": "2000-04-30",
          "demarche_statut_id": "acp",
          "demarche_type_id": "pro",
          "description": null,
          "etapes": [
            {
              "avis_documents": [],
              "date": "1996-11-25",
              "entreprises_documents": [],
              "etape_documents": [],
              "etape_statut_id": "acc",
              "etape_type_id": "dex",
              "fondamentale": {
                "amodiataireIds": null,
                "date_debut": null,
                "date_fin": null,
                "duree": null,
                "perimetre": null,
                "substances": [],
                "titulaireIds": [],
              },
              "id": "etapeIdDexPro",
              "is_brouillon": false,
              "note": {
                "is_avertissement": false,
                "valeur": "",
              },
              "ordre": 1,
              "sections_with_values": [],
              "slug": "etape-slug-pro-dex",
            },
          ],
          "events": [],
          "id": "idDemPro",
          "ordre": 2,
          "slug": "dem-slug-pro",
        },
        {
          "date_etape_decision_ok": "1996-11-25",
          "demarche_date_debut": null,
          "demarche_date_fin": null,
          "demarche_statut_id": "acp",
          "demarche_type_id": "mut",
          "description": null,
          "etapes": [
            {
              "avis_documents": [],
              "date": "1996-11-25",
              "entreprises_documents": [],
              "etape_documents": [],
              "etape_statut_id": "acc",
              "etape_type_id": "dex",
              "fondamentale": {
                "amodiataireIds": null,
                "date_debut": null,
                "date_fin": null,
                "duree": null,
                "perimetre": null,
                "substances": [],
                "titulaireIds": [],
              },
              "id": "etapeIdMutDex",
              "is_brouillon": false,
              "note": {
                "is_avertissement": false,
                "valeur": "",
              },
              "ordre": 1,
              "sections_with_values": [],
              "slug": "etape-slug-mut-dex",
            },
          ],
          "events": [],
          "id": "idMut",
          "ordre": 1,
          "slug": "slug-mut",
        },
      ],
    ]
  `)
})
