import { vueRouter } from 'storybook-vue3-router'
import { Meta, StoryFn } from '@storybook/vue3'
import { demarcheSlugValidator } from 'camino-common/src/demarche'
import { TitrePhasesTable } from './titre-phases-table'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Titre/Phases',
  // @ts-ignore en attendant du support par @storybook/vue3
  component: TitrePhasesTable,
  decorators: [vueRouter([{ name: 'demarche' }])],
}
export default meta

export const Default: StoryFn = () => (
  <TitrePhasesTable
    phases={[
      { slug: demarcheSlugValidator.parse('slug-demarche1'), demarche_type_id: 'amo', demarche_date_debut: toCaminoDate('2021-01-01'), demarche_date_fin: toCaminoDate('2023-01-01') },
      { slug: demarcheSlugValidator.parse('slug-demarche2'), demarche_type_id: 'oct', demarche_date_debut: toCaminoDate('2019-01-01'), demarche_date_fin: toCaminoDate('2021-01-01') },
      { slug: demarcheSlugValidator.parse('slug-demarche3'), demarche_type_id: 'pro', demarche_date_debut: toCaminoDate('2023-01-01'), demarche_date_fin: null },
    ]}
    currentPhaseSlug={null}
  />
)

export const AvecUnePhaseSansDate: StoryFn = () => (
  <TitrePhasesTable
    phases={[
      { slug: demarcheSlugValidator.parse('slug-demarche2'), demarche_type_id: 'oct', demarche_date_debut: toCaminoDate('2019-01-01'), demarche_date_fin: toCaminoDate('2021-01-01') },
      { slug: demarcheSlugValidator.parse('slug-demarche3'), demarche_type_id: 'pro', demarche_date_debut: null, demarche_date_fin: null },
    ]}
    currentPhaseSlug={null}
  />
)

export const AvecUnePhaseSelectionnee: StoryFn = () => (
  <TitrePhasesTable
    phases={[
      { slug: demarcheSlugValidator.parse('slug-demarche2'), demarche_type_id: 'oct', demarche_date_debut: toCaminoDate('2019-01-01'), demarche_date_fin: toCaminoDate('2021-01-01') },
      { slug: demarcheSlugValidator.parse('slug-demarche3'), demarche_type_id: 'pro', demarche_date_debut: null, demarche_date_fin: null },
    ]}
    currentPhaseSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)
