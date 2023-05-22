import { Meta, StoryFn } from '@storybook/vue3'
import { JustificatifsEdit } from './justificatifs-edit'
import { action } from '@storybook/addon-actions'
import { documentIdValidator, entrepriseDocumentValidator, newEntrepriseId, toDocumentId } from 'camino-common/src/entreprise'
import { toCaminoDate } from 'camino-common/src/date'
import { z } from 'zod'

const meta: Meta = {
  title: 'Components/Etape/EditionJustificatifs',
  component: JustificatifsEdit,
  argTypes: {},
}
export default meta

const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const getEntrepriseDocumentsAction = action('getEntrepriseDocuments')
const completeUpdateAction = action('completeUpdate')
export const Loading: StoryFn = () => (
  <JustificatifsEdit
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: () => new Promise(() => ({})),
    }}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'nom entreprise' }]}
    completeUpdate={completeUpdateAction}
    justificatifs={[]}
  />
)

export const ArmUneEntrepriseSansJustificatifs: StoryFn = () => (
  <JustificatifsEdit
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: async id => {
        getEntrepriseDocumentsAction(id)
        return z.array(entrepriseDocumentValidator).parse([
          { id: '2023-06-23-jct-ueoau', description: '', date: '2023-06-23', type_id: 'jct', can_delete_document: false },
          { id: '2023-06-03-atf-ueoau', description: "Attestation sur l'honneur", date: '2023-06-03', type_id: 'atf', can_delete_document: false },
          { id: '2023-06-23-cur-ueoau', description: 'Jon. Doe', date: '2023-06-23', type_id: 'cur', can_delete_document: false },
          { id: '2023-06-23-jid-eaoueo', description: 'Jon. Doe', date: '2023-06-23', type_id: 'jid', can_delete_document: false },
          { id: '2023-06-23-jid-ueoau', description: 'Arm. Strong', date: '2023-06-23', type_id: 'jid', can_delete_document: false },
          { id: '2023-06-23-idm-ueoaue', description: 'Facture pelle', date: '2023-06-23', type_id: 'idm', can_delete_document: false },
          { id: '2023-06-08-kbi-ueoau', description: '', date: '2023-06-08', type_id: 'kbi', can_delete_document: false },
          { id: '2023-06-23-jcf-uueoau', description: '', date: '2023-06-23', type_id: 'jcf', can_delete_document: false },
        ])
      },
    }}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'nom entreprise' }]}
    completeUpdate={completeUpdateAction}
    justificatifs={[]}
  />
)

export const ArmUneEntrepriseJustificatifsComplet: StoryFn = () => (
  <JustificatifsEdit
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: async id => {
        getEntrepriseDocumentsAction(id)
        return z.array(entrepriseDocumentValidator).parse([
          { id: '2023-06-23-jct-ueoau', description: '', date: '2023-06-23', type_id: 'jct', can_delete_document: false },
          { id: '2023-06-03-atf-ueoau', description: "Attestation sur l'honneur", date: '2023-06-03', type_id: 'atf', can_delete_document: false },
          { id: '2023-06-23-cur-ueoau', description: 'Jon. Doe', date: '2023-06-23', type_id: 'cur', can_delete_document: false },
          { id: '2023-06-23-jid-eaoueo', description: 'Jon. Doe', date: '2023-06-23', type_id: 'jid', can_delete_document: false },
          { id: '2023-06-23-jid-ueoau', description: 'Arm. Strong', date: '2023-06-23', type_id: 'jid', can_delete_document: false },
          { id: '2023-06-23-idm-ueoaue', description: 'Facture pelle', date: '2023-06-23', type_id: 'idm', can_delete_document: false },
          { id: '2023-06-08-kbi-ueoau', description: '', date: '2023-06-08', type_id: 'kbi', can_delete_document: false },
          { id: '2023-06-23-jcf-uueoau', description: '', date: '2023-06-23', type_id: 'jcf', can_delete_document: false },
        ])
      },
    }}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'nom entreprise' }]}
    completeUpdate={completeUpdateAction}
    justificatifs={[
      { id: documentIdValidator.parse('2023-06-23-jct-ueoau') },
      { id: documentIdValidator.parse('2023-06-03-atf-ueoau') },
      { id: documentIdValidator.parse('2023-06-23-cur-ueoau') },
      { id: documentIdValidator.parse('2023-06-23-jid-eaoueo') },
      { id: documentIdValidator.parse('2023-06-23-idm-ueoaue') },
      { id: documentIdValidator.parse('2023-06-08-kbi-ueoau') },
      { id: documentIdValidator.parse('2023-06-23-jcf-uueoau') },
    ]}
  />
)

export const AxmDeuxEntreprisesJustificatifsComplet: StoryFn = () => (
  <JustificatifsEdit
    tde={{ titreTypeId: 'axm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    apiClient={{
      creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
        creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput)
        return toDocumentId(toCaminoDate('2023-05-17'), 'arm', 'hash')
      },

      getEntrepriseDocuments: async id => {
        getEntrepriseDocumentsAction(id)
        if (id === 'id') {
          return z.array(entrepriseDocumentValidator).parse([
            { id: '2023-06-23-jct-ueoau', description: '', date: '2023-06-23', type_id: 'jct', can_delete_document: false },
            { id: '2023-06-03-atf-ueoau', description: "Attestation sur l'honneur", date: '2023-06-03', type_id: 'atf', can_delete_document: false },
            { id: '2023-06-23-cur-ueoau', description: 'Jon. Doe', date: '2023-06-23', type_id: 'cur', can_delete_document: false },
            { id: '2023-06-23-jid-eaoueo', description: 'Jon. Doe', date: '2023-06-23', type_id: 'jid', can_delete_document: false },
            { id: '2023-06-23-jid-ueoau', description: 'Arm. Strong', date: '2023-06-23', type_id: 'jid', can_delete_document: false },
            { id: '2023-06-23-idm-ueoaue', description: 'Facture pelle', date: '2023-06-23', type_id: 'idm', can_delete_document: false },
            { id: '2023-06-08-kbi-ueoau', description: '', date: '2023-06-08', type_id: 'kbi', can_delete_document: false },
            { id: '2023-06-23-jcf-uueoau', description: '', date: '2023-06-23', type_id: 'jcf', can_delete_document: false },
          ])
        }
        return []
      },
    }}
    entreprises={[
      { id: newEntrepriseId('id'), nom: 'nom entreprise' },
      { id: newEntrepriseId('id2'), nom: 'Autre entreprise' },
    ]}
    completeUpdate={completeUpdateAction}
    justificatifs={[
      { id: documentIdValidator.parse('2023-06-23-jct-ueoau') },
      { id: documentIdValidator.parse('2023-06-03-atf-ueoau') },
      { id: documentIdValidator.parse('2023-06-23-cur-ueoau') },
      { id: documentIdValidator.parse('2023-06-23-jid-eaoueo') },
      { id: documentIdValidator.parse('2023-06-23-idm-ueoaue') },
      { id: documentIdValidator.parse('2023-06-08-kbi-ueoau') },
      { id: documentIdValidator.parse('2023-06-23-jcf-uueoau') },
    ]}
  />
)
