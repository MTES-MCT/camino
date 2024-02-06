import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { TypeAheadSingle } from './typeahead-single'
import { TypeAheadMultiple } from './typeahead-multiple'

const meta: Meta = {
  title: 'Components/UI/TypeAhead',
  // @ts-ignore il n'aime pas le côté générique du composant
  component: TypeAheadSingle,
}
export default meta

type Item = { id: string; titre: string }

const selectItems = action('selectItems')
const selectItem = action('selectItem')
const onInput = action('onInput')

const items: Item[] = [
  { id: 'id1', titre: 'titreItem1' },
  { id: 'id2', titre: 'titreItem2' },
  { id: 'id3', titre: 'titreItem3' },
]

export const Single: StoryFn = () => (
  <TypeAheadSingle
    overrideItem={null}
    props={{
      id: 'ello',
      itemKey: 'id',
      items,
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItem: selectItem,
    }}
  />
)

export const SingleDisabled: StoryFn = () => (
  <TypeAheadSingle
    overrideItem={{ id: 'id1' }}
    disabled={true}
    props={{
      id: 'ello',
      itemKey: 'id',
      items,
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItem: selectItem,
    }}
  />
)

export const SingleWithInitialItem: StoryFn = () => (
  <TypeAheadSingle
    overrideItem={{ id: 'id1' }}
    props={{
      id: 'ello',
      itemKey: 'id',
      items,
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItem: selectItem,
    }}
  />
)

export const Multiple: StoryFn = () => (
  <TypeAheadMultiple
    props={{
      id: 'plop',
      itemKey: 'id',
      items: [
        { id: 'idTitreItem1', titre: 'titreItem1' },
        { id: 'idTitreItem2', titre: 'titreItem2' },
        { id: 'idTitreItem3', titre: 'titreItem3' },
        { id: 'idTitreItem4', titre: 'titreItem4' },
        { id: 'idTitreItem5', titre: 'titreItem5' },
        { id: 'idTitreItem6', titre: 'titreItem6' },
        { id: 'idTitreItem7', titre: 'titreItem7' },
        { id: 'idTitreItem8', titre: 'titreItem8' },
        { id: 'idTitreItem9', titre: 'titreItem9' },
        { id: 'idTitreItem10', titre: 'titreItem10' },
        { id: 'idTitreItem11', titre: 'titreItem11' },
        { id: 'idTitreItem12', titre: 'titreItem12' },
        { id: 'idTitreItem13', titre: 'titreItem13' },
        { id: 'idTitreItem14', titre: 'titreItem14' },
        { id: 'idTitreItem15', titre: 'titreItem15' },
      ],
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItems: selectItems,
    }}
  />
)

export const MultipleAlwaysOpen: StoryFn = () => (
  <TypeAheadMultiple
    props={{
      id: 'plop',
      itemKey: 'id',
      items: [
        { id: 'idTitreItem1', titre: 'titreItem1' },
        { id: 'idTitreItem2', titre: 'titreItem2' },
        { id: 'idTitreItem3', titre: 'titreItem3' },
        { id: 'idTitreItem4', titre: 'titreItem4' },
        { id: 'idTitreItem5', titre: 'titreItem5' },
        { id: 'idTitreItem6', titre: 'titreItem6' },
        { id: 'idTitreItem7', titre: 'titreItem7' },
        { id: 'idTitreItem8', titre: 'titreItem8' },
        { id: 'idTitreItem9', titre: 'titreItem9' },
        { id: 'idTitreItem10', titre: 'titreItem10' },
        { id: 'idTitreItem11', titre: 'titreItem11' },
        { id: 'idTitreItem12', titre: 'titreItem12' },
        { id: 'idTitreItem13', titre: 'titreItem13' },
        { id: 'idTitreItem14', titre: 'titreItem14' },
        { id: 'idTitreItem15', titre: 'titreItem15' },
      ],
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItems: selectItems,
      alwaysOpen: true,
    }}
  />
)

