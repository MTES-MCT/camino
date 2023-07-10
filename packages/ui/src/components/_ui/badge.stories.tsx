
import { Meta, StoryFn } from '@storybook/vue3'
import { Badge, systemes } from './badge'
import { CouleursIllustratives } from 'camino-common/src/static/couleurs'

const meta: Meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],

}
export default meta

export const Normal: StoryFn = () => <Badge ariaLabel="Badge" />
export const Mini: StoryFn = () => <Badge ariaLabel="Badge" badgeSize='sm' />
export const DsfrCouleursIllustratives: StoryFn = () =>   <div style="height:100%;width:100%;background:white" class="dsfr">
<table>
  <tr>
    <th>Couleur</th>
    <th>Rendu</th>
  </tr>
  {Object.values(CouleursIllustratives).map(couleur => (
    <tr>
      <td>{couleur}</td>
      <td>
        <Badge ariaLabel="Badge" badgeColor={couleur} />
      </td>
    </tr>
  ))}
</table>
</div>

export const Systeme: StoryFn = () =>   <div style="height:100%;width:100%;background:white" class="dsfr">
<table>
  <tr>
    <th>Systeme</th>
    <th>Rendu</th>
    <th>Avec Icone</th>
  </tr>
  {Object.values(systemes).map(systeme => (
    <tr>
      <td>{systeme}</td>
      <td>
        <Badge ariaLabel="Badge" systemLevel={systeme} />
      </td>
      <td>
        <Badge ariaLabel="Badge" systemLevel={systeme} systemIcon={true} />
      </td>
    </tr>
  ))}
</table>
</div>
