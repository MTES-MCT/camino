import { Meta, StoryFn } from '@storybook/vue3'
import { EtapePropEntreprisesItem, EtapePropItem, EtapePropAdministrationsItem } from './etape-prop-item'
import { Domaine } from '../_common/domaine'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Etape/PropItem',
  component: EtapePropItem,
}
export default meta

export const WithItem: StoryFn = () => <EtapePropItem title="Domaine" item={<Domaine domaineId="m" />} />

export const WithText: StoryFn = () => <EtapePropItem title="Date de début" text="Valeur textuelle" />

export const WithOneEntreprise: StoryFn = () => <EtapePropEntreprisesItem title="Titulaire" entreprises={[{ id: entrepriseIdValidator.parse('entrepriseId'), nom: "Nom de l'entreprise" }]} />

export const WithMultipleEntreprises: StoryFn = () => (
  <EtapePropEntreprisesItem
    title="Titulaire"
    entreprises={[
      { id: entrepriseIdValidator.parse('entrepriseId'), nom: "Nom de l'entreprise" },
      { id: entrepriseIdValidator.parse('entrepriseId2'), nom: 'Nom de la nouvelle entreprise' },
    ]}
  />
)
export const WithNoEntreprise: StoryFn = () => (
  <div>
    <EtapePropEntreprisesItem title="Titulaire" entreprises={[]} />
  </div>
)

export const WithOneAdministration: StoryFn = () => <EtapePropAdministrationsItem administrations={['aut-mrae-guyane-01']} />

export const WithMultipleAdministrations: StoryFn = () => <EtapePropAdministrationsItem administrations={['aut-97300-01', 'aut-mrae-guyane-01']} />
export const WithNoAdministration: StoryFn = () => (
  <div>
    <EtapePropAdministrationsItem administrations={[]} />
  </div>
)
