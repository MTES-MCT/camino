import { expect, test } from 'vitest'
import {
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
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, documentTypeIdComplementaireObligatoireASL, documentTypeIdComplementaireObligatoireDAE, etapeDocumentIdValidator } from '../etape'
import { toCaminoDate } from '../date'
import { testBlankUser } from '../tests-utils'
import { entrepriseIdValidator } from '../entreprise'
import { communeIdValidator } from '../static/communes'

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
      },
      'amo',
      'prr'
    ).valid
  ).toBe(true)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'dpu',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'amo',
      'prr'
    ).valid
  ).toBe(true)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'amo',
      'prr'
    ).valid
  ).toBe(false)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'prr'
    ).valid
  ).toBe(true)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 2, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm'
    ).valid
  ).toBe(false)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm'
    ).valid
  ).toBe(false)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 2, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'oct',
      'arm'
    ).valid
  ).toBe(false)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: ['auru'], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'mut',
      'arm'
    ).valid
  ).toBe(true)
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: 'mfr',
        titulaires: { value: [], heritee: false, etapeHeritee: null },
      },
      'mut',
      'arm'
    ).valid
  ).toBe(false)
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
  expect(perimetreStepIsVisible({ typeId: 'mfr' })).toBe(true)
  expect(perimetreStepIsVisible({ typeId: 'acg' })).toBe(false)
})

test('perimetreStepIsComplete', () => {
  expect(
    perimetreStepIsComplete({
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
    }).valid
  ).toBe(false)
  expect(
    perimetreStepIsComplete({
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
    }).valid
  ).toBe(true)
  expect(
    perimetreStepIsComplete({
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
    }).valid
  ).toBe(true)
  expect(
    perimetreStepIsComplete({
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
    }).valid
  ).toBe(true)
})

test('etapeDocumentsStepIsVisible', () => {
  expect(etapeDocumentsStepIsVisible({ typeId: 'asl' }, 'oct', 'axm')).toBe(true)
  expect(etapeDocumentsStepIsVisible({ typeId: 'mdp' }, 'oct', 'axm')).toBe(true)
  expect(etapeDocumentsStepIsVisible({ typeId: 'cod' }, 'oct', 'axm')).toBe(false)
})

const axmDocumentsComplete = [
  {
    description: 'Plan à l’échelle 1/50 000ème ou 1/100 000ème',
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
    description: 'descriptif des méthodes envisagées pour l’exécution des travaux ((décret 2001-204, art. 6)',
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
  expect(etapeDocumentsStepIsComplete({ typeId: 'asl', contenu: {}, isBrouillon: ETAPE_IS_NOT_BROUILLON }, 'oct', 'axm', [], [], null, null, null).valid).toBe(false)
  expect(
    etapeDocumentsStepIsComplete(
      { typeId: 'asl', contenu: {}, isBrouillon: ETAPE_IS_NOT_BROUILLON },
      'oct',
      'axm',
      [{ etape_document_type_id: documentTypeIdComplementaireObligatoireASL }],
      [],
      null,
      null,
      null
    ).valid
  ).toBe(true)

  expect(
    etapeDocumentsStepIsComplete({ typeId: 'mfr', contenu: {}, isBrouillon: ETAPE_IS_BROUILLON }, 'oct', 'axm', axmDocumentsComplete, [], null, null, { ...testBlankUser, role: 'super' }).valid
  ).toBe(true)
  expect(
    etapeDocumentsStepIsComplete({ typeId: 'mfr', contenu: {}, isBrouillon: ETAPE_IS_BROUILLON }, 'oct', 'axm', axmDocumentsComplete, [], null, null, {
      ...testBlankUser,
      role: 'entreprise',
      entrepriseIds: [entreprise1Id],
    }).valid
  ).toBe(false)

  expect(
    etapeDocumentsStepIsComplete(
      { typeId: 'mfr', contenu: {}, isBrouillon: ETAPE_IS_BROUILLON },
      'oct',
      'axm',
      axmDocumentsComplete,
      [],
      {
        arrete_prefectoral: '',
        date: toCaminoDate('2023-02-02'),
        description: null,
        entreprises_lecture: true,
        etape_statut_id: 'exe',
        public_lecture: true,
        etape_document_type_id: documentTypeIdComplementaireObligatoireDAE,
      },
      {
        date: toCaminoDate('2023-02-02'),
        description: null,
        entreprises_lecture: true,
        etape_statut_id: 'exe',
        public_lecture: true,
        etape_document_type_id: documentTypeIdComplementaireObligatoireASL,
      },
      { ...testBlankUser, role: 'entreprise', entrepriseIds: [entreprise1Id] }
    ).valid
  ).toBe(true)
})

