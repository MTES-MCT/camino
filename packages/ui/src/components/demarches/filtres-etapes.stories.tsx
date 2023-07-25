import { Meta, StoryFn } from '@storybook/vue3'
import { FiltresEtapes } from './filtres-etapes'
import { action } from '@storybook/addon-actions'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Demarches/FiltresEtapes',
  // @ts-ignore
  component: FiltresEtapes,
}
export default meta

export const DefaultNoValues: StoryFn = () => <FiltresEtapes filter="etapesExclues" initialValues={[]} valuesSelected={action('valuesSelected')} />
export const PartialOneValue: StoryFn = () => (
  <FiltresEtapes filter="etapesExclues" initialValues={[{ typeId: 'mfr', statutId: 'fai', dateDebut: null, dateFin: null }]} valuesSelected={action('valuesSelected')} />
)

export const Multiple: StoryFn = () => (
  <FiltresEtapes
    filter="etapesExclues"
    initialValues={[
      { typeId: 'mfr', statutId: 'fai', dateDebut: toCaminoDate('2022-01-01'), dateFin: toCaminoDate('2022-03-03') },
      { typeId: 'mdp', statutId: 'fai', dateDebut: toCaminoDate('2024-01-01'), dateFin: toCaminoDate('2025-03-03') },
    ]}
    valuesSelected={action('valuesSelected')}
  />
)
