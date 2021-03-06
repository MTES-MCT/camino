import {
  domaines,
  titresTypesTypes,
  titresStatuts,
  demarchesTypes,
  demarchesStatuts,
  etapesTypes,
  etapesStatuts,
  phasesStatuts,
  domaineModifier,
  titreTypeTypeModifier,
  titreStatutModifier,
  demarcheTypeModifier,
  demarcheStatutModifier,
  phaseStatutModifier,
  etapeTypeModifier,
  etapeStatutModifier,
  documentsTypes,
  documentTypeModifier,
  referencesTypes,
  referenceTypeModifier,
  titresTypes,
  titreTypeModifier,
  titreTypeCreer,
  titreTypeSupprimer,
  titresTypesTitresStatuts,
  titreTypeTitreStatutCreer,
  titreTypeTitreStatutSupprimer,
  titreTypeTitreStatutModifier,
  titresTypesDemarchesTypes,
  titreTypeDemarcheTypeModifier,
  titreTypeDemarcheTypeCreer,
  titreTypeDemarcheTypeSupprimer,
  titresTypesDemarchesTypesEtapesTypes,
  titreTypeDemarcheTypeEtapeTypeModifier,
  titreTypeDemarcheTypeEtapeTypeCreer,
  titreTypeDemarcheTypeEtapeTypeSupprimer,
  etapesTypesEtapesStatuts,
  etapeTypeEtapeStatutModifier,
  etapeTypeEtapeStatutCreer,
  etapeTypeEtapeStatutSupprimer,
  etapesTypesDocumentsTypes,
  etapeTypeDocumentTypeModifier,
  etapeTypeDocumentTypeCreer,
  etapeTypeDocumentTypeSupprimer,
  etapesTypesJustificatifsTypes,
  etapeTypeJustificatifTypeModifier,
  etapeTypeJustificatifTypeCreer,
  etapeTypeJustificatifTypeSupprimer,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeCreer,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeModifier,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeSupprimer,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreer,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeModifier,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeSupprimer,
  documentTypeCreer
} from '../api/metas'

import {
  activitesTypes,
  activiteTypeModifier,
  activitesStatuts,
  activiteStatutModifier,
  activitesTypesTitresTypes,
  activiteTypeTitreTypeModifier,
  activiteTypeTitreTypeCreer,
  activiteTypeTitreTypeSupprimer,
  activitesTypesDocumentsTypes,
  activiteTypeDocumentTypeModifier,
  activiteTypeDocumentTypeCreer,
  activiteTypeDocumentTypeSupprimer,
  activitesTypesPays,
  activiteTypePaysCreer,
  activiteTypePaysSupprimer
} from '../api/metas-activites'
import { PaysList } from 'camino-common/src/pays'

const labelGet = entity => (entity ? `${entity.id} - ${entity.nom}` : '')

