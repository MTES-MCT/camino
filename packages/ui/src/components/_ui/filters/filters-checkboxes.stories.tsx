import { action } from '@storybook/addon-actions'
import { FiltersCheckboxes } from './filters-checkboxes'
import { Meta, StoryFn } from '@storybook/vue3'
import { caminoCheckboxesFiltres } from './camino-filtres'
import { MapPattern } from '@/components/_map/pattern'

const meta: Meta = {
  title: 'Components/Ui/Filters/FiltersCheckboxes',
  // @ts-ignore
  component: FiltersCheckboxes,
}
export default meta

export const AllFilters: StoryFn = () => (
  <>
    <MapPattern />

    <table>
      <thead>
        <th>Filtre</th>
        <th>Rendu</th>
      </thead>
      <tbody>
        {caminoCheckboxesFiltres.map(filtreName => {
          return (
            <tr>
              <td>{filtreName.id}</td>
              <td>
                <FiltersCheckboxes filter={filtreName.id} initialValues={[]} valuesSelected={action('valuesSelected')} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </>
)

export const WithInitialValues: StoryFn = () => <FiltersCheckboxes filter="domainesIds" initialValues={['m', 'c']} valuesSelected={action('valuesSelected')} />
