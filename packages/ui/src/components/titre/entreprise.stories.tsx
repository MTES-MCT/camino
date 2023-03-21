import { Entreprise } from './entreprise'
import { Meta, Story } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/Entreprise',
  component: Entreprise,
  argTypes: {},
}
export default meta
const onEventTrack = action('onEventTrack')

export const Default: Story = () => (
  <Entreprise
    entreprise={{
      id: newEntrepriseId('id'),
      nom: "Nom de l'entreprise",
      adresse: 'Par ici',
      codePostal: '31200',
      commune: 'Toulouse',
      email: 'ici@here.aqui',
      legalForme: 'SARL',
      legalSiren: '111222333',
      operateur: true,
      telephone: '0102030405',
      url: 'http://here.aqui',
      etablissements: [{ id: 'id', dateDebut: toCaminoDate('2022-01-01'), dateFin: toCaminoDate('2023-01-01'), nom: 'etablissement' }],
    }}
    onEventTrack={onEventTrack}
  />
)

export const WithoutOptionalProps: Story = () => (
  <Entreprise
    entreprise={{
      id: newEntrepriseId('id'),
      nom: "Nom de l'entreprise",
      etablissements: [],
    }}
    onEventTrack={onEventTrack}
  />
)
