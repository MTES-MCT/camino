import { describe, expect, test } from 'vitest'
import {
  dateTypeStepIsComplete,
  entrepriseDocumentsStepIsComplete,
  entrepriseDocumentsStepIsVisible,
  etapeAvisStepIsVisible,
  etapeDocumentsStepIsComplete,
  etapeDocumentsStepIsVisible,
  fondamentaleStepIsComplete,
  fondamentaleStepIsVisible,
  getAvisTypes,
  getDocumentsTypes,
  perimetreStepIsComplete,
  perimetreStepIsVisible,
  sectionsStepIsComplete,
  sectionsStepIsVisible,
} from './etape-form'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, etapeDocumentIdValidator } from '../etape'
import { toCaminoDate } from '../date'
import { testBlankUser } from '../tests-utils'
import { entrepriseIdValidator } from '../entreprise'
import { communeIdValidator } from '../static/communes'
import { User } from '../roles'
import { ADMINISTRATION_IDS } from '../static/administrations'
import { SUBSTANCES_FISCALES_IDS } from '../static/substancesFiscales'
import { DEMARCHES_TYPES_IDS } from '../static/demarchesTypes'
import { TITRES_TYPES_IDS } from '../static/titresTypes'

describe('dateTypeStepIsComplete', () => {
  test.each<User>([
    { ...testBlankUser, role: 'super' },
    { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM },
    { ...testBlankUser, role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM },
  ])('le date-type est toujours complet pour un %s', user => {
    expect(
      dateTypeStepIsComplete(
        {
          date: toCaminoDate('2024-01-01'),
          typeId: 'mfr',
          statutId: 'fai',
        },
        user
      ).valid
    ).toBe(true)
  })

  test('le date-type avec une date, un typeId, et un statutId est complet', () => {
    const result = dateTypeStepIsComplete(
      {
        date: toCaminoDate('2024-01-01'),
        typeId: 'mfr',
        statutId: 'fai',
      },
      {
        ...testBlankUser,
        role: 'super',
      }
    )
    expect(result.valid).toBe(true)
  })

  test('le date-type avec une date, un typeId, et un statutId est complet', () => {
    const result = dateTypeStepIsComplete(
      {
        date: toCaminoDate('2024-01-01'),
        typeId: 'mfr',
        statutId: 'fai',
      },
      {
        ...testBlankUser,
        role: 'super',
      }
    )
    expect(result.valid).toBe(true)
  })

  test('le date-type sans date, typeId, ou statutId est incomplet', () => {
    const result = dateTypeStepIsComplete(
      {
        date: null,
        typeId: null,
        statutId: null,
      },
      {
        ...testBlankUser,
        role: 'super',
      }
    )
    expect(result.valid).toBe(false)
    // @ts-ignore
    expect(result.errors).toStrictEqual(["La date de l'étape est obligatoire", "Le type de l'étape est obligatoire", "Le statut de l'étape est obligatoire"])
  })
})

test('fondamentaleStepIsVisible', () => {
  expect(fondamentaleStepIsVisible('mfr')).toBe(true)
  expect(fondamentaleStepIsVisible('acg')).toBe(false)
})

