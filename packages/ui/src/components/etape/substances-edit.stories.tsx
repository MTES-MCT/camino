import { action } from '@storybook/addon-actions'
import { SubstancesEdit } from './substances-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { FlattenEtape } from 'camino-common/src/etape-form'

const meta: Meta = {
  title: 'Components/Etape/SubstancesEdit',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: SubstancesEdit,
}
export default meta

const updateSubstancesAction = action('updateSubstances')

const heritageProps: FlattenEtape['substances']['etapeHeritee'] = {
  value: [SubstancesLegale.auru.id, SubstancesLegale.arge.id],
  date: toCaminoDate('2020-01-01'),
  etapeTypeId: 'mfr',
}
export const SansHeritage: StoryFn = () => (
  <SubstancesEdit substances={{ value: [SubstancesLegale.auru.id], heritee: false, etapeHeritee: heritageProps }} updateSubstances={updateSubstancesAction} domaineId="m" />
)

export const AvecHeritage: StoryFn = () => (
  <SubstancesEdit substances={{ value: heritageProps.value, heritee: true, etapeHeritee: heritageProps }} updateSubstances={updateSubstancesAction} domaineId="m" />
)

export const SansSubstance: StoryFn = () => <SubstancesEdit substances={{ value: [], heritee: false, etapeHeritee: null }} updateSubstances={updateSubstancesAction} domaineId="m" />
