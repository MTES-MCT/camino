import { Meta, StoryFn } from '@storybook/vue3'
import { Entreprise, EtapeEntrepriseDocument, entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { EtapeDocuments } from './etape-documents'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { EtapeDocument, etapeDocumentIdValidator } from 'camino-common/src/etape'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/EtapeDocuments',
  component: EtapeDocuments,
}
export default meta

const documents: EtapeDocument[] = [
  {
    id: etapeDocumentIdValidator.parse('id'),
    etape_document_type_id: 'atf',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: etapeDocumentIdValidator.parse('id2'),
    etape_document_type_id: 'bil',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: etapeDocumentIdValidator.parse('id2'),
    etape_document_type_id: 'bil',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
  {
    id: etapeDocumentIdValidator.parse('idAutre'),
    etape_document_type_id: 'aut',
    description: 'description document',
    public_lecture: false,
    entreprises_lecture: true,
  },
]

const titulaireId1 = entrepriseIdValidator.parse('titulaire1')
const titulaireId2 = entrepriseIdValidator.parse('titulaire2')
const entreprises: Entreprise[] = [
  {
    id: titulaireId1,
    nom: 'Entreprise 1',
    legal_siren: '',
  },
  {
    id: titulaireId2,
    nom: 'Une autre entreprise',
    legal_siren: '',
  },
]

const entrepriseDocuments: EtapeEntrepriseDocument[] = [
  {
    id: entrepriseDocumentIdValidator.parse('id'),
    date: toCaminoDate('2023-01-01'),
    entreprise_document_type_id: 'atf',
    entreprise_id: titulaireId1,
    description: null,
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: 'bil',
    entreprise_id: titulaireId1,
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: 'bil',
    entreprise_id: entrepriseIdValidator.parse('titulaire2'),
    description: 'Une description',
  },
]

export const Empty: StoryFn = () => (
  <div>
    <EtapeDocuments etapeDocuments={[]} entrepriseDocuments={[]} entreprises={entreprises} user={null} />
  </div>
)
export const NotConnected: StoryFn = () => <EtapeDocuments etapeDocuments={documents} entrepriseDocuments={[]} entreprises={entreprises} user={null} />
export const UserSuper: StoryFn = () => <EtapeDocuments etapeDocuments={documents} entrepriseDocuments={entrepriseDocuments} entreprises={entreprises} user={{ ...testBlankUser, role: 'super' }} />
export const UserAdministration: StoryFn = () => (
  <EtapeDocuments etapeDocuments={documents} entrepriseDocuments={entrepriseDocuments} entreprises={entreprises} user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-mrae-guyane-01' }} />
)
export const UserEntreprise: StoryFn = () => (
  <EtapeDocuments
    etapeDocuments={documents}
    entrepriseDocuments={entrepriseDocuments}
    entreprises={entreprises}
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('entrepriseId') }] }}
  />
)
