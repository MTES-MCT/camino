import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrIcon } from './icon'
import { icons as dsfrIcons } from './dsfrIconSpriteType'

const meta: Meta = {
  title: 'Components/Ui/Icons',
  component: DsfrIcon,
}
export default meta

export const AllDsfrIcons: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Name</th>
        <th>SM</th>
        <th>MD</th>
        <th>LG</th>
      </tr>
      {dsfrIcons.map(iconName => (
        <tr>
          <td>{iconName}</td>
          <td>
            <DsfrIcon name={`fr-icon-${iconName}`} size="sm" aria-hidden="true" />
          </td>
          <td>
            <DsfrIcon name={`fr-icon-${iconName}`} size="md" aria-hidden="true" />
          </td>
          <td>
            <DsfrIcon name={`fr-icon-${iconName}`} size="lg" aria-hidden="true" />
          </td>
        </tr>
      ))}
    </table>
  </div>
)

export const DsfrIconColor: StoryFn = () => <DsfrIcon name={`fr-icon-calendar-2-fill`} color="text-title-blue-france" aria-hidden="true" />
