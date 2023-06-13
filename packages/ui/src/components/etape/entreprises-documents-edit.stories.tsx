import { Meta, StoryFn } from '@storybook/vue3'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import { action } from '@storybook/addon-actions'
import { EntrepriseDocument, entrepriseDocumentIdValidator, newEntrepriseId, toEntrepriseDocumentId } from 'camino-common/src/entreprise'
import { toCaminoDate } from 'camino-common/src/date'
import { z } from 'zod'
import { etapeIdValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Etape/EditionEntreprisesDocuments',
  component: EntrepriseDocumentsEdit,
  argTypes: {},
}
export default meta

const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const getEntrepriseDocumentsAction = action('getEntrepriseDocuments')
const completeUpdateAction = action('completeUpdate')
const getEtapeEntrepriseDocumentsAction = action('getEtapeEntrepriseDocuments')
export const Loading: StoryFn = () => (
  <EntrepriseDocumentsEdit
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toEntrepriseDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: () => new Promise(() => ({})),
      getEtapeEntrepriseDocuments: etapeId => {
        getEtapeEntrepriseDocumentsAction(etapeId)
        return Promise.resolve([])
      },
    }}
    etapeId={etapeIdValidator.parse('etapeId')}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'nom entreprise' }]}
    completeUpdate={completeUpdateAction}
  />
)

export const ArmUneEntrepriseSansDocumentDEntreprise: StoryFn = () => (
  <EntrepriseDocumentsEdit
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toEntrepriseDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: async id => {
        getEntrepriseDocumentsAction(id)
        const entrepriseDocuments: EntrepriseDocument[] = [
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jct', 'ueoau'),
            description: '',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jct',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-03'), 'atf', 'ueoau'),
            description: "Attestation sur l'honneur",
            date: toCaminoDate('2023-06-03'),
            entreprise_document_type_id: 'atf',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'cur', 'ueoau'),
            description: 'Jon. Doe',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'cur',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'eaoueo'),
            description: 'Jon. Doe',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jid',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'ueoau'),
            description: 'Arm. Strong',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jid',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'idm', 'ueoaue'),
            description: 'Facture pelle',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'idm',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-08'), 'kbi', 'ueoau'),
            description: '',
            date: toCaminoDate('2023-06-08'),
            entreprise_document_type_id: 'kbi',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jcf', 'uueoau'),
            description: '',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jcf',
            can_delete_document: false,
            entreprise_id: id,
          },
        ]
        return entrepriseDocuments
      },
      getEtapeEntrepriseDocuments: etapeId => {
        getEtapeEntrepriseDocumentsAction(etapeId)
        return Promise.resolve([])
      },
    }}
    etapeId={etapeIdValidator.parse('otherEtapeId')}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'nom entreprise' }]}
    completeUpdate={completeUpdateAction}
  />
)

export const ArmUneEntrepriseAvecDocumentDEntrepriseComplet: StoryFn = () => (
  <EntrepriseDocumentsEdit
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toEntrepriseDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: async id => {
        getEntrepriseDocumentsAction(id)
        const entrepriseDocuments: EntrepriseDocument[] = [
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jct', 'ueoau'),
            description: '',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jct',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-03'), 'atf', 'ueoau'),
            description: "Attestation sur l'honneur",
            date: toCaminoDate('2023-06-03'),
            entreprise_document_type_id: 'atf',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'cur', 'ueoau'),
            description: 'Jon. Doe',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'cur',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'eaoueo'),
            description: 'Jon. Doe',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jid',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'ueoau'),
            description: 'Arm. Strong',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jid',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'idm', 'ueoaue'),
            description: 'Facture pelle',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'idm',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-08'), 'kbi', 'ueoau'),
            description: '',
            date: toCaminoDate('2023-06-08'),
            entreprise_document_type_id: 'kbi',
            can_delete_document: false,
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jcf', 'uueoau'),
            description: '',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jcf',
            can_delete_document: false,
            entreprise_id: id,
          },
        ]
        return entrepriseDocuments
      },
      getEtapeEntrepriseDocuments: etapeId => {
        getEtapeEntrepriseDocumentsAction(etapeId)
        return Promise.resolve([
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'jct',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-jct-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-03'),
            description: null,
            entreprise_document_type_id: 'atf',
            id: entrepriseDocumentIdValidator.parse('2023-06-03-atf-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'cur',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-cur-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'jid',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-jid-eaoueo'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'idm',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-idm-ueoaue'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-08'),
            description: null,
            entreprise_document_type_id: 'kbi',
            id: entrepriseDocumentIdValidator.parse('2023-06-08-kbi-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'jcf',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-jcf-uueoau'),
          },
        ])
      },
    }}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'nom entreprise' }]}
    completeUpdate={completeUpdateAction}
    etapeId={etapeIdValidator.parse('hello')}
  />
)

