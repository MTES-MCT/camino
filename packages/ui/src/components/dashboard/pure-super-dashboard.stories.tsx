import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { PureSuperDashboard } from './pure-super-dashboard'
import { SuperTitre } from 'camino-common/src/titres'
import { demarcheSlugValidator } from 'camino-common/src/demarche'
import { caminoDateValidator } from 'camino-common/src/date'
import { etapeSlugValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Dashboard/Super',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureSuperDashboard,
}
export default meta

const titres: SuperTitre[] = [
  {
    titre_nom: 'Aachen',
    titre_slug: titreSlugValidator.parse('m-cx-aachen-1810'),
    titre_type_id: 'cxm',
    titre_statut_id: 'ech',
    demarche_slug: demarcheSlugValidator.parse('m-cx-aachen-1810-oct01'),
    demarche_type_id: 'oct',
    etape_date: caminoDateValidator.parse('1810-01-01'),
    etape_slug: etapeSlugValidator.parse('m-cx-aachen-1810-oct01-mfr01'),
    etape_type_id: 'mfr',
  },
  {
    titre_nom: 'Amadis 5',
    titre_slug: titreSlugValidator.parse('m-ax-amadis-5-2022'),
    titre_type_id: 'pxg',
    titre_statut_id: 'val',
    demarche_slug: demarcheSlugValidator.parse('m-ax-amadis-5-2022-oct01'),
    demarche_type_id: 'oct',
    etape_date: caminoDateValidator.parse('2022-01-01'),
    etape_slug: etapeSlugValidator.parse('m-ax-amadis-5-2022-oct01-mfr01'),
    etape_type_id: 'asc',
  },
]

export const TableauVide: StoryFn = () => <PureSuperDashboard user={{ role: 'super', ...testBlankUser }} apiClient={{ getTitresAvecEtapeEnBrouillon: () => Promise.resolve([]) }} />
export const TableauPlein: StoryFn = () => <PureSuperDashboard user={{ role: 'super', ...testBlankUser }} apiClient={{ getTitresAvecEtapeEnBrouillon: () => Promise.resolve(titres) }} />
export const Loading: StoryFn = () => <PureSuperDashboard user={{ role: 'super', ...testBlankUser }} apiClient={{ getTitresAvecEtapeEnBrouillon: () => new Promise<SuperTitre[]>(_resolve => {}) }} />

export const WithError: StoryFn = () => (
  <PureSuperDashboard user={{ role: 'super', ...testBlankUser }} apiClient={{ getTitresAvecEtapeEnBrouillon: () => Promise.resolve({ message: 'Une erreur' }) }} />
)
