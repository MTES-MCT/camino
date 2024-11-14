import { ITitreDemarche, ITitre } from '../../types'

import { titreEtapeUpdationValidate } from './titre-etape-updation-validate'
import { userSuper } from '../../database/user-super'
import { describe, test, expect } from 'vitest'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { km2Validator } from 'camino-common/src/number'
import { ApiFlattenEtape } from '../../api/_format/titres-etapes'
const etapeBrouillonValide: Omit<ApiFlattenEtape, 'id'> = {
  titulaires: {
    value: [],
    heritee: false,
    etapeHeritee: null,
  },
  amodiataires: {
    value: [],
    heritee: false,
    etapeHeritee: null,
  },
  dateDebut: {
    value: null,
    heritee: false,
    etapeHeritee: null,
  },
  dateFin: {
    value: null,
    heritee: false,
    etapeHeritee: null,
  },
  perimetre: {
    value: null,
    heritee: false,
    etapeHeritee: null,
  },
  duree: {
    value: null,
    heritee: false,
    etapeHeritee: null,
  },
  substances: {
    value: ['auru'],
    heritee: false,
    etapeHeritee: null,
  },
  contenu: {},
  date: caminoDateValidator.parse('2024-01-01'),
  isBrouillon: ETAPE_IS_BROUILLON,
  note: {
    valeur: '',
    is_avertissement: false,
  },
  slug: etapeSlugValidator.parse('etapeSlug'),
  statutId: 'fai',
  titreDemarcheId: demarcheIdValidator.parse('demarcheId'),
  typeId: 'mfr',
  concurrence: { amIFirst: true },
  hasTitreFrom: true,
  demarcheIdsConsentement: [],
}
const etapeComplete: Omit<ApiFlattenEtape, 'id'> = {
  ...etapeBrouillonValide,
  isBrouillon: ETAPE_IS_NOT_BROUILLON,
  typeId: 'men',
  contenu: { arm: { mecanise: { value: true, heritee: true, etapeHeritee: { date: toCaminoDate('2022-01-01'), etapeTypeId: 'mfr', value: true } } } },
}
const demarcheId = demarcheIdValidator.parse('demarcheId')
const titreDemarche: ITitreDemarche = {
  id: demarcheId,
  typeId: 'oct',
  titreId: titreIdValidator.parse('titreId'),
  etapes: [
    {
      date: toCaminoDate('2022-01-01'),
      id: etapeIdValidator.parse('mfrid'),
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      statutId: 'fai',
      typeId: 'mfr',
      titreDemarcheId: demarcheId,
      communes: [],
      surface: km2Validator.parse(12),
      ordre: 0,
      concurrence: { amIFirst: true },
      hasTitreFrom: true,
      demarcheIdsConsentement: [],
    },
  ],
}
const titreARM: Pick<ITitre, 'typeId' | 'demarches'> = {
  typeId: 'arm',
  demarches: [titreDemarche],
}
describe('valide l’étape avant de l’enregistrer', () => {
  test("une ARM ou une AXM ne peuvent pas recevoir d'amodiataires", () => {
    // ARM
    const titreEtape: ApiFlattenEtape = {
      id: etapeIdValidator.parse('etapeId'),
      titulaires: {
        value: [],
        heritee: false,
        etapeHeritee: null,
      },
      amodiataires: {
        value: [],
        heritee: false,
        etapeHeritee: null,
      },
      dateDebut: {
        value: caminoDateValidator.parse('2024-01-01'),
        heritee: false,
        etapeHeritee: null,
      },
      dateFin: {
        value: caminoDateValidator.parse('2030-01-01'),
        heritee: false,
        etapeHeritee: null,
      },
      perimetre: {
        value: null,
        heritee: false,
        etapeHeritee: null,
      },
      duree: {
        value: null,
        heritee: false,
        etapeHeritee: null,
      },
      substances: {
        value: [],
        heritee: false,
        etapeHeritee: null,
      },
      contenu: {},
      date: caminoDateValidator.parse('2024-01-01'),
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      note: {
        valeur: '',
        is_avertissement: false,
      },
      slug: etapeSlugValidator.parse('etapeSlug'),
      statutId: 'fai',
      titreDemarcheId: demarcheIdValidator.parse('demarcheId'),
      typeId: 'mfr',
      concurrence: { amIFirst: true },
      hasTitreFrom: true,
      demarcheIdsConsentement: [],
    }

    let errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titreARM, [], [], [], [], [], userSuper)
    expect(errors).toMatchInlineSnapshot(`
      [
        "une date peut-être spécifiée que sur une étape de décision",
        "Les substances sont obligatoires",
        "la durée est obligatoire pour une démarche octroi",
        "les titulaires sont obligatoires pour les démarches octroi",
        "l'élément "Prospection mécanisée" de la section "Caractéristiques ARM" est obligatoire",
        "le périmètre est obligatoire pour une démarche octroi",
        "le document "Documents cartographiques" (car) est obligatoire",
        "le document "Dossier de demande" (dom) est obligatoire",
        "le document "Formulaire de demande" (for) est obligatoire",
        "Il y a des documents d'entreprise obligatoires, mais il n'y a pas de titulaire",
      ]
    `)
    // AXM
    const titreAxm: Pick<ITitre, 'typeId'> = {
      typeId: 'axm',
    }

    errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titreAxm, [], [], [], [], [], userSuper)
    expect(errors).toMatchInlineSnapshot(`
      [
        "une date peut-être spécifiée que sur une étape de décision",
        "Les substances sont obligatoires",
        "la durée est obligatoire pour une démarche octroi",
        "les titulaires sont obligatoires pour les démarches octroi",
        "le périmètre est obligatoire pour une démarche octroi",
        "le document "Documents cartographiques" (car) est obligatoire",
        "le document "Lettre de demande" (lem) est obligatoire",
        "le document "Identification de matériel" (idm) est obligatoire",
        "le document "Mesures prévues pour réhabiliter le site " (mes) est obligatoire",
        "le document "Méthodes pour l'exécution des travaux" (met) est obligatoire",
        "le document "Programme des travaux " (prg) est obligatoire",
        "le document "Schéma de pénétration du massif forestier" (sch) est obligatoire",
        "Il y a des documents d'entreprise obligatoires, mais il n'y a pas de titulaire",
        "Il manque des avis obligatoires",
      ]
    `)
  })
  test('valide brouillon', () => {
    const errors = titreEtapeUpdationValidate(etapeBrouillonValide, { ...titreDemarche, etapes: [] }, titreARM, [], [], [], [], [], userSuper)
    expect(errors).toStrictEqual([])
  })
  test('valide complète', () => {
    const errors = titreEtapeUpdationValidate(etapeComplete, titreDemarche, titreARM, [{ etape_document_type_id: 'doe' }], [], [], [], [], userSuper)
    expect(errors).toStrictEqual([])
  })
  test('invalide car on ne peut pas faire de mod sans men', () => {
    const errors = titreEtapeUpdationValidate(
      {
        ...etapeComplete,
        typeId: 'mod',
        duree: { value: 3, etapeHeritee: null, heritee: false },
        titulaires: { value: [entrepriseIdValidator.parse('entreprise1Id')], etapeHeritee: null, heritee: false },
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
      titreDemarche,
      titreARM,
      [{ etape_document_type_id: 'doe' }],
      [],
      [],
      [],
      [],
      userSuper
    )
    expect(errors).toMatchInlineSnapshot(`
      [
        "les étapes de la démarche machine ne sont pas valides",
      ]
    `)
  })

  test('valide complète avec héritage', () => {
    const errors = titreEtapeUpdationValidate(
      { ...etapeComplete, duree: { value: 12, heritee: true, etapeHeritee: { date: toCaminoDate('2022-01-01'), etapeTypeId: 'mfr', value: 12 } } },
      titreDemarche,
      titreARM,
      [{ etape_document_type_id: 'doe' }],
      [],
      [],
      [],
      [],
      userSuper
    )
    expect(errors).toStrictEqual([])
  })
  test('ne peut pas éditer les amodiataires sur une ARM', () => {
    const errors = titreEtapeUpdationValidate(
      { ...etapeComplete, amodiataires: { value: [entrepriseIdValidator.parse('entrepriseIdAmodiataire')], heritee: false, etapeHeritee: null } },
      titreDemarche,
      titreARM,
      [{ etape_document_type_id: 'doe' }],
      [],
      [],
      [],
      [],
      userSuper
    )
    expect(errors).toMatchInlineSnapshot(`
      [
        "une autorisation de recherche ne peut pas inclure d'amodiataires",
      ]
    `)
  })
})
