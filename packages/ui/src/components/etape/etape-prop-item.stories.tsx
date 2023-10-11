import { Meta, StoryFn } from '@storybook/vue3'
import { EtapePropEntreprisesItem, EtapePropItem } from './etape-prop-item'
import { Domaine } from '../_common/domaine'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Etape/PropItem',
  component: EtapePropItem,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' }), vueRouter([{ name: 'entreprise' }])],
}
export default meta

export const WithItem: StoryFn = () => <EtapePropItem title="Domaine" item={<Domaine domaineId="m" />} />

export const WithText: StoryFn = () => <EtapePropItem title="Date de début" text="Valeur textuelle" />

export const WithOneEntreprise: StoryFn = () => (
  <EtapePropEntreprisesItem title="Titulaire" entreprises={[{ id: entrepriseIdValidator.parse('entrepriseId'), nom: "Nom de l'entreprise", operateur: false }]} />
)

export const WithMultipleEntreprises: StoryFn = () => (
  <EtapePropEntreprisesItem
    title="Titulaire"
    entreprises={[
      { id: entrepriseIdValidator.parse('entrepriseId'), nom: "Nom de l'entreprise", operateur: false },
      { id: entrepriseIdValidator.parse('entrepriseId2'), nom: 'Nom de la nouvelle entreprise', operateur: true },
    ]}
  />
)
export const WithNoEntreprise: StoryFn = () => <EtapePropEntreprisesItem title="Titulaire" entreprises={[]} />
