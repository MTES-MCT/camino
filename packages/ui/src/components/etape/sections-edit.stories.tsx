import { SectionsEdit } from './sections-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/SectionsEdit',
  // @ts-ignore
  component: SectionsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],

}
export default meta

const completeUpdate = action('completeUpdate')

export const SansHeritage: StoryFn = () => (
  <SectionsEdit completeUpdate={completeUpdate} demarcheTypeId='oct' titreTypeId='arm' etape={{
    typeId: 'mfr',
    heritageContenu: {},
    contenu: {arm: {mecanise: true}}
  }} />
)

export const AvecHeritageActif: StoryFn = () => (
  <SectionsEdit completeUpdate={completeUpdate} demarcheTypeId='oct' titreTypeId='arm' etape={{
    typeId: 'mod',
    heritageContenu: {arm: {mecanise: {actif: true, etape: {
      typeId: 'mfr',
      date: toCaminoDate('2024-01-01'),
      contenu: {arm: {mecanise: true}}
    }},
    franchissements: {actif: true, etape: {
      typeId: 'mfr',
      date: toCaminoDate('2024-01-01'),
      contenu: {arm: {franchissements: 2}}
    }}
  }},
    contenu: {}
  }} />
)

export const AvecHeritage: StoryFn = () => (
  <SectionsEdit completeUpdate={completeUpdate} demarcheTypeId='oct' titreTypeId='arm' etape={{
    typeId: 'mod',
    heritageContenu: {arm: {mecanise: {actif: false, etape: {
      typeId: 'mfr',
      date: toCaminoDate('2024-01-01'),
      contenu: {arm: {mecanise: true}}
    }},
    franchissements: {actif: false, etape: {
      typeId: 'mfr',
      date: toCaminoDate('2024-01-01'),
      contenu: {arm: {franchissements: 2}}
    }}
  }},
    contenu: {arm: {mecanise: false}}
  }} />
)

