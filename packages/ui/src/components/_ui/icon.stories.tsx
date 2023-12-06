import { Meta, StoryFn } from '@storybook/vue3'
import { Icon, DsfrIcon } from './icon'
import { icons } from './iconSpriteType'
import { icons as dsfrIcons } from './dsfrIconSpriteType'
import { IconSprite } from '@/components/_ui/iconSprite'

const meta: Meta = {
  title: 'Components/Ui/Icons',
  component: Icon,
}
export default meta

export const IconAllSize: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Name</th>
        <th>Size</th>
      </tr>
      <tr>
        <td>s</td>
        <td>
          <Icon size="S" name="download" aria-hidden="true" />
        </td>
      </tr>
      <tr>
        <td>m</td>
        <td>
          <Icon size="M" name="download" aria-hidden="true" />
        </td>
      </tr>
    </table>
  </div>
)

export const AllIcons: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <IconSprite />
    <table>
      <tr>
        <th>Name</th>
        <th>Component</th>
      </tr>
      {icons.map(iconName => (
        <tr>
          <td>{iconName}</td>
          <td>
            <Icon size="M" name={iconName} aria-hidden="true" />
          </td>
        </tr>
      ))}
    </table>
  </div>
)

export const AllDsfrIcons: StoryFn = () => (
  <div style="height:100%;width:100%;background:white" class="dsfr">
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
            <DsfrIcon name={`fr-icon-${iconName}`} size="sm" />
          </td>
          <td>
            <DsfrIcon name={`fr-icon-${iconName}`} size="md" />
          </td>
          <td>
            <DsfrIcon name={`fr-icon-${iconName}`} size="lg" />
          </td>
        </tr>
      ))}
    </table>
  </div>
)

export const DsfrIconColor: StoryFn = () => (
  <div class="dsfr">
    <DsfrIcon name={`fr-icon-calendar-2-fill`} color="text-title-blue-france" />
  </div>
)
