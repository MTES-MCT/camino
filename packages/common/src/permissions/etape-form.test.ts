import { describe, expect, test } from 'vitest'
import {
  dateTypeStepIsComplete,
  entrepriseDocumentsStepIsComplete,
  entrepriseDocumentsStepIsVisible,
  etapeAvisStepIsComplete,
  etapeAvisStepIsVisible,
  etapeDocumentsStepIsComplete,
  etapeDocumentsStepIsVisible,
  fondamentaleStepIsComplete,
  fondamentaleStepIsVisible,
  getAvisTypes,
  getDocumentsTypes,
  IS_ARM_MECANISE,
  IS_ARM_NON_MECANISE,
  isArmMecanise,
  perimetreStepIsComplete,
  perimetreStepIsVisible,
  sectionsStepIsComplete,
  sectionsStepIsVisible,
} from './etape-form'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, EtapeDocument, TempEtapeDocument } from '../etape'
import { firstEtapeDateValidator, toCaminoDate } from '../date'
import { testBlankUser } from '../tests-utils'
import { entrepriseIdValidator } from '../entreprise'
import { communeIdValidator } from '../static/communes'
import { User } from '../roles'
import { ADMINISTRATION_IDS } from '../static/administrations'
import { SUBSTANCES_FISCALES_IDS } from '../static/substancesFiscales'
import { DEMARCHES_TYPES_IDS } from '../static/demarchesTypes'
import { TITRES_TYPES_IDS } from '../static/titresTypes'
import { ETAPES_TYPES } from '../static/etapesTypes'
import { demarcheIdValidator } from '../demarche'
import { DOCUMENTS_TYPES_IDS } from '../static/documentsTypes'
import { ETAPES_STATUTS } from '../static/etapesStatuts'

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
          typeId: ETAPES_TYPES.demande,
          statutId: ETAPES_STATUTS.FAIT,
        },
        user
      ).valid
    ).toBe(true)
  })

  test('le date-type avec une date, un typeId, et un statutId est complet', () => {
    const result = dateTypeStepIsComplete(
      {
        date: toCaminoDate('2024-01-01'),
        typeId: ETAPES_TYPES.demande,
        statutId: ETAPES_STATUTS.FAIT,
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
        typeId: ETAPES_TYPES.demande,
        statutId: ETAPES_STATUTS.FAIT,
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
  expect(fondamentaleStepIsVisible(ETAPES_TYPES.demande)).toBe(true)
  expect(fondamentaleStepIsVisible(ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie)).toBe(false)
})

test('fondamentaleStepIsComplete', () => {
  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Amodiation,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF,
      { ...testBlankUser, role: 'super' }
    ).valid
  ).toBe(true)

  expect(
    fondamentaleStepIsComplete(
      {
        duree: { value: 0, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Amodiation,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Amodiation,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Mutation,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Mutation,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
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
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
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
        typeId: ETAPES_TYPES.demande,
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
        typeId: ETAPES_TYPES.demande,
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
  expect(sectionsStepIsVisible({ typeId: ETAPES_TYPES.demande }, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)).toBe(true)
  expect(
    sectionsStepIsVisible({ typeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_ }, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX)
  ).toBe(false)
})

test('sectionsStepIsComplete', () => {
  expect(sectionsStepIsComplete({ typeId: ETAPES_TYPES.demande, contenu: {} }, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX).valid).toBe(false)
  expect(
    sectionsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, contenu: { arm: { mecanise: { value: true, heritee: false, etapeHeritee: null } } } },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
    ).valid
  ).toBe(true)
})

test('perimetreStepIsVisible', () => {
  expect(perimetreStepIsVisible({ typeId: ETAPES_TYPES.demande }, DEMARCHES_TYPES_IDS.Octroi)).toBe(true)
  expect(perimetreStepIsVisible({ typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie }, DEMARCHES_TYPES_IDS.Octroi)).toBe(false)

  expect(perimetreStepIsVisible({ typeId: ETAPES_TYPES.demande }, DEMARCHES_TYPES_IDS.Mutation)).toBe(false)
  expect(perimetreStepIsVisible({ typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie }, DEMARCHES_TYPES_IDS.Mutation)).toBe(false)
})

test('perimetreStepIsComplete', () => {
  expect(
    perimetreStepIsComplete(
      {
        typeId: ETAPES_TYPES.demande,
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
        typeId: ETAPES_TYPES.demande,
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
        typeId: ETAPES_TYPES.saisineEtAvisDuConseilGeneralDeLeconomie,
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
        typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
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
        typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
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
  expect(etapeDocumentsStepIsVisible()).toBe(true)
})

const axmDocumentsComplete: Pick<EtapeDocument | TempEtapeDocument, 'etape_document_type_id'>[] = [
  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.documentsCartographiques,
  },

  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.lettreDeDemande,
  },

  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.identificationDeMateriel,
  },

  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.mesuresPrevuesPourRehabiliterLeSite,
  },
  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.methodesPourLExecutionDesTravaux,
  },
  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.noticeDImpact,
  },

  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.programmeDesTravaux,
  },
  {
    etape_document_type_id: DOCUMENTS_TYPES_IDS.schemaDePenetrationDuMassifForestier,
  },
]