export const MultipleWithInitialItems: StoryFn = () => (
  <TypeAheadMultiple
    overrideItems={[{ id: 'idTitreItem1' }, { id: 'idTitreItemNotInItems' }, { id: 'idTitreItem2' }]}
    props={{
      id: 'plop',
      itemKey: 'id',
      items: [
        { id: 'idTitreItem1', titre: 'titreItem1' },
        { id: 'idTitreItem2', titre: 'titreItem2' },
        { id: 'idTitreItem3', titre: 'titreItem3' },
        { id: 'idTitreItem4', titre: 'titreItem4' },
        { id: 'idTitreItem5', titre: 'titreItem5' },
        { id: 'idTitreItem6', titre: 'titreItem6' },
        { id: 'idTitreItem7', titre: 'titreItem7' },
        { id: 'idTitreItem8', titre: 'titreItem8' },
        { id: 'idTitreItem9', titre: 'titreItem9' },
        { id: 'idTitreItem10', titre: 'titreItem10' },
        { id: 'idTitreItem11', titre: 'titreItem11' },
        { id: 'idTitreItem12', titre: 'titreItem12' },
        { id: 'idTitreItem13', titre: 'titreItem13' },
        { id: 'idTitreItem14', titre: 'titreItem14' },
        { id: 'idTitreItem15', titre: 'titreItem15' },
      ],
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItems: selectItems,
    }}
  />
)

export const MultipleWithInitialItemsAlwaysOpen: StoryFn = () => (
  <TypeAheadMultiple
    overrideItems={[{ id: 'idTitreItem1' }, { id: 'idTitreItemNotInItems' }, { id: 'idTitreItem2' }]}
    props={{
      id: 'plop',
      itemKey: 'id',
      items: [
        { id: 'idTitreItem1', titre: 'titreItem1' },
        { id: 'idTitreItem2', titre: 'titreItem2' },
        { id: 'idTitreItem3', titre: 'titreItem3' },
        { id: 'idTitreItem4', titre: 'titreItem4' },
        { id: 'idTitreItem5', titre: 'titreItem5' },
        { id: 'idTitreItem6', titre: 'titreItem6' },
        { id: 'idTitreItem7', titre: 'titreItem7' },
        { id: 'idTitreItem8', titre: 'titreItem8' },
        { id: 'idTitreItem9', titre: 'titreItem9' },
        { id: 'idTitreItem10', titre: 'titreItem10' },
        { id: 'idTitreItem11', titre: 'titreItem11' },
        { id: 'idTitreItem12', titre: 'titreItem12' },
        { id: 'idTitreItem13', titre: 'titreItem13' },
        { id: 'idTitreItem14', titre: 'titreItem14' },
        { id: 'idTitreItem15', titre: 'titreItem15' },
      ],
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItems: selectItems,
      alwaysOpen: true,
    }}
  />
)

export const MultipleWithALotOfItemsSelected: StoryFn = () => (
  <TypeAheadMultiple
    overrideItems={[
      { id: 'idTitreItem1' },
      { id: 'idTitreItemNotInItems' },
      { id: 'idTitreItem2' },
      { id: 'idTitreItem3' },
      { id: 'idTitreItem4' },
      { id: 'idTitreItem5' },
      { id: 'idTitreItem6' },
      { id: 'idTitreItem7' },
      { id: 'idTitreItem8' },
      { id: 'idTitreItem9' },
      { id: 'idTitreItem10' },
      { id: 'idTitreItem11' },
    ]}
    props={{
      id: 'plop',
      itemKey: 'id',
      items: [
        { id: 'idTitreItem1', titre: 'titreItem1' },
        { id: 'idTitreItem2', titre: 'titreItem2' },
        { id: 'idTitreItem3', titre: 'titreItem3' },
        { id: 'idTitreItem4', titre: 'titreItem4' },
        { id: 'idTitreItem5', titre: 'titreItem5' },
        { id: 'idTitreItem6', titre: 'titreItem6' },
        { id: 'idTitreItem7', titre: 'titreItem7' },
        { id: 'idTitreItem8', titre: 'titreItem8' },
        { id: 'idTitreItem9', titre: 'titreItem9' },
        { id: 'idTitreItem10', titre: 'titreItem10' },
        { id: 'idTitreItem11', titre: 'titreItem11' },
        { id: 'idTitreItem12', titre: 'titreItem12' },
        { id: 'idTitreItem13', titre: 'titreItem13' },
        { id: 'idTitreItem14', titre: 'titreItem14' },
        { id: 'idTitreItem15', titre: 'titreItem15' },
      ],
      placeholder: 'placeholder',
      minInputLength: 3,
      itemChipLabel: item => item.titre,
      onInput,
      onSelectItems: selectItems,
    }}
  />
)
