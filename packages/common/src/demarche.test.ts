/* eslint-disable no-irregular-whitespace */
import { test, expect, describe } from 'vitest'
import { canHaveMiseEnConcurrence, demarcheEnregistrementDemandeDateFind, getDemarcheContenu } from './demarche'
import { proprietesGeothermieForagesElementIds } from './static/titresTypes_demarchesTypes_etapesTypes/sections'
import { ETAPES_TYPES } from './static/etapesTypes'
import { toCaminoDate } from './date'
import { DEMARCHES_TYPES_IDS } from './static/demarchesTypes'
import { TITRES_TYPES_IDS, TitreTypeId } from './static/titresTypes'

test('getDemarcheContenu arm', () => {
  expect(
    getDemarcheContenu(
      [
        {
          sections_with_values: [
            {
              id: 'suivi',
              nom: 'Suivi de la démarche',
              elements: [
                { id: 'signataire', nom: 'Signataire ONF', description: "Prénom et nom du représentant légal du titulaire de l'ONF", optionnel: true, type: 'text', value: null },
                { id: 'titulaire', nom: 'Signataire titulaire', description: "Prénom et nom du représentant légal du titulaire de l'autorisation", optionnel: true, type: 'text', value: null },
              ],
            },
          ],
          etape_type_id: 'sco',
        },
        { sections_with_values: [], etape_type_id: 'aca' },
        { sections_with_values: [], etape_type_id: 'sca' },
        {
          sections_with_values: [
            {
              id: 'deal',
              nom: 'DEAL',
              elements: [
                { id: 'numero-dossier-deal-eau', nom: 'Numéro de dossier', description: 'Numéro de dossier DEAL Service eau', optionnel: true, type: 'text', value: '' },
                { id: 'numero-recepisse', nom: 'Numéro de récépissé', description: 'Numéro de récépissé émis par la DEAL Service eau', optionnel: true, type: 'text', value: 'R03-2022-12-29-00005' },
              ],
            },
          ],
          etape_type_id: 'rde',
        },
        { sections_with_values: [], etape_type_id: 'mcr' },
        { sections_with_values: [], etape_type_id: 'men' },
        {
          sections_with_values: [
            {
              id: 'arm',
              nom: 'Caractéristiques ARM',
              elements: [
                { id: 'mecanise', nom: 'Prospection mécanisée', description: '', type: 'radio', value: true, optionnel: false },
                { id: 'franchissements', nom: "Franchissements de cours d'eau", description: "Nombre de franchissements de cours d'eau", optionnel: true, type: 'integer', value: 12 },
              ],
            },
          ],
          etape_type_id: 'mfr',
        },
        {
          sections_with_values: [
            {
              id: 'mea',
              nom: 'Mission autorité environnementale',
              elements: [
                {
                  id: 'arrete',
                  nom: 'Arrêté préfectoral',
                  description: "Numéro de l'arrêté préfectoral portant décision dans le cadre de l'examen au cas par cas du projet d'autorisation de recherche minière",
                  optionnel: true,
                  type: 'text',
                  value: 'R03-2022-09-26-00002',
                },
              ],
            },
          ],
          etape_type_id: 'dae',
        },
      ],
      'arm'
    )
  ).toMatchInlineSnapshot(`
    {
      "Franchissements de cours d'eau": "12",
      "Prospection mécanisée": "Oui",
    }
  `)
})
test('getDemarcheContenu prm', () => {
  expect(
    getDemarcheContenu(
      [
        {
          sections_with_values: [
            {
              id: 'prx',
              nom: 'Propriétés du permis exclusif de recherches',
              elements: [
                { id: 'engagement', nom: 'Engagement', optionnel: true, type: 'number', value: 3201430 },
                {
                  id: 'engagementDeviseId',
                  nom: "Devise de l'engagement",
                  description: '',
                  optionnel: true,
                  type: 'select',
                  options: [
                    { id: 'EUR', nom: 'Euros' },
                    { id: 'FRF', nom: 'Francs' },
                    { id: 'XPF', nom: 'Francs Pacifique' },
                  ],
                  value: 'EUR',
                },
              ],
            },
            {
              id: 'publication',
              nom: 'Références Légifrance',
              elements: [
                { id: 'jorf', nom: 'Numéro JORF', description: '', optionnel: false, type: 'text', value: 'JORFTEXT000000774145' },
                { id: 'nor', nom: 'Numéro NOR', description: '', optionnel: true, type: 'text', value: 'ECOI0100462D' },
              ],
            },
          ],
          etape_type_id: 'dpu',
        },
        {
          sections_with_values: [
            {
              id: 'prx',
              nom: 'Propriétés du permis exclusif de recherches',
              elements: [
                { id: 'engagement', nom: 'Engagement', optionnel: true, type: 'number', value: null },
                {
                  id: 'engagementDeviseId',
                  nom: "Devise de l'engagement",
                  description: '',
                  optionnel: true,
                  type: 'select',
                  options: [
                    { id: 'EUR', nom: 'Euros' },
                    { id: 'FRF', nom: 'Francs' },
                    { id: 'XPF', nom: 'Francs Pacifique' },
                  ],
                  value: null,
                },
              ],
            },
            {
              id: 'publication',
              nom: 'Références Légifrance',
              elements: [
                { id: 'jorf', nom: 'Numéro JORF', description: '', optionnel: true, type: 'text', value: null },
                { id: 'nor', nom: 'Numéro NOR', description: '', optionnel: true, type: 'text', value: null },
              ],
            },
          ],
          etape_type_id: 'dex',
        },
      ],
      'prm'
    )
  ).toMatchInlineSnapshot(`
    {
      "Engagement": "3 201 430 Euros",
    }
  `)
})
test('getDemarcheContenu prm edgeCasess', () => {
  expect(
    getDemarcheContenu(
      [
        {
          sections_with_values: [
            {
              id: 'prx',
              nom: 'Propriétés du permis exclusif de recherches',
              elements: [
                { id: 'engagement', optionnel: true, type: 'number', value: 3201430 },
                {
                  id: 'engagementDeviseId',
                  nom: "Devise de l'engagement",
                  description: '',
                  optionnel: true,
                  type: 'select',
                  options: [
                    { id: 'EUR', nom: 'Euros' },
                    { id: 'FRF', nom: 'Francs' },
                    { id: 'XPF', nom: 'Francs Pacifique' },
                  ],
                  value: 'NET',
                },
              ],
            },
            {
              id: 'publication',
              nom: 'Références Légifrance',
              elements: [
                { id: 'jorf', nom: 'Numéro JORF', description: '', optionnel: false, type: 'text', value: 'JORFTEXT000000774145' },
                { id: 'nor', nom: 'Numéro NOR', description: '', optionnel: true, type: 'text', value: 'ECOI0100462D' },
              ],
            },
          ],
          etape_type_id: 'dpu',
        },
      ],
      'prm'
    )
  ).toMatchInlineSnapshot(`
    {
      "": "3 201 430 Euros",
    }
  `)
})
test.each<{ titreTypeId: TitreTypeId; result: unknown }>([
  {
    titreTypeId: TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN,
    result: {
      Volume: '3 000 000 Mètre cube par an',
    },
  },
  {
    titreTypeId: TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS,
    result: {
      Volume: '3 000 000 Mètre cube par an',
    },
  },
  { titreTypeId: TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS, result: {} },
])('getDemarcheContenu %s', ({ titreTypeId, result }) => {
  expect(
    getDemarcheContenu(
      [
        {
          sections_with_values: [
            {
              id: 'cxx',
              nom: 'Propriétés de la concession',
              elements: [
                { id: 'volume', nom: 'Volume', optionnel: true, type: 'number', value: 3000000 },
                {
                  id: 'volumeUniteId',
                  nom: 'Unité du volume',
                  description: '',
                  optionnel: true,
                  type: 'select',
                  options: [
                    { id: 'deg', nom: 'degré' },
                    { id: 'gon', nom: 'grade' },
                    { id: 'km3', nom: 'kilomètre cube' },
                    { id: 'm3a', nom: 'mètre cube par an' },
                    { id: 'm3x', nom: 'mètre cube' },
                    { id: 'met', nom: 'mètre' },
                    { id: 'mgr', nom: 'gramme' },
                    { id: 'mkc', nom: 'quintal' },
                    { id: 'mkg', nom: 'kilogramme' },
                    { id: 'mtc', nom: 'centaine de tonnes' },
                    { id: 'mtk', nom: 'millier de tonnes' },
                    { id: 'mtt', nom: 'tonne' },
                    { id: 'txa', nom: 'tonnes par an' },
                    { id: 'vmd', nom: '100 000 mètres cubes' },
                  ],
                  value: 'm3a',
                },
              ],
            },
            {
              id: 'publication',
              nom: 'Références Légifrance',
              elements: [
                { id: 'jorf', nom: 'Numéro JORF', description: '', optionnel: false, type: 'text', value: '' },
                { id: 'nor', nom: 'Numéro NOR', description: '', optionnel: true, type: 'text', value: '' },
              ],
            },
          ],
          etape_type_id: 'dpu',
        },
        {
          sections_with_values: [
            {
              id: 'cxx',
              nom: 'Propriétés de la concession',
              elements: [
                { id: 'volume', nom: 'Volume', optionnel: true, type: 'number', value: null },
                {
                  id: 'volumeUniteId',
                  nom: 'Unité du volume',
                  description: '',
                  optionnel: true,
                  type: 'select',
                  options: [
                    { id: 'deg', nom: 'degré' },
                    { id: 'gon', nom: 'grade' },
                    { id: 'km3', nom: 'kilomètre cube' },
                    { id: 'm3a', nom: 'mètre cube par an' },
                    { id: 'm3x', nom: 'mètre cube' },
                    { id: 'met', nom: 'mètre' },
                    { id: 'mgr', nom: 'gramme' },
                    { id: 'mkc', nom: 'quintal' },
                    { id: 'mkg', nom: 'kilogramme' },
                    { id: 'mtc', nom: 'centaine de tonnes' },
                    { id: 'mtk', nom: 'millier de tonnes' },
                    { id: 'mtt', nom: 'tonne' },
                    { id: 'txa', nom: 'tonnes par an' },
                    { id: 'vmd', nom: '100 000 mètres cubes' },
                  ],
                  value: null,
                },
              ],
            },
            {
              id: 'publication',
              nom: 'Références Légifrance',
              elements: [
                { id: 'jorf', nom: 'Numéro JORF', description: '', optionnel: true, type: 'text', value: '' },
                { id: 'nor', nom: 'Numéro NOR', description: '', optionnel: true, type: 'text', value: '' },
              ],
            },
          ],
          etape_type_id: 'dex',
        },
      ],
      titreTypeId
    )
  ).toStrictEqual(result)
})