const entreprise1Id = entrepriseIdValidator.parse('id1')
test('etapeDocumentsStepIsComplete avec mecanisation', () => {
  expect(
    etapeDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, contenu: { arm: { mecanise: { value: true, etapeHeritee: null, heritee: false } } }, isBrouillon: ETAPE_IS_NOT_BROUILLON },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [{ etape_document_type_id: DOCUMENTS_TYPES_IDS.decret }],
      [],
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document "Documents cartographiques" (car) est obligatoire",
        "le document "Décision cas par cas" (dep) est obligatoire",
        "le document "Dossier "Loi sur l'eau"" (doe) est obligatoire",
        "le document "Dossier de demande" (dom) est obligatoire",
        "le document "Formulaire de demande" (for) est obligatoire",
      ],
      "valid": false,
    }
  `)

  expect(
    etapeDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, contenu: { arm: { mecanise: { value: false, etapeHeritee: null, heritee: false } } }, isBrouillon: ETAPE_IS_NOT_BROUILLON },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [{ etape_document_type_id: DOCUMENTS_TYPES_IDS.decret }],
      [],
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document "Documents cartographiques" (car) est obligatoire",
        "le document "Dossier de demande" (dom) est obligatoire",
        "le document "Formulaire de demande" (for) est obligatoire",
      ],
      "valid": false,
    }
  `)
})

