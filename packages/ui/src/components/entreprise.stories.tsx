import { PureEntreprise } from './entreprise'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { Entreprise, EntrepriseDocument, EntrepriseType, entrepriseIdValidator, newEntrepriseId, toEntrepriseDocumentId } from 'camino-common/src/entreprise'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toCommuneId } from 'camino-common/src/static/communes'
import { toUtilisateurId } from 'camino-common/src/roles'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { vueRouter } from 'storybook-vue3-router'
import { ApiClient } from '@/api/api-client'

const meta: Meta = {
  title: 'Components/Entreprise',
  component: PureEntreprise,
  decorators: [
    vueRouter([
      { name: 'utilisateur', params: { id: 'anotherId' } },
      { name: 'titre', params: { id: 'slugTitre1' } },
    ]),
  ],
}
export default meta

const getFiscaliteEntrepriseAction = action('getFiscaliteEntreprise')
const modifierEntrepriseAction = action('modifierEntreprise')
const creerEntrepriseAction = action('creerEntreprise')
const getEntrepriseDocumentsAction = action('getEntrepriseDocuments')
const getEntrepriseAction = action('getEntreprise')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const deleteEntrepriseDocumentAction = action('deleteEntrepriseDocument')
const uploadTempDocumentAction = action('uploadTempDocumentAction')

const annee = toCaminoAnnee('2023')

const entrepriseDocuments: EntrepriseDocument[] = [
  {
    id: toEntrepriseDocumentId(toCaminoDate('2019-08-26'), 'kbi', '12345678'),
    entreprise_document_type_id: 'kbi',
    date: toCaminoDate('2019-08-26'),
    description: 'Kbis',
    can_delete_document: true,
    entreprise_id: newEntrepriseId(''),
  },
  {
    id: toEntrepriseDocumentId(toCaminoDate('2019-08-26'), 'idm', '12345678'),
    entreprise_document_type_id: 'idm',
    date: toCaminoDate('2019-08-26'),
    description: 'Identification pelle mécanique',
    can_delete_document: false,
    entreprise_id: newEntrepriseId(''),
  },
]
const entreprise: EntrepriseType = {
  id: newEntrepriseId(''),
  nom: 'nom entreprise',
  telephone: 'telephone',
  email: 'email@entreprise.fr',
  legal_siren: 'siren',
  legalForme: 'forme',
  adresse: 'adresse',
  codePostal: 'code postal',
  commune: 'commune',
  url: 'http://urlentreprise',
  archive: false,
  titulaireTitres: [],
  amodiataireTitres: [],
  utilisateurs: [],
  etablissements: [],
}

const apiClient: Pick<
  ApiClient,
  'getEntreprise' | 'deleteEntrepriseDocument' | 'getEntrepriseDocuments' | 'getFiscaliteEntreprise' | 'modifierEntreprise' | 'creerEntreprise' | 'creerEntrepriseDocument' | 'uploadTempDocument'
