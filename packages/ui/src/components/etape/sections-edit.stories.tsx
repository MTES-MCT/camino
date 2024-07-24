import { SectionsEdit } from './sections-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/SectionsEdit',
  // @ts-ignore
  component: SectionsEdit,
}
export default meta

const completeUpdate = action('completeUpdate')

export const SansHeritage: StoryFn = () => (
  <SectionsEdit
    completeUpdate={completeUpdate}
    demarcheTypeId="oct"
    titreTypeId="arm"
    etape={{
      typeId: 'mfr',
      contenu: { arm: { mecanise: { value: true, heritee: false, etapeHeritee: null }, franchissements: { value: null, heritee: false, etapeHeritee: null } } },
      date: toCaminoDate('2024-01-01'),
    }}
  />
)

export const AvecHeritageActif: StoryFn = () => (
  <SectionsEdit
    completeUpdate={completeUpdate}
    demarcheTypeId="oct"
    titreTypeId="arm"
    etape={{
      date: toCaminoDate('2024-01-01'),
      typeId: 'mod',
      contenu: {
        arm: {
          mecanise: { value: true, heritee: true, etapeHeritee: { etapeTypeId: 'mfr', date: toCaminoDate('2024-01-01'), value: true } },
          franchissements: { value: 2, heritee: true, etapeHeritee: { etapeTypeId: 'mfr', date: toCaminoDate('2024-01-01'), value: 2 } },
        },
      },
    }}
  />
)

export const AvecHeritage: StoryFn = () => (
  <SectionsEdit
    completeUpdate={completeUpdate}
    demarcheTypeId="oct"
    titreTypeId="arm"
    etape={{
      date: toCaminoDate('2024-01-01'),
      typeId: 'mod',
      contenu: {
        arm: {
          mecanise: { value: false, heritee: false, etapeHeritee: { etapeTypeId: 'mfr', date: toCaminoDate('2024-01-01'), value: true } },
          franchissements: { value: null, heritee: false, etapeHeritee: { etapeTypeId: 'mfr', date: toCaminoDate('2024-01-01'), value: 2 } },
        },
      },
    }}
  />
)

export const DecisionJorf: StoryFn = () => (
  <SectionsEdit
    completeUpdate={completeUpdate}
    demarcheTypeId="pro"
    titreTypeId="pcc"
    etape={{
      date: toCaminoDate('2000-05-16'),
      typeId: 'dpu',
      contenu: {
        publication: {
          nor: {
            value: null,
            heritee: true,
            etapeHeritee: {
              etapeTypeId: 'dex',
              date: toCaminoDate('2000-05-16'),
              value: null,
            },
          },
          jorf: {
            value: null,
            heritee: false,
            etapeHeritee: null,
          },
        },
      },
    }}
  />
)