test('etapeDocumentsStepIsComplete', () => {
  expect(
    etapeDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.consultationDesAdministrationsCentrales, contenu: {}, isBrouillon: ETAPE_IS_NOT_BROUILLON },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [{ etape_document_type_id: DOCUMENTS_TYPES_IDS.decret }],
      [],
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document "Lettre de saisine des services de l'administration centrale" (lac) est obligatoire",
      ],
      "valid": false,
    }
  `)

  expect(
    etapeDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, contenu: {}, isBrouillon: ETAPE_IS_BROUILLON },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      axmDocumentsComplete,
      [],
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
    {
      "valid": true,
    }
  `)

  expect(
    etapeDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational, contenu: {}, isBrouillon: ETAPE_IS_BROUILLON },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [],
      [],
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
    {
      "valid": true,
    }
  `)
})

test('entrepriseDocumentsStepIsVisible', () => {
  expect(entrepriseDocumentsStepIsVisible({ typeId: ETAPES_TYPES.consultationDesAdministrationsCentrales }, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX)).toBe(
    false
  )
  expect(entrepriseDocumentsStepIsVisible({ typeId: ETAPES_TYPES.demande }, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX)).toBe(true)
  expect(entrepriseDocumentsStepIsVisible({ typeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational }, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX)).toBe(
    false
  )
})
test('entrepriseDocumentsStepIsComplete', () => {
  expect(
    entrepriseDocumentsStepIsComplete(
      {
        typeId: ETAPES_TYPES.consultationDesAdministrationsCentrales,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
        contenu: {},
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      []
    ).valid
  ).toBe(true)
  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, titulaires: { value: [], heritee: false, etapeHeritee: null }, amodiataires: { value: [], heritee: false, etapeHeritee: null }, contenu: {} },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      []
    ).valid
  ).toBe(false)

  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, titulaires: { value: [entreprise1Id], heritee: false, etapeHeritee: null }, amodiataires: { value: [], heritee: false, etapeHeritee: null }, contenu: {} },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      []
    ).valid
  ).toBe(false)
  expect(
    entrepriseDocumentsStepIsComplete(
      { typeId: ETAPES_TYPES.demande, titulaires: { value: [], heritee: false, etapeHeritee: null }, amodiataires: { value: [entreprise1Id], heritee: false, etapeHeritee: null }, contenu: {} },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      []
    ).valid
  ).toBe(false)

  expect(
    entrepriseDocumentsStepIsComplete(
      {
        typeId: ETAPES_TYPES.demande,
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [entreprise1Id], heritee: false, etapeHeritee: null },
        contenu: { arm: { mecanise: { value: false, heritee: false, etapeHeritee: null } } },
      },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      [
        {
          documentTypeId: DOCUMENTS_TYPES_IDS.attestationFiscale,
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: DOCUMENTS_TYPES_IDS.curriculumVitae,
          entrepriseId: entreprise1Id,
        },

        {
          documentTypeId: DOCUMENTS_TYPES_IDS.justificatifDIdentite,
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: DOCUMENTS_TYPES_IDS.justificatifDesCapacitesTechniques,
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: DOCUMENTS_TYPES_IDS.kbis,
          entrepriseId: entreprise1Id,
        },
        {
          documentTypeId: DOCUMENTS_TYPES_IDS.justificatifDesCapacitesFinancieres,
          entrepriseId: entreprise1Id,
        },
      ]
    ).valid
  ).toBe(true)
})

test('getDocumentsTypes', () => {
  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.consultationDesAdministrationsCentrales },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [],
      IS_ARM_NON_MECANISE,
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "id": "lac",
        "nom": "Lettre de saisine des services de l'administration centrale",
        "optionnel": false,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)

  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.demande },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [],
      IS_ARM_NON_MECANISE,
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
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

  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.demande },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [],
      IS_ARM_MECANISE,
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchInlineSnapshot(`
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
  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.demande },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      [],
      IS_ARM_MECANISE,
      firstEtapeDateValidator.parse('2024-10-01')
    )
  ).toMatchInlineSnapshot(`
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
  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.demande },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      ['1'],
      IS_ARM_NON_MECANISE,
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchSnapshot()
  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.demande },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      ['2'],
      IS_ARM_NON_MECANISE,
      firstEtapeDateValidator.parse('2022-01-01')
    )
  ).toMatchSnapshot()
  expect(
    getDocumentsTypes(
      { typeId: ETAPES_TYPES.demande },
      DEMARCHES_TYPES_IDS.Octroi,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarcheIdValidator.parse('demarcheId'),
      ['2'],
      IS_ARM_NON_MECANISE,
      firstEtapeDateValidator.parse('2024-12-01')
    )
  ).toMatchSnapshot()
})

const demarcheId = demarcheIdValidator.parse('demarcheId')
const firstEtapeDate = firstEtapeDateValidator.parse('2022-01-01')
test("getAvisType avis de l'office national des forêts est optionnel pour la procédure spécifique", () => {
  const avis = getAvisTypes(
    ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
    TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
    DEMARCHES_TYPES_IDS.Octroi,
    demarcheId,
    firstEtapeDateValidator.parse('2024-11-01'),
    [],
    IS_ARM_MECANISE
  )
  expect(avis.avisOfficeNationalDesForets?.optionnel).toBe(true)
})
test("getAvisType: avis au cas par cas et avis du propriétaire du sol sont obligatoires pour les demandes d'ARM mécanisée de la procédure spécifique", () => {
  expect(getAvisTypes(ETAPES_TYPES.demande, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, demarcheId, firstEtapeDate, [], IS_ARM_MECANISE)).toMatchInlineSnapshot(`{}`)
  expect(
    getAvisTypes(ETAPES_TYPES.demande, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, demarcheId, firstEtapeDateValidator.parse('2025-01-01'), [], IS_ARM_MECANISE)
  ).toMatchInlineSnapshot(`
    {
      "avisCasParCas": {
        "id": "avisCasParCas",
        "optionnel": false,
      },
      "avisProprietaireDuSol": {
        "id": "avisProprietaireDuSol",
        "optionnel": false,
      },
    }
  `)
})
test('getAvisType', () => {
  expect(getAvisTypes(ETAPES_TYPES.avisDesCollectivites, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, demarcheId, firstEtapeDate, [], IS_ARM_MECANISE))
    .toMatchInlineSnapshot(`
      {
        "avisDUneCollectivite": {
          "id": "avisDUneCollectivite",
          "optionnel": true,
        },
      }
    `)
  expect(getAvisTypes(ETAPES_TYPES.demande, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, demarcheId, firstEtapeDate, [], IS_ARM_MECANISE)).toMatchInlineSnapshot(`{}`)
  expect(
    getAvisTypes(ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, demarcheId, firstEtapeDate, [], IS_ARM_MECANISE)
  ).toMatchInlineSnapshot(`
    {
      "autreAvis": {
        "id": "autreAvis",
        "optionnel": true,
      },
      "avisAgenceRegionaleSante": {
        "id": "avisAgenceRegionaleSante",
        "optionnel": true,
      },
      "avisAutoriteMilitaire": {
        "id": "avisAutoriteMilitaire",
        "optionnel": true,
      },
      "avisCaisseGeneraleSecuriteSociale": {
        "id": "avisCaisseGeneraleSecuriteSociale",
        "optionnel": true,
      },
      "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques": {
        "id": "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques",
        "optionnel": true,
      },
      "avisDirectionDepartementaleTerritoiresMer": {
        "id": "avisDirectionDepartementaleTerritoiresMer",
        "optionnel": true,
      },
      "avisDirectionRegionaleDesAffairesCulturelles": {
        "id": "avisDirectionRegionaleDesAffairesCulturelles",
        "optionnel": true,
      },
      "avisDirectionRegionaleFinancesPubliques": {
        "id": "avisDirectionRegionaleFinancesPubliques",
        "optionnel": true,
      },
      "avisDirectionsRégionalesEconomieEmploiTravailSolidarités": {
        "id": "avisDirectionsRégionalesEconomieEmploiTravailSolidarités",
        "optionnel": true,
      },
      "avisGendarmerieNationale": {
        "id": "avisGendarmerieNationale",
        "optionnel": true,
      },
      "avisIFREMER": {
        "id": "avisIFREMER",
        "optionnel": true,
      },
      "avisInstitutNationalOrigineQualite": {
        "id": "avisInstitutNationalOrigineQualite",
        "optionnel": true,
      },
      "avisOfficeNationalDesForets": {
        "id": "avisOfficeNationalDesForets",
        "optionnel": false,
      },
      "avisParcNational": {
        "id": "avisParcNational",
        "optionnel": true,
      },
      "avisParcNaturelMarin": {
        "id": "avisParcNaturelMarin",
        "optionnel": true,
      },
      "avisServiceAdministratifLocal": {
        "id": "avisServiceAdministratifLocal",
        "optionnel": true,
      },
      "expertiseOfficeNationalDesForets": {
        "id": "expertiseOfficeNationalDesForets",
        "optionnel": true,
      },
    }
  `)
  expect(
    getAvisTypes(
      ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      DEMARCHES_TYPES_IDS.Octroi,
      demarcheId,
      firstEtapeDate,
      [communeIdValidator.parse('97302')],
      IS_ARM_MECANISE
    )
  ).toMatchInlineSnapshot(`
    {
      "autreAvis": {
        "id": "autreAvis",
        "optionnel": true,
      },
      "avisAgenceRegionaleSante": {
        "id": "avisAgenceRegionaleSante",
        "optionnel": true,
      },
      "avisAutoriteMilitaire": {
        "id": "avisAutoriteMilitaire",
        "optionnel": true,
      },
      "avisCaisseGeneraleSecuriteSociale": {
        "id": "avisCaisseGeneraleSecuriteSociale",
        "optionnel": true,
      },
      "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques": {
        "id": "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques",
        "optionnel": true,
      },
      "avisDirectionAlimentationAgricultureForet": {
        "id": "avisDirectionAlimentationAgricultureForet",
        "optionnel": true,
      },
      "avisDirectionDepartementaleTerritoiresMer": {
        "id": "avisDirectionDepartementaleTerritoiresMer",
        "optionnel": true,
      },
      "avisDirectionRegionaleDesAffairesCulturelles": {
        "id": "avisDirectionRegionaleDesAffairesCulturelles",
        "optionnel": true,
      },
      "avisDirectionRegionaleFinancesPubliques": {
        "id": "avisDirectionRegionaleFinancesPubliques",
        "optionnel": true,
      },
      "avisDirectionsRégionalesEconomieEmploiTravailSolidarités": {
        "id": "avisDirectionsRégionalesEconomieEmploiTravailSolidarités",
        "optionnel": true,
      },
      "avisEtatMajorOrpaillagePecheIllicite": {
        "id": "avisEtatMajorOrpaillagePecheIllicite",
        "optionnel": true,
      },
      "avisGendarmerieNationale": {
        "id": "avisGendarmerieNationale",
        "optionnel": true,
      },
      "avisIFREMER": {
        "id": "avisIFREMER",
        "optionnel": true,
      },
      "avisInstitutNationalOrigineQualite": {
        "id": "avisInstitutNationalOrigineQualite",
        "optionnel": true,
      },
      "avisOfficeNationalDesForets": {
        "id": "avisOfficeNationalDesForets",
        "optionnel": false,
      },
      "avisParcNational": {
        "id": "avisParcNational",
        "optionnel": true,
      },
      "avisParcNaturelMarin": {
        "id": "avisParcNaturelMarin",
        "optionnel": true,
      },
      "avisServiceAdministratifLocal": {
        "id": "avisServiceAdministratifLocal",
        "optionnel": true,
      },
      "expertiseOfficeNationalDesForets": {
        "id": "expertiseOfficeNationalDesForets",
        "optionnel": true,
      },
    }
  `)
  expect(
    getAvisTypes(
      ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
      TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      DEMARCHES_TYPES_IDS.Octroi,
      demarcheId,
      firstEtapeDate,
      [communeIdValidator.parse('97302')],
      IS_ARM_MECANISE
    )
  ).toMatchInlineSnapshot(`
    {
      "autreAvis": {
        "id": "autreAvis",
        "optionnel": true,
      },
      "avisAgenceRegionaleSante": {
        "id": "avisAgenceRegionaleSante",
        "optionnel": true,
      },
      "avisAutoriteMilitaire": {
        "id": "avisAutoriteMilitaire",
        "optionnel": true,
      },
      "avisCaisseGeneraleSecuriteSociale": {
        "id": "avisCaisseGeneraleSecuriteSociale",
        "optionnel": true,
      },
      "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques": {
        "id": "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques",
        "optionnel": true,
      },
      "avisDirectionAlimentationAgricultureForet": {
        "id": "avisDirectionAlimentationAgricultureForet",
        "optionnel": true,
      },
      "avisDirectionDepartementaleTerritoiresMer": {
        "id": "avisDirectionDepartementaleTerritoiresMer",
        "optionnel": true,
      },
      "avisDirectionRegionaleDesAffairesCulturelles": {
        "id": "avisDirectionRegionaleDesAffairesCulturelles",
        "optionnel": true,
      },
      "avisDirectionRegionaleFinancesPubliques": {
        "id": "avisDirectionRegionaleFinancesPubliques",
        "optionnel": true,
      },
      "avisDirectionsRégionalesEconomieEmploiTravailSolidarités": {
        "id": "avisDirectionsRégionalesEconomieEmploiTravailSolidarités",
        "optionnel": true,
      },
      "avisEtatMajorOrpaillagePecheIllicite": {
        "id": "avisEtatMajorOrpaillagePecheIllicite",
        "optionnel": true,
      },
      "avisGendarmerieNationale": {
        "id": "avisGendarmerieNationale",
        "optionnel": true,
      },
      "avisIFREMER": {
        "id": "avisIFREMER",
        "optionnel": true,
      },
      "avisInstitutNationalOrigineQualite": {
        "id": "avisInstitutNationalOrigineQualite",
        "optionnel": true,
      },
      "avisOfficeNationalDesForets": {
        "id": "avisOfficeNationalDesForets",
        "optionnel": true,
      },
      "avisParcNational": {
        "id": "avisParcNational",
        "optionnel": true,
      },
      "avisParcNaturelMarin": {
        "id": "avisParcNaturelMarin",
        "optionnel": true,
      },
      "avisServiceAdministratifLocal": {
        "id": "avisServiceAdministratifLocal",
        "optionnel": true,
      },
      "confirmationAccordProprietaireDuSol": {
        "id": "confirmationAccordProprietaireDuSol",
        "optionnel": true,
      },
      "expertiseOfficeNationalDesForets": {
        "id": "expertiseOfficeNationalDesForets",
        "optionnel": true,
      },
    }
  `)
  expect(
    getAvisTypes(
      ETAPES_TYPES.consultationDesAdministrationsCentrales,
      TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS,
      DEMARCHES_TYPES_IDS.Octroi,
      demarcheId,
      firstEtapeDate,
      [],
      IS_ARM_MECANISE
    )
  ).toMatchInlineSnapshot(`
    {
      "autreAvis": {
        "id": "autreAvis",
        "optionnel": true,
      },
    }
  `)
})

test('etapeAvisStepIsVisible', () => {
  expect(etapeAvisStepIsVisible({ typeId: ETAPES_TYPES.demande, contenu: {} }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, demarcheId, firstEtapeDate, [])).toBe(
    false
  )
  expect(
    etapeAvisStepIsVisible(
      { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, contenu: {} },
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      DEMARCHES_TYPES_IDS.Octroi,
      demarcheId,
      firstEtapeDate,
      []
    )
  ).toBe(true)
})

test('etapeAvisStepIsComplete', () => {
  expect(
    etapeAvisStepIsComplete(
      { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, contenu: {} },
      [{ avis_type_id: 'autreAvis' }],
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      DEMARCHES_TYPES_IDS.Octroi,
      demarcheId,
      firstEtapeDate,
      []
    ).valid
  ).toBe(false)
  expect(
    etapeAvisStepIsComplete(
      { typeId: ETAPES_TYPES.avisDesCollectivites, contenu: {} },
      [{ avis_type_id: 'autreAvis' }],
      TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      DEMARCHES_TYPES_IDS.Octroi,
      demarcheId,
      firstEtapeDate,
      []
    ).valid
  ).toBe(true)
})

describe('isArmMecanise', () => {
  test('retourne false pour un flattened contenu vide', () => {
    expect(isArmMecanise({})).toBe(IS_ARM_NON_MECANISE)
  })
  test('retourne false pour une ARM non mécanisée (flattened contenu)', () => {
    expect(isArmMecanise({ arm: { mecanise: { value: false, heritee: false, etapeHeritee: null } } })).toBe(IS_ARM_NON_MECANISE)
  })
  test('retourne true pour une ARM mécanisée (flattened contenu)', () => {
    expect(isArmMecanise({ arm: { mecanise: { value: true, heritee: false, etapeHeritee: null } } })).toBe(IS_ARM_MECANISE)
  })
  test('retourne false pour des sections with value vides', () => {
    expect(isArmMecanise([])).toBe(IS_ARM_NON_MECANISE)
  })
  test('retourne false pour une ARM non mécanisée (sections with value)', () => {
    expect(isArmMecanise([{ id: 'arm', elements: [{ id: 'mecanise', type: 'checkbox', optionnel: false, value: false }] }])).toBe(IS_ARM_NON_MECANISE)
  })
  test('retourne true pour une ARM mécanisée (sections with value)', () => {
    expect(isArmMecanise([{ id: 'arm', elements: [{ id: 'mecanise', type: 'checkbox', optionnel: false, value: true }] }])).toBe(IS_ARM_MECANISE)
  })
})