export const AxmDeuxEntreprisesDocumentDEntrepriseComplet: StoryFn = () => (
  <EntrepriseDocumentsEdit
    tde={{ titreTypeId: 'axm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toEntrepriseDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: async id => {
        getEntrepriseDocumentsAction(id)
        if (id === 'id') {
          const entrepriseDocuments: EntrepriseDocument[] = [
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jct', 'ueoau'),
              description: '',
              date: toCaminoDate('2023-06-23'),
              entreprise_document_type_id: 'jct',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-03'), 'atf', 'ueoau'),
              description: "Attestation sur l'honneur",
              date: toCaminoDate('2023-06-03'),
              entreprise_document_type_id: 'atf',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'cur', 'ueoau'),
              description: 'Jon. Doe',
              date: toCaminoDate('2023-06-23'),
              entreprise_document_type_id: 'cur',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'eaoueo'),
              description: 'Jon. Doe',
              date: toCaminoDate('2023-06-23'),
              entreprise_document_type_id: 'jid',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'ueoau'),
              description: 'Arm. Strong',
              date: toCaminoDate('2023-06-23'),
              entreprise_document_type_id: 'jid',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'idm', 'ueoaue'),
              description: 'Facture pelle',
              date: toCaminoDate('2023-06-23'),
              entreprise_document_type_id: 'idm',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-08'), 'kbi', 'ueoau'),
              description: '',
              date: toCaminoDate('2023-06-08'),
              entreprise_document_type_id: 'kbi',
              can_delete_document: false,
              entreprise_id: id,
            },
            {
              id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jcf', 'uueoau'),
              description: '',
              date: toCaminoDate('2023-06-23'),
              entreprise_document_type_id: 'jcf',
              can_delete_document: false,
              entreprise_id: id,
            },
          ]
          return entrepriseDocuments
        }
        return []
      },
      getEtapeEntrepriseDocuments: etapeId => {
        getEtapeEntrepriseDocumentsAction(etapeId)
        return Promise.resolve([
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'jct',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-jct-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-03'),
            description: null,
            entreprise_document_type_id: 'atf',
            id: entrepriseDocumentIdValidator.parse('2023-06-03-atf-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'cur',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-cur-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'jid',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-jid-eaoueo'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'idm',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-idm-ueoaue'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-08'),
            description: null,
            entreprise_document_type_id: 'kbi',
            id: entrepriseDocumentIdValidator.parse('2023-06-08-kbi-ueoau'),
          },
          {
            entreprise_id: newEntrepriseId('id'),
            date: toCaminoDate('2023-06-23'),
            description: null,
            entreprise_document_type_id: 'jcf',
            id: entrepriseDocumentIdValidator.parse('2023-06-23-jcf-uueoau'),
          },
        ])
      },
    }}
    entreprises={[
      { id: newEntrepriseId('id'), nom: 'nom entreprise' },
      { id: newEntrepriseId('id2'), nom: 'Autre entreprise' },
    ]}
    completeUpdate={completeUpdateAction}
    etapeId={etapeIdValidator.parse('etapeIdAgain')}
  />
)