const metasIndex = {
  domaines: {
    get: domaines,
    update: domaineModifier,
    labelGet,
    nom: 'Domaines',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String },
      { id: 'ordre', nom: 'Ordre', type: Number }
    ]
  },
  'titres-types-types': {
    get: titresTypesTypes,
    update: titreTypeTypeModifier,
    labelGet,
    nom: 'Types des titres',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      { id: 'ordre', nom: 'Ordre', type: Number }
    ]
  },
  'titres-types': {
    get: titresTypes,
    update: titreTypeModifier,
    create: titreTypeCreer,
    delete: titreTypeSupprimer,
    labelGet: titreType =>
      `${titreType.id} - ${titreType.type.nom}- ${titreType.domaine.nom} `,
    nom: 'Domaines | Types des titres',
    colonnes: [
      { id: 'id', nom: 'Id' },
      {
        id: 'domaineId',
        nom: 'Domaine',
        type: 'entities',
        entities: 'domaines'
      },
      {
        id: 'typeId',
        nom: 'Type',
        type: 'entities',
        entities: 'titres-types-types'
      },
      {
        id: 'contenuIds',
        nom: "Type d'??tape des propri??t??s",
        type: 'json',
        optional: true
      }
    ]
  },
  'titres-statuts': {
    get: titresStatuts,
    update: titreStatutModifier,
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
        elements: ['warning', 'neutral', 'success']
      },
      { id: 'ordre', nom: 'Ordre', type: Number }
    ]
  },
  'titre-types--titres-statuts': {
    get: titresTypesTitresStatuts,
    update: titreTypeTitreStatutModifier,
    create: titreTypeTitreStatutCreer,
    delete: titreTypeTitreStatutSupprimer,
    nom: 'Types des titres | Statuts des titres',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types'
      },
      {
        id: 'titreStatutId',
        nom: 'Statut de titre',
        type: 'entities',
        entities: 'titres-statuts'
      },
      { id: 'publicLecture', nom: 'Public', type: Boolean, optional: true }
    ],
    ids: ['titreTypeId', 'titreStatutId']
  },
  'demarches-types': {
    get: demarchesTypes,
    update: demarcheTypeModifier,
    labelGet,
    nom: 'Types des d??marches',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'ordre', nom: 'Ordre', type: Number },
      { id: 'description', nom: 'Description', type: String, optional: true },
      { id: 'duree', nom: 'Dur??e', type: Boolean, optional: true },
      { id: 'points', nom: 'Points', type: Boolean, optional: true },
      { id: 'substances', nom: 'Substances', type: Boolean, optional: true },
      { id: 'titulaires', nom: 'Titulaires', type: Boolean, optional: true },
      { id: 'exception', nom: 'Exception', type: Boolean, optional: true },
      {
        id: 'renouvelable',
        nom: 'Renouvelable',
        type: Boolean,
        optional: true
      },
      { id: 'travaux', nom: 'Travaux', type: Boolean, optional: true }
    ]
  },
  'titres-types--demarches-types': {
    get: titresTypesDemarchesTypes,
    update: titreTypeDemarcheTypeModifier,
    create: titreTypeDemarcheTypeCreer,
    delete: titreTypeDemarcheTypeSupprimer,
    nom: 'Types des titres | Types des d??marches',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types'
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de d??marche',
        type: 'entities',
        entities: 'demarches-types'
      },
      { id: 'dureeMax', nom: 'Dur??e maximale', type: Number, optional: true },
      {
        id: 'delaiImplicite',
        nom: 'D??lai implicite',
        type: Number,
        optional: true
      },
      {
        id: 'delaiRecours',
        nom: 'D??lai de recours',
        type: Number,
        optional: true
      },
      { id: 'legalRef', nom: 'R??f??rence l??gale', type: String, optional: true },
      {
        id: 'legalLien',
        nom: 'Lien de la r??f??rence l??gale',
        type: String,
        optional: true
      },
      { id: 'dateDebut', nom: 'Date de d??but', type: String, optional: true },
      { id: 'dateFin', nom: 'Date de fin', type: String, optional: true }
    ],
    ids: ['titreTypeId', 'demarcheTypeId']
  },
  'demarches-statuts': {
    get: demarchesStatuts,
    update: demarcheStatutModifier,
    nom: 'Statuts des d??marches',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error']
      },
      { id: 'ordre', nom: 'Ordre', type: Number }
    ]
  },
  'phases-statuts': {
    get: phasesStatuts,
    update: phaseStatutModifier,
    nom: 'Statuts des phases',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error']
      }
    ]
  },
  'etapes-types': {
    get: etapesTypes,
    update: etapeTypeModifier,
    labelGet,
    nom: 'Types des ??tapes',
    colonnes: [
      { id: 'id', nom: 'Id' },
      {
        id: 'parentId',
        nom: 'Id du type de l?????tape parent',
        type: String,
        optional: true
      },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      { id: 'ordre', nom: 'Ordre', type: Number },
      { id: 'sections', nom: 'Sections', type: 'json', optional: true },
      { id: 'legalLien', nom: 'Lien l??gal', type: String, optional: true },
      {
        id: 'dateDebut',
        nom: 'Date de d??but',
        type: Date,
        class: ['min-width-12'],
        optional: true
      },
      {
        id: 'dateFin',
        nom: 'Date de fin',
        type: Date,
        class: ['min-width-12'],
        optional: true
      },
      {
        id: 'fondamentale',
        nom: 'Fondamentale',
        type: Boolean,
        optional: true
      },
      { id: 'unique', nom: 'Unique', type: Boolean, optional: true },
      {
        id: 'acceptationAuto',
        nom: 'Acceptation auto',
        type: Boolean,
        optional: true
      },
      {
        id: 'publicLecture',
        nom: 'Lecture public',
        type: Boolean,
        optional: true
      },
      {
        id: 'entrepriseLecture',
        nom: 'Lecture entreprises',
        type: Boolean,
        optional: true
      }
    ]
  },
  'titres-types--demarches-types--etapes-types': {
    get: titresTypesDemarchesTypesEtapesTypes,
    update: titreTypeDemarcheTypeEtapeTypeModifier,
    create: titreTypeDemarcheTypeEtapeTypeCreer,
    delete: titreTypeDemarcheTypeEtapeTypeSupprimer,
    nom: 'Types des titres | Types des d??marches | types des ??tapes',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types'
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de d??marche',
        type: 'entities',
        entities: 'demarches-types'
      },
      {
        id: 'etapeTypeId',
        nom: "Type d'??tape",
        type: 'entities',
        entities: 'etapes-types'
      },
      { id: 'sections', nom: 'Sections', type: 'json', optional: true },
      { id: 'ordre', nom: 'Ordre', type: Number }
    ],
    ids: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId']
  },
  'titres-types--demarches-types--etapes-types--documents-types': {
    get: titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
    create: titreTypeDemarcheTypeEtapeTypeDocumentTypeCreer,
    update: titreTypeDemarcheTypeEtapeTypeDocumentTypeModifier,
    delete: titreTypeDemarcheTypeEtapeTypeDocumentTypeSupprimer,
    nom: 'Types des titres | Types des d??marches | Types des ??tapes | Types des documents',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types'
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de d??marche',
        type: 'entities',
        entities: 'demarches-types'
      },
      {
        id: 'etapeTypeId',
        nom: "Type d'??tape",
        type: 'entities',
        entities: 'etapes-types'
      },
      {
        id: 'documentTypeId',
        nom: 'Type de document',
        type: 'entities',
        entities: 'documents-types'
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true }
    ],
    ids: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId', 'documentTypeId']
  },
  'titres-types--demarches-types--etapes-types--justificatifs-types': {
    get: titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
    create: titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreer,
    update: titreTypeDemarcheTypeEtapeTypeJustificatifTypeModifier,
    delete: titreTypeDemarcheTypeEtapeTypeJustificatifTypeSupprimer,
    nom: 'Types des titres | Types des d??marches | Types des ??tapes | Types des justificatifs',
    colonnes: [
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types'
      },
      {
        id: 'demarcheTypeId',
        nom: 'Type de d??marche',
        type: 'entities',
        entities: 'demarches-types'
      },
      {
        id: 'etapeTypeId',
        nom: "Type d'??tape",
        type: 'entities',
        entities: 'etapes-types'
      },
      {
        id: 'documentTypeId',
        nom: 'Type de justificatif',
        type: 'entities',
        entities: 'documents-types'
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true }
    ],
    ids: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId', 'documentTypeId']
  },
  'etapes-statuts': {
    get: etapesStatuts,
    update: etapeStatutModifier,
    labelGet,
    nom: 'Statuts des ??tapes',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error']
      }
    ]
  },
  'etapes-types--etapes-statuts': {
    get: etapesTypesEtapesStatuts,
    update: etapeTypeEtapeStatutModifier,
    create: etapeTypeEtapeStatutCreer,
    delete: etapeTypeEtapeStatutSupprimer,
    nom: 'Types des ??tapes | Statuts des ??tapes',
    colonnes: [
      {
        id: 'etapeTypeId',
        nom: "Type d'??tape",
        type: 'entities',
        entities: 'etapes-types'
      },
      {
        id: 'etapeStatutId',
        nom: "Statut d'??tape",
        type: 'entities',
        entities: 'etapes-statuts'
      },
      { id: 'ordre', nom: 'Ordre', type: Number }
    ],
    ids: ['etapeTypeId', 'etapeStatutId']
  },
  'etapes-types--documents-types': {
    get: etapesTypesDocumentsTypes,
    update: etapeTypeDocumentTypeModifier,
    create: etapeTypeDocumentTypeCreer,
    delete: etapeTypeDocumentTypeSupprimer,
    nom: 'Types des ??tapes | Types des documents',
    colonnes: [
      {
        id: 'etapeTypeId',
        nom: "Type d'??tape",
        type: 'entities',
        entities: 'etapes-types'
      },
      {
        id: 'documentTypeId',
        nom: 'Type de documents',
        type: 'entities',
        entities: 'documents-types'
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true }
    ],
    ids: ['etapeTypeId', 'documentTypeId']
  },
  'etapes-types--justificatifs-types': {
    get: etapesTypesJustificatifsTypes,
    update: etapeTypeJustificatifTypeModifier,
    create: etapeTypeJustificatifTypeCreer,
    delete: etapeTypeJustificatifTypeSupprimer,
    nom: 'Types des ??tapes | Types des justificatifs',
    colonnes: [
      {
        id: 'etapeTypeId',
        nom: "Type d'??tape",
        type: 'entities',
        entities: 'etapes-types'
      },
      {
        id: 'documentTypeId',
        nom: 'Type de justificatifs',
        type: 'entities',
        entities: 'documents-types'
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true },
      { id: 'description', nom: 'Description', type: String, optional: true }
    ],
    ids: ['etapeTypeId', 'documentTypeId']
  },
  'documents-types': {
    get: documentsTypes,
    create: documentTypeCreer,
    update: documentTypeModifier,
    labelGet,
    nom: 'Types des documents',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      { id: 'description', nom: 'Description', type: String, optional: true }
    ]
  },
  'references-types': {
    get: referencesTypes,
    update: referenceTypeModifier,
    nom: 'Types des r??f??rences',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String }
    ]
  },
  'activites-types': {
    get: activitesTypes,
    update: activiteTypeModifier,
    labelGet,
    nom: 'Types des activit??s',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      {
        id: 'frequenceId',
        nom: 'Id la fr??quence',
        type: Array,
        elements: ['tri', 'ann', 'men']
      },
      { id: 'ordre', nom: 'Ordre', type: Number },
      {
        id: 'description',
        nom: 'Description',
        type: String,
        optional: true,
        class: ['min-width-12']
      },
      { id: 'sections', nom: 'Sections', type: 'json', optional: true },
      {
        id: 'dateDebut',
        nom: 'Date de d??but',
        type: Date,
        class: ['min-width-12']
      },
      { id: 'delaiMois', nom: 'D??lai', type: Number }
    ]
  },
  'activites-statuts': {
    get: activitesStatuts,
    update: activiteStatutModifier,
    nom: 'Statuts des activit??s',
    colonnes: [
      { id: 'id', nom: 'Id' },
      { id: 'nom', nom: 'Nom', type: String },
      {
        id: 'couleur',
        nom: 'Couleur',
        type: Array,
        elements: ['warning', 'neutral', 'success', 'error']
      }
    ]
  },

  'activites-types--titres-types': {
    get: activitesTypesTitresTypes,
    update: activiteTypeTitreTypeModifier,
    create: activiteTypeTitreTypeCreer,
    delete: activiteTypeTitreTypeSupprimer,
    nom: 'Types des activit??s | Types des titres',
    colonnes: [
      {
        id: 'activiteTypeId',
        nom: "Type d'activit??",
        type: 'entities',
        entities: 'activites-types'
      },
      {
        id: 'titreTypeId',
        nom: 'Type de titre',
        type: 'entities',
        entities: 'titres-types'
      }
    ],
    ids: ['activiteTypeId', 'titreTypeId']
  },

  'activites-types--documents-types': {
    get: activitesTypesDocumentsTypes,
    update: activiteTypeDocumentTypeModifier,
    create: activiteTypeDocumentTypeCreer,
    delete: activiteTypeDocumentTypeSupprimer,
    nom: 'Types des activit??s | Types des documents',
    colonnes: [
      {
        id: 'activiteTypeId',
        nom: "Type d'activit??",
        type: 'entities',
        entities: 'activites-types'
      },
      {
        id: 'documentTypeId',
        nom: 'Type de document',
        type: 'entities',
        entities: 'documents-types'
      },
      { id: 'optionnel', nom: 'Optionnel', type: Boolean, optional: true }
    ],
    ids: ['activiteTypeId', 'documentTypeId']
  },

  'activites-types--pays': {
    get: activitesTypesPays,
    create: activiteTypePaysCreer,
    delete: activiteTypePaysSupprimer,
    nom: 'Types des activit??s | Pays',
    colonnes: [
      {
        id: 'activiteTypeId',
        nom: "Type d'activit??",
        type: 'entities',
        entities: 'activites-types'
      },
      {
        id: 'paysId',
        nom: 'Pays',
        type: Array,
        elements: Object.keys(PaysList)
      }
    ],
    ids: ['activiteTypeId', 'paysId']
  },

  titre: {
    nom: 'Titre',
    linkName: 'meta-titre'
  },

  demarche: {
    nom: 'D??marche',
    linkName: 'meta-demarche'
  },

  etape: {
    nom: '??tape',
    linkName: 'meta-etape'
  },

  activite: {
    nom: 'Activit??',
    linkName: 'meta-activite'
  }
}

export default metasIndex
