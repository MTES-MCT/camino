import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrIcon } from './icon'
import { FrIconClassName } from '@codegouvfr/react-dsfr/fr/generatedFromCss/classNames'

const meta: Meta = {
  title: 'Components/Ui/Icons',
  component: DsfrIcon,
}
export default meta

const iconsSamples: FrIconClassName[] = ['fr-icon-download-line', 'fr-icon-add-line', 'fr-icon-earth-fill']
export const DsfrIconsSizes: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Name</th>
        <th>SM</th>
        <th>MD</th>
        <th>LG</th>
      </tr>
      {iconsSamples.map(iconName => (
        <tr>
          <td>{iconName}</td>
          <td>
            <DsfrIcon name={iconName} size="sm" aria-hidden="true" />
          </td>
          <td>
            <DsfrIcon name={iconName} size="md" aria-hidden="true" />
          </td>
          <td>
            <DsfrIcon name={iconName} size="lg" aria-hidden="true" />
          </td>
        </tr>
      ))}
    </table>
  </div>
)

export const DsfrIconColor: StoryFn = () => <DsfrIcon name={`fr-icon-calendar-2-fill`} color="text-title-blue-france" aria-hidden="true" />
