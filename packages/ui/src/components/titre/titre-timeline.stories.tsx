import { Meta, StoryFn } from '@storybook/vue3'
import { demarcheSlugValidator } from 'camino-common/src/demarche'
import { toCaminoDate } from 'camino-common/src/date'
import { vueRouter } from 'storybook-vue3-router'
import { Phase, TitreTimeline } from './titre-timeline'
import { titreSlugValidator } from 'camino-common/src/validators/titres'

const meta: Meta = {
  title: 'Components/Titre/Timeline',
  component: TitreTimeline,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' }), vueRouter([{ name: 'titre' }])],
}
export default meta
const defaultPhasesWithAlterations: Phase = [
  [
    {
      slug: demarcheSlugValidator.parse('slug-demarche2'),
      demarche_type_id: 'oct',
      demarche_date_debut: toCaminoDate('2019-01-01'),
      demarche_date_fin: toCaminoDate('2021-01-01'),
      events: [],
    },
  ],
  [
    {
      slug: demarcheSlugValidator.parse('slug-demarche3'),
      demarche_type_id: 'pro',
      demarche_date_debut: toCaminoDate('2021-01-01'),
      demarche_date_fin: toCaminoDate('2024-01-01'),
      events: [
        {
          slug: demarcheSlugValidator.parse('slug-demarche4'),
          demarche_type_id: 'mut',
          first_etape_date: toCaminoDate('2022-01-01'),
        },
        {
          slug: demarcheSlugValidator.parse('slug-travaux1'),
          demarche_type_id: 'aom',
          first_etape_date: toCaminoDate('2022-01-01'),
        },
      ],
    },
  ],
  [
    {
      slug: demarcheSlugValidator.parse('slug-demarche5'),
      demarche_type_id: 'pr2',
      demarche_date_debut: toCaminoDate('2024-01-01'),
      demarche_date_fin: toCaminoDate('2027-01-01'),
      events: [],
    },
  ],
]
export const Default: StoryFn = () => (
  <TitreTimeline titreSlug={titreSlugValidator.parse('slug-titre')} phasesWithAlterations={defaultPhasesWithAlterations} currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')} />
)
export const DefaultWithEventSelected: StoryFn = () => (
  <TitreTimeline titreSlug={titreSlugValidator.parse('slug-titre')} phasesWithAlterations={defaultPhasesWithAlterations} currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche4')} />
)
export const DefaultWithTravauxSelected: StoryFn = () => (
  <TitreTimeline titreSlug={titreSlugValidator.parse('slug-titre')} phasesWithAlterations={defaultPhasesWithAlterations} currentDemarcheSlug={demarcheSlugValidator.parse('slug-travaux1')} />
)

export const SimpleOnePhase: StoryFn = () => (
  <TitreTimeline
    titreSlug={titreSlugValidator.parse('slug-titre')}
    phasesWithAlterations={[
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche2'),
          demarche_type_id: 'oct',
          demarche_date_debut: toCaminoDate('2019-01-01'),
          demarche_date_fin: toCaminoDate('2021-01-01'),
          events: [],
        },
      ],
    ]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)

export const TwoPhases: StoryFn = () => (
  <TitreTimeline
    titreSlug={titreSlugValidator.parse('slug-titre')}
    phasesWithAlterations={[
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche2'),
          demarche_type_id: 'oct',
          demarche_date_debut: toCaminoDate('2019-01-01'),
          demarche_date_fin: toCaminoDate('2021-01-01'),
          events: [],
        },
      ],
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche3'),
          demarche_type_id: 'oct',
          demarche_date_debut: toCaminoDate('2021-01-01'),
          demarche_date_fin: toCaminoDate('2022-01-01'),
          events: [],
        },
      ],
    ]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)

export const MultipleUnorderedDemarchesWithoutPhase: StoryFn = () => (
  <TitreTimeline
    titreSlug={titreSlugValidator.parse('slug-titre')}
    phasesWithAlterations={[
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche2'),
          demarche_type_id: 'oct',
          demarche_date_debut: toCaminoDate('2019-01-01'),
          demarche_date_fin: toCaminoDate('2021-01-01'),
          events: [
            {
              slug: demarcheSlugValidator.parse('slug-demarche6'),
              demarche_type_id: 'pr2',
              first_etape_date: toCaminoDate('2020-01-02'),
            },
            {
              slug: demarcheSlugValidator.parse('slug-demarche5'),
              demarche_type_id: 'pro',
              first_etape_date: toCaminoDate('2019-02-01'),
            },
            {
              slug: demarcheSlugValidator.parse('slug-demarche6'),
              demarche_type_id: 'pr1',
              first_etape_date: toCaminoDate('2020-01-01'),
            },
          ],
        },
      ],
    ]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)