test('fondamentaleStepIsComplete', () => {
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'acg',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'amo',
      'prr',
      { ...testBlankUser, role: 'super' }
    ).valid
  ).toBe(true)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'dpu',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'amo',
      'prr',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "Les substances sont obligatoires",
        "la durée est obligatoire pour une démarche amodiation",
        "les amodiataires sont obligatoires pour les démarches d'Amodiation",
      ],
      "valid": false,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'amo',
      'prr',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "Les substances sont obligatoires",
        "la durée est obligatoire pour une démarche amodiation",
        "les amodiataires sont obligatoires pour les démarches d'Amodiation",
      ],
      "valid": false,
    }
  `)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'prr',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "la durée est obligatoire pour une démarche octroi",
        "les titulaires sont obligatoires pour les démarches octroi",
      ],
      "valid": false,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'prr',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "la durée est obligatoire pour une démarche octroi",
      ],
      "valid": false,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 2, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "les titulaires sont obligatoires pour les démarches octroi",
      ],
      "valid": false,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "la durée est obligatoire pour une démarche octroi",
        "les titulaires sont obligatoires pour les démarches octroi",
      ],
      "valid": false,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 2, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "Les substances sont obligatoires",
        "les titulaires sont obligatoires pour les démarches octroi",
      ],
      "valid": false,
    }
  `)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 2, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'mut',
      'arm',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "valid": true,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'mut',
      'arm',
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "Les substances sont obligatoires",
        "les titulaires sont obligatoires pour les démarches mutation",
      ],
      "valid": false,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 3, heritee: false, etapeHeritee: null },
        substances: { value: [SUBSTANCES_FISCALES_IDS.or], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm',
      { ...testBlankUser, role: 'entreprise', entrepriseIds: [entreprise1Id] }
    )
  ).toMatchInlineSnapshot(`
    {
      "valid": true,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 2, heritee: false, etapeHeritee: null },
        substances: { value: [SUBSTANCES_FISCALES_IDS.or], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Amodiation,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX,
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "valid": true,
    }
  `)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [SUBSTANCES_FISCALES_IDS.or], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Amodiation,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX,
      { ...testBlankUser, role: 'super' }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "la durée est obligatoire pour une démarche amodiation",
        "les amodiataires sont obligatoires pour les démarches d'Amodiation",
      ],
      "valid": false,
    }
  `)
})
test('sectionsStepIsVisible', () => {
  expect(sectionsStepIsVisible({ typeId: 'mfr' }, 'oct', 'arm')).toBe(true)
  expect(sectionsStepIsVisible({ typeId: 'asl' }, 'oct', 'axm')).toBe(false)
})

test('sectionsStepIsComplete', () => {
  expect(sectionsStepIsComplete({ typeId: 'mfr', contenu: {} }, 'oct', 'arm').valid).toBe(false)
  expect(sectionsStepIsComplete({ typeId: 'mfr', contenu: { arm: { mecanise: { value: true, heritee: false, etapeHeritee: null } } } }, 'oct', 'arm').valid).toBe(true)
})

test('perimetreStepIsVisible', () => {
  expect(perimetreStepIsVisible({ typeId: 'mfr' }, DEMARCHES_TYPES_IDS.Octroi)).toBe(true)
  expect(perimetreStepIsVisible({ typeId: 'acg' }, DEMARCHES_TYPES_IDS.Octroi)).toBe(false)

  expect(perimetreStepIsVisible({ typeId: 'mfr' }, DEMARCHES_TYPES_IDS.Mutation)).toBe(false)
  expect(perimetreStepIsVisible({ typeId: 'acg' }, DEMARCHES_TYPES_IDS.Mutation)).toBe(false)
})

test('perimetreStepIsComplete', () => {
  expect(
    perimetreStepIsComplete(
      {
        typeId: 'mfr',
        perimetre: {
          value: {
            geojson4326Perimetre: null,
            geojson4326Forages: null,
            geojson4326Points: null,
            geojsonOrigineForages: null,
            geojsonOrigineGeoSystemeId: null,
            geojsonOriginePerimetre: null,
            geojsonOriginePoints: null,
            surface: null,
          },
          heritee: false,
          etapeHeritee: null,
        },
      },
      DEMARCHES_TYPES_IDS.Octroi
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "le périmètre est obligatoire pour une démarche octroi",
      ],
      "valid": false,
    }
  `)
  expect(
    perimetreStepIsComplete(
      {
        typeId: 'mfr',
        perimetre: {
          value: {
            geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [] } },
            geojson4326Forages: null,
            geojson4326Points: null,
            geojsonOrigineForages: null,
            geojsonOrigineGeoSystemeId: null,
            geojsonOriginePerimetre: null,
            geojsonOriginePoints: null,
            surface: null,
          },
          heritee: false,
          etapeHeritee: null,
        },
      },
      DEMARCHES_TYPES_IDS.Octroi
    ).valid
  ).toBe(true)
  expect(
    perimetreStepIsComplete(
      {
        typeId: 'acg',
        perimetre: {
          value: {
            geojson4326Perimetre: null,
            geojson4326Forages: null,
            geojson4326Points: null,
            geojsonOrigineForages: null,
            geojsonOrigineGeoSystemeId: null,
            geojsonOriginePerimetre: null,
            geojsonOriginePoints: null,
            surface: null,
          },
          heritee: false,
          etapeHeritee: null,
        },
      },
      DEMARCHES_TYPES_IDS.Octroi
    ).valid
  ).toBe(true)
  expect(
    perimetreStepIsComplete(
      {
        typeId: 'dpu',
        perimetre: {
          value: {
            geojson4326Perimetre: null,
            geojson4326Forages: null,
            geojson4326Points: null,
            geojsonOrigineForages: null,
            geojsonOrigineGeoSystemeId: null,
            geojsonOriginePerimetre: null,
            geojsonOriginePoints: null,
            surface: null,
          },
          heritee: false,
          etapeHeritee: null,
        },
      },
      DEMARCHES_TYPES_IDS.Octroi
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "le périmètre est obligatoire pour une démarche octroi",
      ],
      "valid": false,
    }
  `)
  expect(
    perimetreStepIsComplete(
      {
        typeId: 'dpu',
        perimetre: {
          value: {
            geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [] } },
            geojson4326Forages: null,
            geojson4326Points: null,
            geojsonOrigineForages: null,
            geojsonOrigineGeoSystemeId: null,
            geojsonOriginePerimetre: null,
            geojsonOriginePoints: null,
            surface: null,
          },
          heritee: false,
          etapeHeritee: null,
        },
      },
      DEMARCHES_TYPES_IDS.Octroi
    ).valid
  ).toBe(true)
})

test('etapeDocumentsStepIsVisible', () => {
  expect(etapeDocumentsStepIsVisible({ typeId: 'asl' }, 'oct', 'axm')).toBe(true)
  expect(etapeDocumentsStepIsVisible({ typeId: 'mdp' }, 'oct', 'axm')).toBe(true)
  expect(etapeDocumentsStepIsVisible({ typeId: 'pqr' }, 'oct', 'axm')).toBe(false)
})

const axmDocumentsComplete = [
  {
    description: "Plan à l'échelle 1/50 000ème ou 1/100 000ème",
    id: etapeDocumentIdValidator.parse('idcar'),
    etape_document_type_id: 'car',
    entreprises_lecture: true,
    public_lecture: true,
  },

  {
    description: null,
    id: etapeDocumentIdValidator.parse('idlem'),
    etape_document_type_id: 'lem',
    entreprises_lecture: true,
    public_lecture: true,
  },

  {
    description: '',
    id: etapeDocumentIdValidator.parse('ididm'),
    etape_document_type_id: 'idm',
    entreprises_lecture: true,
    public_lecture: true,
  },

  {
    description:
      'la définition des mesures prévues par le pétitionnaire pour réhabiliter le site après exploitation, notamment la nature et les modalités de revégétalisation envisagée. (décret 2001-204, art. 5 bis)',
    id: etapeDocumentIdValidator.parse('idmes'),
    etape_document_type_id: 'mes',
    entreprises_lecture: true,
    public_lecture: true,
  },
  {
    description: "descriptif des méthodes envisagées pour l'exécution des travaux ((décret 2001-204, art. 6)",
    id: etapeDocumentIdValidator.parse('idmet'),
    etape_document_type_id: 'met',
    entreprises_lecture: true,
    public_lecture: true,
  },
  {
    description: null,
    id: etapeDocumentIdValidator.parse('idnip'),
    etape_document_type_id: 'nip',
    entreprises_lecture: true,
    public_lecture: true,
  },

  {
    description: 'Description du phasage et planigramme des travaux. (décret 2001-204, art. 5)',
    id: etapeDocumentIdValidator.parse('idprg'),
    etape_document_type_id: 'prg',
    entreprises_lecture: true,
    public_lecture: true,
  },
  {
    description: "le schéma de pénétration du massif forestier proposé par le pétitionnaire pour l'acheminement du matériel lourd et la desserte du chantier (décret 2001-204, art. 5 bis)",
    id: etapeDocumentIdValidator.parse('idsch'),
    etape_document_type_id: 'sch',
    entreprises_lecture: true,
    public_lecture: true,
  },
] as const

const entreprise1Id = entrepriseIdValidator.parse('id1')
test('etapeDocumentsStepIsComplete', () => {
  expect(etapeDocumentsStepIsComplete({ typeId: 'asl', contenu: {}, isBrouillon: ETAPE_IS_NOT_BROUILLON }, 'oct', 'axm', [{ etape_document_type_id: 'dec' }], [])).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document "Lettre" (let) est obligatoire",
      ],
      "valid": false,
    }
  `)

  expect(etapeDocumentsStepIsComplete({ typeId: 'mfr', contenu: {}, isBrouillon: ETAPE_IS_BROUILLON }, 'oct', 'axm', axmDocumentsComplete, [])).toMatchInlineSnapshot(`
    {
      "valid": true,
    }
  `)
})