test('entrepriseDocumentsStepIsVisible', () => {
  expect(entrepriseDocumentsStepIsVisible({ typeId: 'asl' }, 'oct', 'axm')).toBe(false)
  expect(entrepriseDocumentsStepIsVisible({ typeId: 'mfr' }, 'oct', 'axm')).toBe(true)
  expect(entrepriseDocumentsStepIsVisible({ typeId: 'cod' }, 'oct', 'axm')).toBe(false)
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
        "optionnel": false,
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
        "optionnel": false,
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

  expect(getDocumentsTypes({ typeId: 'mfr' }, 'oct', 'axm', ['1'], false)).toMatchInlineSnapshot(`
    [
      {
        "id": "cam",
        "nom": "Contrat d'amodiation",
        "optionnel": true,
      },
      {
        "description": "Plan à l’échelle 1/50 000ème ou 1/100 000ème",
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
        "id": "dep",
        "nom": "Décision cas par cas",
        "optionnel": true,
      },
      {
        "id": "doe",
        "nom": "Dossier "Loi sur l'eau"",
        "optionnel": true,
      },
      {
        "id": "dom",
        "nom": "Dossier de demande",
        "optionnel": true,
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
        "id": "for",
        "nom": "Formulaire de demande",
        "optionnel": true,
      },
      {
        "id": "jpa",
        "nom": "Justificatif de paiement",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "lem",
        "nom": "Lettre de demande",
        "optionnel": false,
      },
      {
        "description": undefined,
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
        "description": "la liste et la valeur du matériel d’extraction et de
     traitement que le demandeur détient ou qu’il 
    envisage d’acquérir ainsi que, dans ce dernier
     cas, le financement correspondant. Ces pièces 
    sont demandées au titre de la justification des 
    capacités financières du
    demandeur 
    (décret 2001-204, art. 7)",
        "id": "idm",
        "nom": "Identification de matériel",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "jeg",
        "nom": "Justification d’existence du gisement",
        "optionnel": true,
      },
      {
        "description": "la définition des mesures prévues par le pétitionnaire pour réhabiliter le site après exploitation, notamment la nature et les modalités de revégétalisation envisagée. (décret 2001-204, art. 5 bis)",
        "id": "mes",
        "nom": "Mesures prévues pour réhabiliter le site ",
        "optionnel": false,
      },
      {
        "description": "descriptif des méthodes envisagées pour l’exécution des travaux ((décret 2001-204, art. 6)",
        "id": "met",
        "nom": "Méthodes pour l'exécution des travaux",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "nip",
        "nom": "Notice d’impact",
        "optionnel": false,
      },
      {
        "description": "Obligatoire pour les AEX hors de la zone 2 du SDOM",
        "id": "nir",
        "nom": "Notice d’impact renforcée",
        "optionnel": true,
      },
      {
        "description": "Description du phasage et planigramme des travaux. (décret 2001-204, art. 5)",
        "id": "prg",
        "nom": "Programme des travaux ",
        "optionnel": false,
      },
      {
        "description": "le schéma de pénétration du massif forestier proposé par le pétitionnaire pour l'acheminement du matériel lourd et la desserte du chantier (décret 2001-204, art. 5 bis)",
        "id": "sch",
        "nom": "Schéma de pénétration du massif forestier",
        "optionnel": false,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)

  expect(getDocumentsTypes({ typeId: 'mfr' }, 'oct', 'axm', ['2'], false)).toMatchInlineSnapshot(`
    [
      {
        "id": "cam",
        "nom": "Contrat d'amodiation",
        "optionnel": true,
      },
      {
        "description": "Plan à l’échelle 1/50 000ème ou 1/100 000ème",
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
        "id": "dep",
        "nom": "Décision cas par cas",
        "optionnel": true,
      },
      {
        "id": "doe",
        "nom": "Dossier "Loi sur l'eau"",
        "optionnel": true,
      },
      {
        "id": "dom",
        "nom": "Dossier de demande",
        "optionnel": true,
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
        "id": "for",
        "nom": "Formulaire de demande",
        "optionnel": true,
      },
      {
        "id": "jpa",
        "nom": "Justificatif de paiement",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "lem",
        "nom": "Lettre de demande",
        "optionnel": false,
      },
      {
        "description": undefined,
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
        "description": "la liste et la valeur du matériel d’extraction et de
     traitement que le demandeur détient ou qu’il 
    envisage d’acquérir ainsi que, dans ce dernier
     cas, le financement correspondant. Ces pièces 
    sont demandées au titre de la justification des 
    capacités financières du
    demandeur 
    (décret 2001-204, art. 7)",
        "id": "idm",
        "nom": "Identification de matériel",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "jeg",
        "nom": "Justification d’existence du gisement",
        "optionnel": false,
      },
      {
        "description": "la définition des mesures prévues par le pétitionnaire pour réhabiliter le site après exploitation, notamment la nature et les modalités de revégétalisation envisagée. (décret 2001-204, art. 5 bis)",
        "id": "mes",
        "nom": "Mesures prévues pour réhabiliter le site ",
        "optionnel": false,
      },
      {
        "description": "descriptif des méthodes envisagées pour l’exécution des travaux ((décret 2001-204, art. 6)",
        "id": "met",
        "nom": "Méthodes pour l'exécution des travaux",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "nip",
        "nom": "Notice d’impact",
        "optionnel": true,
      },
      {
        "description": "Obligatoire pour les AEX hors de la zone 2 du SDOM",
        "id": "nir",
        "nom": "Notice d’impact renforcée",
        "optionnel": false,
      },
      {
        "description": "Description du phasage et planigramme des travaux. (décret 2001-204, art. 5)",
        "id": "prg",
        "nom": "Programme des travaux ",
        "optionnel": false,
      },
      {
        "description": "le schéma de pénétration du massif forestier proposé par le pétitionnaire pour l'acheminement du matériel lourd et la desserte du chantier (décret 2001-204, art. 5 bis)",
        "id": "sch",
        "nom": "Schéma de pénétration du massif forestier",
        "optionnel": false,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)
})

test('getAvisType', () => {
  expect(getAvisTypes('mfr', 'arm', [])).toMatchInlineSnapshot(`[]`)
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
        "nom": "Avis de la Direction régionale de l’économie, de l’emploi, du travail et des solidarités",
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
        "nom": "Avis de la Direction régionale de l’économie, de l’emploi, du travail et des solidarités",
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
        "nom": "Avis de la Direction régionale de l’économie, de l’emploi, du travail et des solidarités",
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
})

test('etapeAvisStepIsVisible', () => {
  expect(etapeAvisStepIsVisible({ typeId: 'mfr' }, 'arm', [])).toBe(false)
  expect(etapeAvisStepIsVisible({ typeId: 'asc' }, 'arm', [])).toBe(true)
})