export const OnePhaseMultipleAlterations: StoryFn = () => (
  <TitreTimeline
    titreSlug={titreSlugValidator.parse('slug-titre')}
    phasesWithAlterations={[
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche2'),
          demarche_type_id: 'oct',
          demarche_date_debut: toCaminoDate('2020-01-01'),
          demarche_date_fin: toCaminoDate('2030-01-01'),
          events: [],
        },
        {
          slug: demarcheSlugValidator.parse('slug-demarche3'),
          demarche_type_id: 'mut',
          date_etape_decision_ok: toCaminoDate('2021-01-01'),
          events: [],
        },
        {
          slug: demarcheSlugValidator.parse('slug-demarche4'),
          demarche_type_id: 'mut',
          date_etape_decision_ok: toCaminoDate('2021-06-01'),
          events: [],
        },
      ],
    ]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)

export const BigExample: StoryFn = () => (
  <TitreTimeline
    titreSlug={titreSlugValidator.parse('slug-titre')}
    phasesWithAlterations={[
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche2'),
          demarche_type_id: 'oct',
          demarche_date_debut: toCaminoDate('2020-01-01'),
          demarche_date_fin: toCaminoDate('2030-01-01'),
          events: [
            {
              slug: demarcheSlugValidator.parse('slug-demarche8'),
              demarche_type_id: 'pr2',
              first_etape_date: toCaminoDate('2020-01-02'),
            },
            {
              slug: demarcheSlugValidator.parse('slug-travaux2'),
              demarche_type_id: 'aom',
              first_etape_date: toCaminoDate('2020-01-03'),
            },
          ],
        },
        {
          slug: demarcheSlugValidator.parse('slug-demarche3'),
          demarche_type_id: 'mut',
          date_etape_decision_ok: toCaminoDate('2021-01-01'),
          events: [
            {
              slug: demarcheSlugValidator.parse('slug-demarche9'),
              demarche_type_id: 'pro',
              first_etape_date: toCaminoDate('2021-02-01'),
            },
          ],
        },
        {
          slug: demarcheSlugValidator.parse('slug-demarche4'),
          demarche_type_id: 'mut',
          date_etape_decision_ok: toCaminoDate('2021-06-01'),
          events: [
            {
              slug: demarcheSlugValidator.parse('slug-travaux1'),
              demarche_type_id: 'aom',
              first_etape_date: toCaminoDate('2021-06-02'),
            },
          ],
        },
      ],
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche5'),
          demarche_type_id: 'pro',
          demarche_date_debut: toCaminoDate('2030-01-01'),
          demarche_date_fin: toCaminoDate('2050-01-01'),
          events: [
            {
              slug: demarcheSlugValidator.parse('slug-demarche10'),
              demarche_type_id: 'pr1',
              first_etape_date: toCaminoDate('2040-01-01'),
            },
          ],
        },
        {
          slug: demarcheSlugValidator.parse('slug-demarche7'),
          demarche_type_id: 'mut',
          date_etape_decision_ok: toCaminoDate('2043-06-01'),
          events: [],
        },
      ],
      [
        {
          slug: demarcheSlugValidator.parse('slug-demarche11'),
          demarche_type_id: 'pr2',
          demarche_date_debut: toCaminoDate('2050-01-01'),
          demarche_date_fin: toCaminoDate('2060-01-01'),
          events: [],
        },
      ],
    ]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)

export const OneDemarcheNoPhase: StoryFn = () => (
  <TitreTimeline
    titreSlug={titreSlugValidator.parse('slug-titre')}
    phasesWithAlterations={[[{ slug: demarcheSlugValidator.parse('slug-demarche11'), demarche_type_id: 'pr2', demarche_date_debut: null }]]}
    currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')}
  />
)

export const NoDemarcheNoPhase: StoryFn = () => (
  <TitreTimeline titreSlug={titreSlugValidator.parse('slug-titre')} phasesWithAlterations={[]} currentDemarcheSlug={demarcheSlugValidator.parse('slug-demarche2')} />
)
