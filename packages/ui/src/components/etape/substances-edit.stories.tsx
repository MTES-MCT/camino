import { action } from '@storybook/addon-actions'
import { SubstancesEdit, Props } from './substances-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'

const meta: Meta = {
  title: 'Components/Etape/SubstancesEdit',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: SubstancesEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const updateSubstancesAction = action('updateSubstances')
const updateHeritage = action('updateHeritage')

const heritageProps: Props['heritageSubstances'] = {
  actif: true,
  etape: {
    substances: [SubstancesLegale.auru.id, SubstancesLegale.arge.id],
    date: toCaminoDate('2020-01-01'),
    typeId: 'mfr',
  },
}
export const SansHeritage: StoryFn = () => (
  <SubstancesEdit
    substances={[SubstancesLegale.auru.id]}
    updateHeritage={updateHeritage}
    updateSubstances={updateSubstancesAction}
    domaineId="m"
    heritageSubstances={{ ...heritageProps, actif: false }}
  />
)

export const AvecHeritage: StoryFn = () => (
  <SubstancesEdit substances={[SubstancesLegale.auru.id]} updateHeritage={updateHeritage} updateSubstances={updateSubstancesAction} domaineId="m" heritageSubstances={{ ...heritageProps }} />
)

export const SansSubstance: StoryFn = () => (
  <SubstancesEdit substances={[]} updateHeritage={updateHeritage} updateSubstances={updateSubstancesAction} domaineId="m" heritageSubstances={{ actif: false }} />
)
