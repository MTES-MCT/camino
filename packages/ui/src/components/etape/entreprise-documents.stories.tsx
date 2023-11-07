import { Meta, StoryFn } from '@storybook/vue3'
import { entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { EntrepriseDocuments } from './entreprise-documents'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/EntrepriseDocuments',
  component: EntrepriseDocuments,
}
export default meta

export const Empty: StoryFn = () => (
  <div>
    <EntrepriseDocuments etapeEntrepriseDocuments={[]} />
  </div>
)

export const WithDocuments: StoryFn = () => (
  <EntrepriseDocuments
    etapeEntrepriseDocuments={[
      {
        id: entrepriseDocumentIdValidator.parse('id'),
        date: toCaminoDate('2023-01-01'),
        entreprise_document_type_id: 'atf',
        entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
        description: null,
      },
      {
        id: entrepriseDocumentIdValidator.parse('id2'),
        date: toCaminoDate('2023-03-01'),
        entreprise_document_type_id: 'bil',
        entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
        description: 'Une description',
      },
    ]}
  />
)
