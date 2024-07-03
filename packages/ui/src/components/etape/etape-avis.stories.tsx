import { Meta, StoryFn } from '@storybook/vue3'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { caminoDateValidator } from 'camino-common/src/date'
import { EtapeAvisTable } from './etape-avis'
import { EtapeAvis, etapeAvisIdValidator } from 'camino-common/src/etape'
import { AvisVisibilityIds } from 'camino-common/src/static/avisTypes'

const meta: Meta = {
  title: 'Components/Etape/EtapeAvis',
  component: EtapeAvisTable,
}
export default meta

const avis: EtapeAvis[] = [
  {
    id: etapeAvisIdValidator.parse('id'),
    avis_type_id: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
    avis_statut_id: 'Favorable',
    avis_visibility_id: AvisVisibilityIds.TitulairesEtAdministrations,
    date: caminoDateValidator.parse('2023-01-01'),
    has_file: true,
    description: 'Une description',
  },
  {
    id: etapeAvisIdValidator.parse('id2'),
    avis_type_id: 'avisIFREMER',
    avis_statut_id: 'Défavorable',
    avis_visibility_id: AvisVisibilityIds.Administrations,
    date: caminoDateValidator.parse('2023-01-01'),
    has_file: false,
    description: 'Une description',
  },
  {
    id: etapeAvisIdValidator.parse('id2'),
    avis_type_id: 'avisParcNational',
    avis_statut_id: 'Favorable avec réserves',
    avis_visibility_id: AvisVisibilityIds.Public,
    date: caminoDateValidator.parse('2023-01-01'),
    has_file: false,
    description: '',
  },
]

export const Empty: StoryFn = () => (
  <div>
    <EtapeAvisTable etapeAvis={[]} user={null} />
  </div>
)
export const NotConnected: StoryFn = () => <EtapeAvisTable etapeAvis={avis} user={null} />
export const UserSuper: StoryFn = () => <EtapeAvisTable etapeAvis={avis} user={{ ...testBlankUser, role: 'super' }} />
export const UserAdministration: StoryFn = () => <EtapeAvisTable etapeAvis={avis} user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-mrae-guyane-01' }} />
export const UserEntreprise: StoryFn = () => <EtapeAvisTable etapeAvis={avis} user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('entrepriseId') }] }} />
