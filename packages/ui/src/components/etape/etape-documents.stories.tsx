import { Meta, StoryFn } from '@storybook/vue3'
import { documentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { EtapeDocuments } from './etape-documents'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { EtapeDocument } from 'camino-common/src/etape'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Etape/EtapeDocuments',
  component: EtapeDocuments,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' }), vueRouter([{ name: 'entreprise' }])],
}
export default meta

const documents: EtapeDocument[] = [
  {
    id: documentIdValidator.parse('id'),
    document_type_id: 'atf',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'bil',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'bil',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
]

export const Empty: StoryFn = () => <EtapeDocuments etapeDocuments={[]} user={null} />
export const NotConnected: StoryFn = () => <EtapeDocuments etapeDocuments={documents} user={null} />
export const UserSuper: StoryFn = () => <EtapeDocuments etapeDocuments={documents} user={{ ...testBlankUser, role: 'super' }} />
export const UserAdministration: StoryFn = () => <EtapeDocuments etapeDocuments={documents} user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-mrae-guyane-01' }} />
export const UserEntreprise: StoryFn = () => (
  <EtapeDocuments etapeDocuments={documents} user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('entrepriseId') }] }} />
)