test('entrepriseDocumentsStepIsVisible', () => {
  expect(entrepriseDocumentsStepIsVisible({ typeId: 'asl' }, 'oct', 'axm')).toBe(false)
  expect(entrepriseDocumentsStepIsVisible({ typeId: 'mfr' }, 'oct', 'axm')).toBe(true)
  expect(entrepriseDocumentsStepIsVisible({ typeId: 'pqr' }, 'oct', 'axm')).toBe(false)
})
test('entrepriseDocumentsStepIsComplete', () => {
  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: 'asl', titulaires: { value: [], heritee: false, etapeHeritee: null }, amodiataires: { value: [], heritee: false, etapeHeritee: null }, contenu: {} },
      'oct',
      'axm',
      []
    ).valid
  ).toBe(true)
  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: 'mfr', titulaires: { value: [], heritee: false, etapeHeritee: null }, amodiataires: { value: [], heritee: false, etapeHeritee: null }, contenu: {} },
      'oct',
      'axm',
      []
    ).valid
  ).toBe(false)

  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: 'mfr', titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null }, amodiataires: { value: [], heritee: false, etapeHeritee: null }, contenu: {} },
      'oct',
      'axm',
      []
    ).valid
  ).toBe(false)
  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: 'mfr', titulaires: { value: [], heritee: false, etapeHeritee: null }, amodiataires: { value: [entreprise1Id], heritee: false, etapeHeritee: null }, contenu: {} },
      'oct',
      'axm',
      []
    ).valid
  ).toBe(false)

  expect(
    entrepriseDocumentsStepIsComplete(
      {
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        contenu: { arm: { mecanise: { value: false, heritee: false, etapeHeritee: null } } },
      },
      'oct',
      'arm',
      [
        {
          documentTypeId: 'atf',
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: 'cur',
          entrepriseId: entreprise1Id,
        },

        {
          documentTypeId: 'jid',
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: 'jct',
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: 'kbi',
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: 'jcf',
          entrepriseId: entreprise1Id,
        },
      ]
    ).valid
  ).toBe(true)
})