> = {
  getEntreprise: entrepriseId => {
    getEntrepriseAction(entrepriseId)

    return Promise.resolve(entreprise)
  },
  deleteEntrepriseDocument(entrepriseId, documentId) {
    deleteEntrepriseDocumentAction(entrepriseId, documentId)

    return Promise.resolve()
  },
  getEntrepriseDocuments: entrepriseId => {
    getEntrepriseDocumentsAction(entrepriseId)

    return Promise.resolve(entrepriseDocuments)
  },
  getFiscaliteEntreprise: data => {
    getFiscaliteEntrepriseAction(data)

    return Promise.resolve({
      redevanceCommunale: 0,
      redevanceDepartementale: 0,
    })
  },
  modifierEntreprise: entreprise => {
    modifierEntrepriseAction(entreprise)

    return Promise.resolve()
  },
  creerEntreprise: siren => {
    creerEntrepriseAction(siren)

    return Promise.resolve()
  },
  creerEntrepriseDocument: (entrepriseId, document) => {
    creerEntrepriseDocumentAction(entrepriseId, document)

    return Promise.resolve(toEntrepriseDocumentId(document.date, document.typeId, '12345678'))
  },
  uploadTempDocument: document => {
    uploadTempDocumentAction(document)

    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
}

export const Loading: StoryFn = () => <PureEntreprise currentYear={annee} entrepriseId={entreprise.id} apiClient={{ ...apiClient, getEntreprise: () => new Promise(() => ({})) }} user={null} />

export const NonConnecte: StoryFn = () => <PureEntreprise currentYear={annee} entrepriseId={entreprise.id} apiClient={apiClient} user={null} />

const completeEntreprise: EntrepriseType = {
  id: newEntrepriseId('any'),
  nom: 'An Entreprise',
  legal_siren: 'SIREN',
  legalForme: 'SAS, société par actions simplifiée',
  adresse: '21 par ici',
  codePostal: '38240',
  commune: 'CETTE COMUNE',
  email: 'email',
  telephone: 'telephone',
  url: 'url',
  archive: false,
  etablissements: [
    {
      id: '',
      nom: 'Nouvel établissement',
      dateDebut: toCaminoDate('2013-09-16'),
      dateFin: null,
    },
    {
      id: '',
      nom: 'Ancien établissement',
      dateDebut: toCaminoDate('2013-02-01'),
      dateFin: toCaminoDate('2013-09-15'),
    },
  ],
  utilisateurs: [
    {
      id: toUtilisateurId('anId'),
      nom: 'Nom user',
      prenom: 'Prénon',
      email: 'email@plop.wu',
      entreprises: [
        {
          id: newEntrepriseId('1'),
          nom: 'Nom entreprise',
        },
      ] as Entreprise[],
      role: 'entreprise',
    },
    {
      id: toUtilisateurId('anotherId'),
      nom: 'Other user',
      prenom: 'Other prenom',
      email: 'anotheremail@nothing.wu',
      entreprises: [
        {
          id: 'fr-791652399',
          nom: 'Nom entreprise',
        },
      ] as Entreprise[],
      role: 'entreprise',
    },
  ],
  titulaireTitres: [
    {
      id: titreIdValidator.parse('idTitre1'),
      slug: 'slugTitre1',
      nom: 'titre 1 nom',
      typeId: 'arm',
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: null,
      activitesAbsentes: null,
      titulaires: [
        {
          id: entrepriseIdValidator.parse(''),
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          id: toCommuneId('97300'),
        },
      ],
    },
    {
      id: titreIdValidator.parse('idTitre2'),
      slug: 'slugtitre',
      nom: 'NomTitre',
      typeId: 'axm',
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: 0,
      activitesAbsentes: 0,
      titulaires: [
        {
          id: entrepriseIdValidator.parse('entrepriseId'),
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          id: toCommuneId('97300'),
        },
      ],
      references: [
        {
          referenceTypeId: 'dea',
          nom: 'plop/toto',
        },
      ],
    },
    {
      id: titreIdValidator.parse('idTitre3'),
      slug: 'slug3',
      nom: 'Nom titre 3',
      typeId: 'arm',
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: null,
      activitesAbsentes: null,
      titulaires: [
        {
          id: entrepriseIdValidator.parse('idEntreprise'),
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          id: toCommuneId('97300'),
        },
      ],
    },
  ],
  amodiataireTitres: [
    {
      id: titreIdValidator.parse('idTitre3'),
      slug: 'slug3',
      nom: 'Nom titre 3',
      typeId: 'arm',
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: null,
      activitesAbsentes: null,
      titulaires: [
        {
          id: entrepriseIdValidator.parse('idEntreprise'),
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          id: toCommuneId('97300'),
        },
      ],
    },
  ],
}

export const Complet: StoryFn = () => (
  <PureEntreprise
    currentYear={annee}
    entrepriseId={completeEntreprise.id}
    apiClient={{
      ...apiClient,
      getEntreprise: entrepriseId => {
        getEntrepriseAction(entrepriseId)

        return Promise.resolve(completeEntreprise)
      },
      getFiscaliteEntreprise: data => {
        getFiscaliteEntrepriseAction(data)

        return Promise.resolve({
          guyane: {
            taxeAurifere: 12,
            taxeAurifereBrute: 38,
            totalInvestissementsDeduits: 1,
          },
          redevanceCommunale: 200,
          redevanceDepartementale: 78,
        })
      },
    }}
    user={{ role: 'super', ...testBlankUser }}
  />
)