test('edge cases', () => {
  expect(
    getDemarcheContenu(
      [
        {
          sections_with_values: [
            {
              id: 'cxx',
              nom: 'Propriétés de la concession',
              elements: [
                { id: 'volume', optionnel: true, type: 'text', value: 'notANumber' },
                {
                  id: 'volumeUniteId',
                  nom: 'Unité du volume',
                  description: '',
                  optionnel: true,
                  type: 'select',
                  options: [{ id: 'deg', nom: 'degré' }],
                  value: 'unknown',
                },
              ],
            },
          ],
          etape_type_id: 'dpu',
        },
      ],
      'cxw'
    )
  ).toMatchInlineSnapshot(`
      {
        "": "0 Mètre cube",
      }
    `)

  expect(
    getDemarcheContenu(
      [
        {
          etape_type_id: 'mfr',
          sections_with_values: [
            {
              id: 'arm',
              elements: [
                { id: 'franchissements', type: 'text', value: null, optionnel: false },
                { id: 'mecanise', type: 'text', value: null, optionnel: false },
              ],
            },
          ],
        },
      ],
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
    )
  ).toMatchInlineSnapshot(`
    {
      "": "Non",
    }
  `)

  expect(
    getDemarcheContenu(
      [
        {
          etape_type_id: 'mfr',
          sections_with_values: [
            {
              id: 'pxg',
              elements: [
                { id: 'volume', type: 'number', value: 12, optionnel: false, uniteId: 'deg' },
                { id: 'debit', type: 'number', value: 13, optionnel: false, uniteId: 'deg' },
                { id: 'profondeurToitNappe', type: 'number', value: 13, optionnel: false, uniteId: 'deg' },
                { id: 'profondeurBaseNappe', type: 'number', value: 13, optionnel: false, uniteId: 'deg' },
              ],
            },
          ],
        },
      ],
      TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE
    )
  ).toMatchInlineSnapshot(`
    {
      "": "13 undefined",
    }
  `)

  expect(getDemarcheContenu([], TITRES_TYPES_IDS.CONCESSION_FOSSILES)).toMatchInlineSnapshot(`{}`)
})
test('getDemarcheContenu pxg', () => {
  expect(
    getDemarcheContenu(
      [
        {
          sections_with_values: [
            {
              id: 'pxg',
              nom: 'Propriétés de la concession',
              elements: [
                { id: 'volume', nom: 'Volume maximum de pompage', optionnel: true, type: 'number', value: 3000000, description: 'm³', uniteId: 'm3x' },
                {
                  id: 'debit',
                  nom: 'Débit volumique maximal de pompage',
                  type: 'number',
                  description: '',
                  optionnel: true,
                  value: 300,
                  uniteId: 'm3h',
                },
                {
                  id: proprietesGeothermieForagesElementIds['Profondeur du toit de la nappe'],
                  nom: 'Profondeur du toit de la nappe',
                  optionnel: true,
                  type: 'number',
                  value: 20000,
                  description: 'm NGP',
                },
              ],
            },
          ],
          etape_type_id: 'rpu',
        },
      ],
      'pxg'
    )
  ).toMatchInlineSnapshot(`
    {
      "Débit volumique maximal de pompage": "300 m³/h",
      "Profondeur du toit de la nappe": "20000 m NGP",
      "Volume maximum de pompage": "3000000 m³",
    }
  `)
})

