import { Meta, StoryFn } from '@storybook/vue3'
import { DemarcheTimeline } from '@/components/demarche/demarche-timeline'
import { demarcheSlugValidator } from 'camino-common/src/demarche'
import { toCaminoDate } from 'camino-common/src/date'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Demarche/Timeline',
  component: DemarcheTimeline,
  argTypes: {},
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' }), vueRouter([{ name: 'demarche' }])],
}
export default meta

export const Default: StoryFn = () => (
  <DemarcheTimeline
    demarches={[
      {
        slug: demarcheSlugValidator.parse('slug-demarche2'),
        demarche_type_id: 'oct',
        demarche_date_debut: toCaminoDate('2019-01-01'),
        demarche_date_fin: toCaminoDate('2021-01-01'),
        first_etape_date: null,
      },
      {
        slug: demarcheSlugValidator.parse('slug-demarche3'),
        demarche_type_id: 'pro',
        demarche_date_debut: toCaminoDate('2021-01-01'),
        demarche_date_fin: toCaminoDate('2024-01-01'),
        first_etape_date: null,
      },
      { slug: demarcheSlugValidator.parse('slug-demarche4'), demarche_type_id: 'mut', demarche_date_debut: null, demarche_date_fin: null, first_etape_date: toCaminoDate('2022-01-01') },
      {
        slug: demarcheSlugValidator.parse('slug-demarche5'),
        demarche_type_id: 'pr2',
        demarche_date_debut: toCaminoDate('2024-01-01'),
        demarche_date_fin: toCaminoDate('2027-01-01'),
        first_etape_date: null,
      },
      { slug: demarcheSlugValidator.parse('slug-demarche5'), demarche_type_id: 'pr2', demarche_date_debut: toCaminoDate('2027-01-01'), demarche_date_fin: null, first_etape_date: null },
    ]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)
