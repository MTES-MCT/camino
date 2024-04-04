import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { HeritageEdit } from './heritage-edit'
import { dateFormat, toCaminoDate } from 'camino-common/src/date'
import { InputDate } from '../_ui/input-date'

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
    prop={{ actif: false, etape: { date: toCaminoDate('2024-01-01'), typeId: 'mfr', dateDebut: toCaminoDate('2022-01-01') } }}
    propId="dateDebut"
    write={() => <InputDate dateChanged={dateChangedAction} class="mb-s" />}
    read={heritagePropEtape => <div class="border p-s mb-s bold">{heritagePropEtape?.dateDebut !== undefined ? dateFormat(heritagePropEtape.dateDebut) : 'Pas de date'}</div>}
  />
)

export const HeritageEnabled: StoryFn = () => (
  <HeritageEdit
  updateHeritage={updateHeritage}

    prop={{ actif: true, etape: { date: toCaminoDate('2024-01-01'), typeId: 'mfr', dateDebut: toCaminoDate('2022-01-01') } }}
    propId="dateDebut"
    write={() => <InputDate dateChanged={dateChangedAction} class="mb-s" />}
    read={heritagePropEtape => <div class="border p-s mb-s bold">{heritagePropEtape?.dateDebut !== undefined ? dateFormat(heritagePropEtape.dateDebut) : 'Pas de date'}</div>}
  />
)

export const NoHeritage: StoryFn = () => (
  <HeritageEdit   updateHeritage={updateHeritage}   prop={{ actif: false }} propId="dateDebut" write={() => <InputDate dateChanged={dateChangedAction} class="mb-s" />} read={() => <div class="border p-s mb-s bold">Pas de date</div>} />
)