test('getDocumentsTypes', () => {
  expect(getDocumentsTypes({ typeId: 'asl' }, 'oct', 'axm', [], false)).toMatchInlineSnapshot(`
    [
      {
        "id": "dei",
        "nom": "Décision",
        "optionnel": true,
      },
      {
        "description": "Avis suite à la demande d'accord du propriétaire du sol",
        "id": "let",
        "nom": "Lettre",
        "optionnel": false,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)

  expect(getDocumentsTypes({ typeId: 'mfr' }, 'oct', 'arm', [], false)).toMatchInlineSnapshot(`
    [
      {
        "id": "cam",
        "nom": "Contrat d'amodiation",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "car",
        "nom": "Documents cartographiques",
        "optionnel": false,
      },
      {
        "id": "cnt",
        "nom": "Contrat",
        "optionnel": true,
      },
      {
        "id": "cod",
        "nom": "Compléments au dossier de demande",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "dep",
        "nom": "Décision cas par cas",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "doe",
        "nom": "Dossier "Loi sur l'eau"",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "dom",
        "nom": "Dossier de demande",
        "optionnel": false,
      },
      {
        "id": "dos",
        "nom": "Dossier",
        "optionnel": true,
      },
      {
        "id": "fac",
        "nom": "Facture",
        "optionnel": true,
      },
      {
        "id": "fic",
        "nom": "Fiche de complétude",
        "optionnel": true,
      },
      {
        "id": "fip",
        "nom": "Fiche de présentation",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "for",
        "nom": "Formulaire de demande",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "jpa",
        "nom": "Justificatif de paiement",
        "optionnel": true,
      },
      {
        "id": "lem",
        "nom": "Lettre de demande",
        "optionnel": true,
      },
      {
        "id": "let",
        "nom": "Lettre",
        "optionnel": true,
      },
      {
        "id": "noi",
        "nom": "Notice d'incidence",
        "optionnel": true,
      },
      {
        "id": "rec",
        "nom": "Récépissé "Loi sur l'eau"",
        "optionnel": true,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)

  expect(getDocumentsTypes({ typeId: 'mfr' }, 'oct', 'arm', [], true)).toMatchInlineSnapshot(`
    [
      {
        "id": "cam",
        "nom": "Contrat d'amodiation",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "car",
        "nom": "Documents cartographiques",
        "optionnel": false,
      },
      {
        "id": "cnt",
        "nom": "Contrat",
        "optionnel": true,
      },
      {
        "id": "cod",
        "nom": "Compléments au dossier de demande",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "dep",
        "nom": "Décision cas par cas",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "doe",
        "nom": "Dossier "Loi sur l'eau"",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "dom",
        "nom": "Dossier de demande",
        "optionnel": false,
      },
      {
        "id": "dos",
        "nom": "Dossier",
        "optionnel": true,
      },
      {
        "id": "fac",
        "nom": "Facture",
        "optionnel": true,
      },
      {
        "id": "fic",
        "nom": "Fiche de complétude",
        "optionnel": true,
      },
      {
        "id": "fip",
        "nom": "Fiche de présentation",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "for",
        "nom": "Formulaire de demande",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "jpa",
        "nom": "Justificatif de paiement",
        "optionnel": true,
      },
      {
        "id": "lem",
        "nom": "Lettre de demande",
        "optionnel": true,
      },
      {
        "id": "let",
        "nom": "Lettre",
        "optionnel": true,
      },
      {
        "id": "noi",
        "nom": "Notice d'incidence",
        "optionnel": true,
      },
      {
        "id": "rec",
        "nom": "Récépissé "Loi sur l'eau"",
        "optionnel": true,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)

  expect(getDocumentsTypes({ typeId: 'mfr' }, 'oct', 'axm', ['1'], false)).toMatchSnapshot()
  expect(getDocumentsTypes({ typeId: 'mfr' }, 'oct', 'axm', ['2'], false)).toMatchSnapshot()
})

test('getAvisType', () => {
  expect(getAvisTypes('mfr', 'arm', [])).toMatchInlineSnapshot('[]')
  expect(getAvisTypes('asc', 'arm', [])).toMatchInlineSnapshot(`
    [
      {
        "id": "avisDirectionRegionaleDesAffairesCulturelles",
        "nom": "Avis de la Direction Régionale Des Affaires Culturelles (DRAC)",
        "optionnel": true,
      },
      {
        "id": "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques",
        "nom": "Avis du Conseil Départemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)",
        "optionnel": true,
      },
      {
        "id": "avisDirectionsRégionalesEconomieEmploiTravailSolidarités",
        "nom": "Avis de la Direction régionale de l'économie, de l'emploi, du travail et des solidarités",
        "optionnel": true,
      },
      {
        "id": "avisDirectionRegionaleFinancesPubliques",
        "nom": "Avis de la Direction Regionale Des Finances Publiques",
        "optionnel": true,
      },
      {
        "id": "avisGendarmerieNationale",
        "nom": "Avis de la Gendarmerie Nationale",
        "optionnel": true,
      },
      {
        "id": "avisIFREMER",
        "nom": "Avis de l'IFREMER",
        "optionnel": true,
      },
      {
        "id": "avisInstitutNationalOrigineQualite",
        "nom": "Avis de l'Institut National de l'origine et de la Qualité",
        "optionnel": true,
      },
      {
        "id": "avisServiceAdministratifLocal",
        "nom": "Avis d'un Service Administratif Local",
        "optionnel": true,
      },
      {
        "id": "avisAutoriteMilitaire",
        "nom": "Avis de l'Autorité militaire",
        "optionnel": true,
      },
      {
        "id": "avisParcNational",
        "nom": "Avis du Parc National",
        "optionnel": true,
      },
      {
        "id": "avisDirectionDepartementaleTerritoiresMer",
        "nom": "Avis de la Direction Départementale des Territoires et de la Mer (DDTM)",
        "optionnel": true,
      },
      {
        "id": "avisAgenceRegionaleSante",
        "nom": "Avis de l'Agence Régionale de Santé (ARS)",
        "optionnel": true,
      },
      {
        "id": "avisCaisseGeneraleSecuriteSociale",
        "nom": "Avis de la Caisse Générale de Sécurité Sociale",
        "optionnel": true,
      },
      {
        "id": "autreAvis",
        "nom": "Autre avis",
        "optionnel": true,
      },
      {
        "id": "avisOfficeNationalDesForets",
        "nom": "Avis de l'Office National des Forêts",
        "optionnel": false,
      },
      {
        "id": "expertiseOfficeNationalDesForets",
        "nom": "Expertise de l'Office National des Forêts",
        "optionnel": true,
      },
      {
        "id": "avisParcNaturelMarin",
        "nom": "Avis du Parc Naturel Marin",
        "optionnel": true,
      },
    ]
  `)
  expect(getAvisTypes('asc', 'arm', [communeIdValidator.parse('97302')])).toMatchInlineSnapshot(`
    [
      {
        "id": "avisDirectionRegionaleDesAffairesCulturelles",
        "nom": "Avis de la Direction Régionale Des Affaires Culturelles (DRAC)",
        "optionnel": true,
      },
      {
        "id": "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques",
        "nom": "Avis du Conseil Départemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)",
        "optionnel": true,
      },
      {
        "id": "avisDirectionsRégionalesEconomieEmploiTravailSolidarités",
        "nom": "Avis de la Direction régionale de l'économie, de l'emploi, du travail et des solidarités",
        "optionnel": true,
      },
      {
        "id": "avisDirectionRegionaleFinancesPubliques",
        "nom": "Avis de la Direction Regionale Des Finances Publiques",
        "optionnel": true,
      },
      {
        "id": "avisGendarmerieNationale",
        "nom": "Avis de la Gendarmerie Nationale",
        "optionnel": true,
      },
      {
        "id": "avisIFREMER",
        "nom": "Avis de l'IFREMER",
        "optionnel": true,
      },
      {
        "id": "avisInstitutNationalOrigineQualite",
        "nom": "Avis de l'Institut National de l'origine et de la Qualité",
        "optionnel": true,
      },
      {
        "id": "avisServiceAdministratifLocal",
        "nom": "Avis d'un Service Administratif Local",
        "optionnel": true,
      },
      {
        "id": "avisAutoriteMilitaire",
        "nom": "Avis de l'Autorité militaire",
        "optionnel": true,
      },
      {
        "id": "avisParcNational",
        "nom": "Avis du Parc National",
        "optionnel": true,
      },
      {
        "id": "avisDirectionDepartementaleTerritoiresMer",
        "nom": "Avis de la Direction Départementale des Territoires et de la Mer (DDTM)",
        "optionnel": true,
      },
      {
        "id": "avisAgenceRegionaleSante",
        "nom": "Avis de l'Agence Régionale de Santé (ARS)",
        "optionnel": true,
      },
      {
        "id": "avisCaisseGeneraleSecuriteSociale",
        "nom": "Avis de la Caisse Générale de Sécurité Sociale",
        "optionnel": true,
      },
      {
        "id": "autreAvis",
        "nom": "Autre avis",
        "optionnel": true,
      },
      {
        "id": "avisOfficeNationalDesForets",
        "nom": "Avis de l'Office National des Forêts",
        "optionnel": false,
      },
      {
        "id": "expertiseOfficeNationalDesForets",
        "nom": "Expertise de l'Office National des Forêts",
        "optionnel": true,
      },
      {
        "id": "avisParcNaturelMarin",
        "nom": "Avis du Parc Naturel Marin",
        "optionnel": true,
      },
      {
        "id": "avisDirectionAlimentationAgricultureForet",
        "nom": "Avis de la Direction de l'Alimentation de l'Agriculture et de la Forêt (DRAF)",
        "optionnel": true,
      },
      {
        "id": "avisEtatMajorOrpaillagePecheIllicite",
        "nom": "Avis de l'État-major Orpaillage et Pêche Illicite (EMOPI)",
        "optionnel": true,
      },
    ]
  `)
  expect(getAvisTypes('asc', 'axm', [communeIdValidator.parse('97302')])).toMatchInlineSnapshot(`
    [
      {
        "id": "avisDirectionRegionaleDesAffairesCulturelles",
        "nom": "Avis de la Direction Régionale Des Affaires Culturelles (DRAC)",
        "optionnel": true,
      },
      {
        "id": "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques",
        "nom": "Avis du Conseil Départemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)",
        "optionnel": true,
      },
      {
        "id": "avisDirectionsRégionalesEconomieEmploiTravailSolidarités",
        "nom": "Avis de la Direction régionale de l'économie, de l'emploi, du travail et des solidarités",
        "optionnel": true,
      },
      {
        "id": "avisDirectionRegionaleFinancesPubliques",
        "nom": "Avis de la Direction Regionale Des Finances Publiques",
        "optionnel": true,
      },
      {
        "id": "avisGendarmerieNationale",
        "nom": "Avis de la Gendarmerie Nationale",
        "optionnel": true,
      },
      {
        "id": "avisIFREMER",
        "nom": "Avis de l'IFREMER",
        "optionnel": true,
      },
      {
        "id": "avisInstitutNationalOrigineQualite",
        "nom": "Avis de l'Institut National de l'origine et de la Qualité",
        "optionnel": true,
      },
      {
        "id": "avisServiceAdministratifLocal",
        "nom": "Avis d'un Service Administratif Local",
        "optionnel": true,
      },
      {
        "id": "avisAutoriteMilitaire",
        "nom": "Avis de l'Autorité militaire",
        "optionnel": true,
      },
      {
        "id": "avisParcNational",
        "nom": "Avis du Parc National",
        "optionnel": true,
      },
      {
        "id": "avisDirectionDepartementaleTerritoiresMer",
        "nom": "Avis de la Direction Départementale des Territoires et de la Mer (DDTM)",
        "optionnel": true,
      },
      {
        "id": "avisAgenceRegionaleSante",
        "nom": "Avis de l'Agence Régionale de Santé (ARS)",
        "optionnel": true,
      },
      {
        "id": "avisCaisseGeneraleSecuriteSociale",
        "nom": "Avis de la Caisse Générale de Sécurité Sociale",
        "optionnel": true,
      },
      {
        "id": "autreAvis",
        "nom": "Autre avis",
        "optionnel": true,
      },
      {
        "id": "avisOfficeNationalDesForets",
        "nom": "Avis de l'Office National des Forêts",
        "optionnel": true,
      },
      {
        "id": "expertiseOfficeNationalDesForets",
        "nom": "Expertise de l'Office National des Forêts",
        "optionnel": true,
      },
      {
        "id": "avisParcNaturelMarin",
        "nom": "Avis du Parc Naturel Marin",
        "optionnel": true,
      },
      {
        "id": "avisDirectionAlimentationAgricultureForet",
        "nom": "Avis de la Direction de l'Alimentation de l'Agriculture et de la Forêt (DRAF)",
        "optionnel": true,
      },
      {
        "id": "avisEtatMajorOrpaillagePecheIllicite",
        "nom": "Avis de l'État-major Orpaillage et Pêche Illicite (EMOPI)",
        "optionnel": true,
      },
      {
        "id": "confirmationAccordProprietaireDuSol",
        "nom": "Confirmation de l'accord du propriétaire du sol",
        "optionnel": true,
      },
    ]
  `)
  expect(getAvisTypes('cac', 'prw', [])).toMatchInlineSnapshot(`
    [
      {
        "id": "autreAvis",
        "nom": "Autre avis",
        "optionnel": true,
      },
    ]
  `)
})

test('etapeAvisStepIsVisible', () => {
  expect(etapeAvisStepIsVisible({ typeId: 'mfr' }, 'arm', [])).toBe(false)
  expect(etapeAvisStepIsVisible({ typeId: 'asc' }, 'arm', [])).toBe(true)
})
