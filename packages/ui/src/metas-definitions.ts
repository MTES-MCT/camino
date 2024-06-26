import { documentsTypes, etapesTypesDocumentsTypes } from '@/api/metas'

import { FREQUENCES_IDS } from 'camino-common/src/static/frequence'
import { Domaines } from 'camino-common/src/static/domaines'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { titresStatutsArray } from 'camino-common/src/static/titresStatuts'
import { phasesStatuts } from 'camino-common/src/static/phasesStatuts'
import { titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts'
import { activitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { titresTypesDemarcheTypesMetas } from 'camino-common/src/static/titresTypesDemarchesTypes'
import { etapesTypesEntrepriseDocumentsTypesMetas, TDEEntrepriseDocumentsTypesMetas } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { TDEMetas } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes'
import { TDEDocumentsTypesMetas } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { etapesTypesEtapesStatutsMetas } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { TitresTypes } from 'camino-common/src/static/titresTypes'
import { sortedActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'

const labelGet = (entity?: { id: string; nom: string }) => (entity ? `${entity.id} - ${entity.nom}` : '')

export const metasIndex = {
  'titres-types': {
    get: () => Object.values(TitresTypes),
    labelGet,
    nom: 'Domaines | Types des titres',
    colonnes: [
      { id: 'id', nom: 'Id' },
      {
        id: 'domaineId',
        nom: 'Domaine',
        type: 'static',
        elements: Object.values(Domaines),
      },
      {
        id: 'typeId',
        nom: 'Type',
        type: 'static',
        elements: Object.values(TitresTypesTypes),
      },
    ],
  },
  'titres-statuts': {
    get: () => titresStatutsArray,
    labelGet,
    nom: 'Statuts des titres',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success'],
      },
      { id: 'ordre', nom: 'Ordre', type: Number },
    ],
  },
  'titre-types--titres-statuts': {
    get: () => titreTypesStatutsTitresPublicLecture,
    nom: 'Types des titres | Statuts des titres',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types',
      },
      {
        id: 'titreStatutId',
        nom: 'Statut de titre',
        type: 'entities',
        entities: 'titres-statuts',
      },
      { id: 'publicLecture', nom: 'Public', type: Boolean, optional: true },
    ],
    ids: ['titreTypeId', 'titreStatutId'],
  },
  'titres-types--demarches-types': {
    get: () => titresTypesDemarcheTypesMetas,
    nom: 'Types des titres | Types des démarches',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types',
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de démarche',
        type: 'entities',
        entities: 'demarches-types',
      },
    ],
    ids: ['titreTypeId', 'demarcheTypeId'],
  },
  'etapes-statuts': {
    get: () => Object.values(EtapesStatuts),
    labelGet,
    nom: 'Statuts des étapes',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error'],
      },
    ],
  },
  'etapes-types--etapes-statuts': {
    get: () => etapesTypesEtapesStatutsMetas,
    nom: 'Types des étapes | Statuts des étapes',
    colonnes: [
      {
        id: 'etapeTypeId',
        nom: "Type d'étape",
        type: 'entities',
        entities: 'etapes-types',
      },
      {
        id: 'etapeStatutId',
        nom: "Statut d'étape",
        type: 'entities',
        entities: 'etapes-statuts',
      },
      { id: 'ordre', nom: 'Ordre', type: Number },
    ],
    ids: ['etapeTypeId', 'etapeStatutId'],
  },
  'demarches-types': {
    get: () => sortedDemarchesTypes,
    labelGet,
    nom: 'Types des démarches',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'ordre', nom: 'Ordre', type: Number },
      { id: 'description', nom: 'Description', type: String, optional: true },
      { id: 'duree', nom: 'Durée', type: Boolean, optional: true },
      { id: 'points', nom: 'Points', type: Boolean, optional: true },
      { id: 'substances', nom: 'Substances', type: Boolean, optional: true },
      { id: 'titulaires', nom: 'Titulaires', type: Boolean, optional: true },
      { id: 'exception', nom: 'Exception', type: Boolean, optional: true },
      {
        id: 'renouvelable',
        nom: 'Renouvelable',
        type: Boolean,
        optional: true,
      },
      { id: 'travaux', nom: 'Travaux', type: Boolean, optional: true },
    ],
  },
  'phases-statuts': {
    get: () => phasesStatuts,
    nom: 'Statuts des phases',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error'],
      },
    ],
  },
  'etapes-types': {
    get: () => Object.values(EtapesTypes),
    labelGet,
    nom: 'Types des étapes',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      {
        id: 'date_fin',
        nom: 'Date de fin',
        type: Date,
        class: ['min-width-12'],
        optional: true,
      },
      {
        id: 'fondamentale',
        nom: 'Fondamentale',
        type: Boolean,
        optional: true,
      },
      {
        id: 'public_lecture',
        nom: 'Lecture public',
        type: Boolean,
        optional: true,
      },
      {
        id: 'entreprises_lecture',
        nom: 'Lecture entreprises',
        type: Boolean,
        optional: true,
      },
    ],
  },
  'titres-types--demarches-types--etapes-types': {
    get: () => TDEMetas,
    nom: 'Types des titres | Types des démarches | types des étapes',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types',
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de démarche',
        type: 'entities',
        entities: 'demarches-types',
      },
      {
        id: 'etapeTypeId',
        nom: "Type d'étape",
        type: 'entities',
        entities: 'etapes-types',
      },
    ],
    ids: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId'],
  },
  'titres-types--demarches-types--etapes-types--documents-types': {
    get: () => TDEDocumentsTypesMetas,
    nom: 'Types des titres | Types des démarches | Types des étapes | Types des documents',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types',
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de démarche',
        type: 'entities',
        entities: 'demarches-types',
      },
      {
        id: 'etapeTypeId',
        nom: "Type d'étape",
        type: 'entities',
        entities: 'etapes-types',
      },
      {
        id: 'documentTypeId',
        nom: 'Type de document',
        type: 'entities',
        entities: 'documents-types',
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true },
    ],
    ids: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId', 'documentTypeId'],
  },
  'titres-types--demarches-types--etapes-types--justificatifs-types': {
    get: () => TDEEntrepriseDocumentsTypesMetas,
    nom: 'Types des titres | Types des démarches | Types des étapes | Types des justificatifs',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types',
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de démarche',
        type: 'entities',
        entities: 'demarches-types',
      },
      {
        id: 'etapeTypeId',
        nom: "Type d'étape",
        type: 'entities',
        entities: 'etapes-types',
      },
      {
        id: 'documentTypeId',
        nom: 'Type de justificatif',
        type: 'entities',
        entities: 'documents-types',
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true },
    ],
    ids: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId', 'documentTypeId'],
  },
  'etapes-types--documents-types': {
    get: etapesTypesDocumentsTypes,
    nom: 'Types des étapes | Types des documents',
    colonnes: [
      {
        id: 'etapeTypeId',
        nom: "Type d'étape",
        type: 'entities',
        entities: 'etapes-types',
      },
      {
        id: 'documentTypeId',
        nom: 'Type de documents',
        type: 'entities',
        entities: 'documents-types',
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true },
    ],
    ids: ['etapeTypeId', 'documentTypeId'],
  },

  'etapes-types--justificatifs-types': {
    get: () => etapesTypesEntrepriseDocumentsTypesMetas,
    nom: 'Types des étapes | Types des justificatifs',
    colonnes: [
      {
        id: 'etapeTypeId',
        nom: "Type d'étape",
        type: 'entities',
        entities: 'etapes-types',
      },
      {
        id: 'documentTypeId',
        nom: 'Type de justificatifs',
        type: 'entities',
        entities: 'documents-types',
      },
    ],
    ids: ['etapeTypeId', 'documentTypeId'],
  },
  'documents-types': {
    get: documentsTypes,
    labelGet,
    nom: 'Types des documents',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
    ],
  },
  'activites-types': {
    get: () => sortedActivitesTypes,
    labelGet,
    nom: 'Types des activités',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      {
        id: 'frequenceId',
        nom: 'Id la fréquence',
        type: Array,
        elements: Object.values(FREQUENCES_IDS),
      },
      { id: 'ordre', nom: 'Ordre', type: Number },
      {
        id: 'description',
        nom: 'Description',
        type: String,
        optional: true,
        class: ['min-width-12'],
      },
      { id: 'sections', nom: 'Sections', type: 'json', optional: true },
      {
        id: 'dateDebut',
        nom: 'Date de début',
        type: Date,
        class: ['min-width-12'],
      },
      { id: 'delaiMois', nom: 'Délai', type: Number },
    ],
  },
  'activites-statuts': {
    get: () => activitesStatuts,
    nom: 'Statuts des activités',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error'],
      },
    ],
  },
} as const

export type MetaIndexTable = keyof typeof metasIndex
