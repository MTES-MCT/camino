import { ITitreDemarche, ITitre } from '../../types.js'

import { titreEtapeUpdationValidate } from './titre-etape-updation-validate.js'
import { userSuper } from '../../database/user-super.js'
import { describe, test, expect } from 'vitest'
import { FlattenEtape } from 'camino-common/src/etape-form.js'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape.js'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date.js'
import { demarcheIdValidator } from 'camino-common/src/demarche.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'
import { titreIdValidator } from 'camino-common/src/validators/titres.js'
import { km2Validator } from 'camino-common/src/number.js'
const etapeBrouillonValide: FlattenEtape = {
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
  notes: {
    valeur: '',
    is_avertissement: false,
  },
  slug: etapeSlugValidator.parse('etapeSlug'),
  statutId: 'fai',
  titreDemarcheId: demarcheIdValidator.parse('demarcheId'),
  typeId: 'mfr',
}
const etapeComplete: FlattenEtape = {
  ...etapeBrouillonValide,
  isBrouillon: ETAPE_IS_NOT_BROUILLON,
  typeId: 'mod',
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
    const titreEtape: FlattenEtape = {
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
      notes: {
        valeur: '',
        is_avertissement: false,
      },
      slug: etapeSlugValidator.parse('etapeSlug'),
      statutId: 'fai',
      titreDemarcheId: demarcheIdValidator.parse('demarcheId'),
      typeId: 'mfr',
    }

    let errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titreARM, [], [], [], [], [], userSuper, null, null)
    expect(errors).toMatchInlineSnapshot(`
      [
        "impossible d’éditer la date de début",
        "impossible d’éditer la date d’échéance",
        "Les substances sont obligatoires",
        "la durée est obligatoire",
        "Les titulaires sont obligatoires",
        "l’élément "Prospection mécanisée" de la section "Caractéristiques ARM" est obligatoire",
        "Le périmètre est obligatoire",
        "le document "Documents cartographiques" (car) est obligatoire",
        "le document "Dossier de demande" (dom) est obligatoire",
        "le document "Formulaire de demande" (for) est obligatoire",
        "le document "Justificatif de paiement" (jpa) est obligatoire",
        "Il y a des documents d'entreprise obligatoires, mais il n'y a pas de titulaire",
      ]
    `)
    // AXM
    const titreAxm: Pick<ITitre, 'typeId'> = {
      typeId: 'axm',
    }

    errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titreAxm, [], [], [], [], [], userSuper, null, null)
    expect(errors).toMatchInlineSnapshot(`
      [
        "impossible d’éditer la date de début",
        "impossible d’éditer la date d’échéance",
        "Les substances sont obligatoires",
        "la durée est obligatoire",
        "Les titulaires sont obligatoires",
        "Le périmètre est obligatoire",
        "le document "Documents cartographiques" (car) est obligatoire",
        "le document "Lettre de demande" (lem) est obligatoire",
        "le document "Identification de matériel" (idm) est obligatoire",
        "le document "Mesures prévues pour réhabiliter le site " (mes) est obligatoire",
        "le document "Méthodes pour l'exécution des travaux" (met) est obligatoire",
        "le document "Programme des travaux " (prg) est obligatoire",
        "le document "Schéma de pénétration du massif forestier" (sch) est obligatoire",
        "Il y a des documents d'entreprise obligatoires, mais il n'y a pas de titulaire",
      ]
    `)
  })
  test('valide brouillon', () => {
    const errors = titreEtapeUpdationValidate(etapeBrouillonValide, { ...titreDemarche, etapes: [] }, titreARM, [], [], [], [], [], userSuper, null, null)
    expect(errors).toStrictEqual([])
  })
  test('valide complète', () => {
    const errors = titreEtapeUpdationValidate(etapeComplete, titreDemarche, titreARM, [{ etape_document_type_id: 'doe' }], [], [], [], [], userSuper, null, null)
    expect(errors).toStrictEqual([])
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
      userSuper,
      null,
      null
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
      userSuper,
      null,
      null
    )
    expect(errors).toMatchInlineSnapshot(`
      [
        "une autorisation de recherche ne peut pas inclure d'amodiataires",
      ]
    `)
  })
})
