import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { HeritageEdit } from './heritage-edit'
import { dateFormat, toCaminoDate } from 'camino-common/src/date'
import { DsfrInput } from '../_ui/dsfr-input'

const meta: Meta = {
  title: 'Components/Etape/HeritageEdit',
  // @ts-ignore
  component: HeritageEdit,
}
export default meta

const dateChangedAction = action('dateChanged')
const updateHeritage = action('updateHeritage')

export const HeritageDisabled: StoryFn = () => (
  <HeritageEdit
    updateHeritage={updateHeritage}
    hasHeritageValue={true}
    prop={{ value: null, heritee: false, etapeHeritee: { date: toCaminoDate('2024-01-01'), etapeTypeId: 'mfr', value: toCaminoDate('2022-01-01') } }}
    label="Date de début"
    write={() => <DsfrInput legend={{ main: '' }} type={{ type: 'date' }} valueChanged={dateChangedAction} class="mb-s" />}
    read={heritagePropEtape => <div class="border p-s mb-s bold">{heritagePropEtape?.value !== undefined ? dateFormat(heritagePropEtape.value) : 'Pas de date'}</div>}
  />
)

export const HeritageEnabled: StoryFn = () => (
  <HeritageEdit
    updateHeritage={updateHeritage}
    hasHeritageValue={true}
    prop={{ value: toCaminoDate('2022-01-01'), heritee: true, etapeHeritee: { date: toCaminoDate('2024-01-01'), etapeTypeId: 'mfr', value: toCaminoDate('2022-01-01') } }}
    label="Date de début"
    write={() => <DsfrInput legend={{ main: '' }} type={{ type: 'date' }} valueChanged={dateChangedAction} class="mb-s" />}
    read={heritagePropEtape => <div class="border p-s mb-s bold">{heritagePropEtape?.value !== undefined ? dateFormat(heritagePropEtape.value) : 'Pas de date'}</div>}
  />
)

export const HeritageEnabledWithoutValue: StoryFn = () => (
  <HeritageEdit
    updateHeritage={updateHeritage}
    hasHeritageValue={false}
    prop={{ value: toCaminoDate('2024-01-01'), heritee: true, etapeHeritee: { date: toCaminoDate('2024-01-01'), etapeTypeId: 'mfr', value: null } }}
    label="Date de début"
    write={() => <DsfrInput legend={{ main: '' }} type={{ type: 'date' }} valueChanged={dateChangedAction} class="mb-s" />}
    read={heritagePropEtape => <div class="border p-s mb-s bold">{heritagePropEtape?.value !== undefined ? dateFormat(heritagePropEtape.value) : 'Pas de date'}</div>}
  />
)

export const NoHeritage: StoryFn = () => (
  <HeritageEdit
    updateHeritage={updateHeritage}
    hasHeritageValue={false}
    prop={{ value: null, heritee: false, etapeHeritee: null }}
    label="Date de début"
    write={() => <DsfrInput legend={{ main: '' }} type={{ type: 'date' }} valueChanged={dateChangedAction} class="mb-s" />}
    read={() => <div class="border p-s mb-s bold">Pas de date</div>}
  />
)