describe('demarcheDepotDemandeDateFind', () => {
  test("pas d'étapes", () => {
    expect(demarcheEnregistrementDemandeDateFind([])).toBe(null)
  })

  test('un enregistrement de la demande', () => {
    expect(
      demarcheEnregistrementDemandeDateFind([
        { typeId: ETAPES_TYPES.demande, date: toCaminoDate('2020-01-01') },
        { typeId: ETAPES_TYPES.enregistrementDeLaDemande, date: toCaminoDate('2024-01-01') },
      ])
    ).toBe(toCaminoDate('2024-01-01'))
  })
  test('sans enregistrement de la demande', () => {
    expect(
      demarcheEnregistrementDemandeDateFind([
        { typeId: ETAPES_TYPES.demande, date: toCaminoDate('2020-01-01') },
        { typeId: ETAPES_TYPES.abrogationDeLaDecision, date: toCaminoDate('2024-01-01') },
      ])
    ).toBe(toCaminoDate('2020-01-01'))
  })
})
test('canHaveMiseEnConcurrence', () => {
  expect(canHaveMiseEnConcurrence(DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation, false)).toBe(false)
  expect(canHaveMiseEnConcurrence(DEMARCHES_TYPES_IDS.ExtensionDePerimetre, false)).toBe(true)
  expect(canHaveMiseEnConcurrence(DEMARCHES_TYPES_IDS.Octroi, false)).toBe(true)
  expect(canHaveMiseEnConcurrence(DEMARCHES_TYPES_IDS.Octroi, true)).toBe(false)
})
