import { TypeAhead } from './typeahead'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/TypeAhead',
  component: TypeAhead,
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

export const Single: Story = () => (
  <TypeAhead
    id="ello"
    itemKey="id"
    items={items}
    placeholder="placeholder"
    minInputLength={3}
    type="single"
    itemChipLabel={item => item.titre}
    onInput={onInput}
    onSelectItem={selectItem}
    onSelectItems={selectItems}
  />
)

export const Multiple: Story = () => (
  <TypeAhead
    id="plop"
    itemKey="id"
    items={[
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
    ]}
    placeholder="placeholder"
    minInputLength={3}
    type="multiple"
    itemChipLabel={item => item.titre}
    onInput={onInput}
    onSelectItem={selectItem}
    onSelectItems={selectItems}
  />
)

export const MultipleWithInitialItems: Story = () => (
  <TypeAhead
    id="plop"
    itemKey="id"
    items={[
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
    ]}
    placeholder="placeholder"
    minInputLength={3}
    type="multiple"
    overrideItems={[{ id: 'idTitreItem1' }, { id: 'idTitreItemNotInItems' }, { id: 'idTitreItem2' }]}
    itemChipLabel={item => item.titre}
    onInput={onInput}
    onSelectItem={selectItem}
    onSelectItems={selectItems}
  />
)
