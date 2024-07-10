import { PureEntreprise } from './entreprise'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { Entreprise, EntrepriseDocument, EntrepriseType, entrepriseIdValidator, newEntrepriseId, toEntrepriseDocumentId, entrepriseEtablissementIdValidator } from 'camino-common/src/entreprise'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ApiClient } from '@/api/api-client'
import { CaminoHttpError } from '@/api/client-rest'
import { HTTP_STATUS } from 'camino-common/src/http'

const meta: Meta = {
  title: 'Components/Entreprise',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureEntreprise,
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
  id: newEntrepriseId('anotherEntrepriseId'),
  nom: 'nom entreprise',
  telephone: 'telephone',
  email: 'email@entreprise.fr',
  legal_siren: 'siren',
  legal_forme: 'forme',
  adresse: 'adresse',
  code_postal: 'code postal',
  commune: 'commune',
  url: 'http://urlentreprise',
  archive: false,
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

    return Promise.reject(new CaminoHttpError('because reasons', HTTP_STATUS.FORBIDDEN))
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

const entreprises: Entreprise[] = [
  {
    id: entrepriseIdValidator.parse(''),
    nom: 'Nom entreprise',
    legal_siren: '',
  },
  {
    id: entrepriseIdValidator.parse('entrepriseId'),
    nom: 'Nom entreprise',
    legal_siren: '',
  },
]

export const Loading: StoryFn = () => (
  <PureEntreprise currentYear={annee} entrepriseId={entreprise.id} apiClient={{ ...apiClient, getEntreprise: () => new Promise(() => ({})) }} user={null} entreprises={entreprises} />
)

export const NonConnecte: StoryFn = () => <PureEntreprise currentYear={annee} entrepriseId={entreprise.id} apiClient={apiClient} user={null} entreprises={entreprises} />

const completeEntreprise: EntrepriseType = {
  id: newEntrepriseId('fr-entrepriseIdAny'),
  nom: 'An Entreprise',
  legal_siren: 'SIREN',
  legal_forme: 'SAS, société par actions simplifiée',
  adresse: '21 par ici',
  code_postal: '38240',
  commune: 'CETTE COMMUNE',
  email: 'email',
  telephone: 'telephone',
  url: 'url',
  archive: false,
  etablissements: [
    {
      id: entrepriseEtablissementIdValidator.parse(''),
      nom: 'Nouvel établissement',
      date_debut: toCaminoDate('2013-09-16'),
      date_fin: null,
    },
    {
      id: entrepriseEtablissementIdValidator.parse(''),
      nom: 'Ancien établissement',
      date_debut: toCaminoDate('2013-02-01'),
      date_fin: toCaminoDate('2013-09-15'),
    },
  ],
}

export const Complet: StoryFn = () => (
  <PureEntreprise
    currentYear={annee}
    entrepriseId={completeEntreprise.id}
    entreprises={entreprises}
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
