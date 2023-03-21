import { Repertoire } from './repertoire'
import { Meta, Story } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Titre/Repertoire',
  component: Repertoire,
  argTypes: {},
}
export default meta
const eventTrack = action('eventTrack')
export const Super: Story = () => (
  <Repertoire
    administrations={['aut-97300-01', 'aut-97300-01', 'dea-guyane-01']}
    amodiataires={[{ id: newEntrepriseId('id1'), etablissements: [], nom: 'Nom amodiataire' }]}
    titulaires={[
      {
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
      },
    ]}
    user={{ ...testBlankUser, role: 'super' }}
    titreTypeId="apc"
    eventTrack={eventTrack}
  />
)

export const Default: Story = () => (
  <Repertoire
    administrations={['aut-97300-01', 'aut-97300-01', 'dea-guyane-01']}
    amodiataires={[{ id: newEntrepriseId('id3'), etablissements: [], nom: 'Nom amodiataire', adresse: 'ici' }]}
    titulaires={[{ id: newEntrepriseId('id4'), etablissements: [], nom: 'Nom titulaire', adresse: 'la' }]}
    user={{ ...testBlankUser, role: 'defaut' }}
    titreTypeId="apc"
    eventTrack={eventTrack}
  />
)
