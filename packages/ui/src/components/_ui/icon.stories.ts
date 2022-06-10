import { Meta } from '@storybook/vue3'
import Icon from './icon.vue'
import { icons } from './iconSpriteType'

const meta: Meta = {
  title: 'Ui/Icons',
  component: Icon
}
export default meta

export const IconAllSize = () => ({
  components: { Icon },
  template: `
   <div style="height:100%;width:100%;background:white">
      <table>
        <tr><th>Name</th><th>Size</th></tr>
        <tr><td>s</td><td><Icon size="S" name="download" /></td></tr>
        <tr><td>m</td><td><Icon size="M" name="download" /></td></tr>
        <tr><td>l</td><td><Icon size="L" name="download" /></td></tr>
        <tr><td>xl</td><td><Icon size="XL" name="download" /></td></tr>
      </table>
    </div>
        `
})

export const AllIcons = () => ({
  components: { Icon },
  template: `
    <div style="height:100%;width:100%;background:white">
      <table>
      <tr><th>Name</th><th>Component</th></tr>
        ${icons
          .map(
            iconName =>
              `<tr><td>${iconName}</td><td><Icon size="M" name="${iconName}" /></td></tr>`
          )
          .join('')}
      </table>
    </div>
    `
})
