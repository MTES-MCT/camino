import { PureEntreprise } from './entreprise'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoAnnee } from 'camino-common/src/date'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Entreprise',
  component: PureEntreprise
}
export default meta

type Item = { id: string; titre: string }

const editPopupOpen = action('editPopupOpen')
const getFiscaliteEntreprise = action('getFiscaliteEntreprise')

const items: Item[] = [
  { id: 'id1', titre: 'titreItem1' },
  { id: 'id2', titre: 'titreItem2' },
  { id: 'id3', titre: 'titreItem3' }
]

const annee = toCaminoAnnee('2023')
const entreprise = {
  id: newEntrepriseId(''),
  nom: 'nom entreprise',
  telephone: 'telephone',
  email: 'email@entreprise.fr',
  legalSiren: 'siren',
  legalForme: 'forme',
  adresse: 'adresse',
  codePostal: 'code postal',
  commune: 'commune',
  url: 'http://urlentreprise',
  documents: [],
  archive: false,
  titulaireTitres: [],
  amodiataireTitres: [],
  utilisateurs: [],
  etablissements: []
}
export const Loading: Story = () => (
  <PureEntreprise
    currentYear={annee}
    editPopupOpen={editPopupOpen}
    entreprise={undefined}
    getFiscaliteEntreprise={data => {
      getFiscaliteEntreprise(data)
      return Promise.resolve({
        redevanceCommunale: 0,
        redevanceDepartementale: 0
      })
    }}
    user={null}
  />
)

export const NonConnecte: Story = () => (
  <PureEntreprise
    currentYear={annee}
    editPopupOpen={editPopupOpen}
    entreprise={entreprise}
    getFiscaliteEntreprise={data => {
      getFiscaliteEntreprise(data)
      return Promise.resolve({
        redevanceCommunale: 0,
        redevanceDepartementale: 0
      })
    }}
    user={null}
  />
)

export const Complet: Story = () => (
  <PureEntreprise
    currentYear={annee}
    editPopupOpen={editPopupOpen}
    entreprise={entreprise}
    getFiscaliteEntreprise={data => {
      getFiscaliteEntreprise(data)
      return Promise.resolve({
        redevanceCommunale: 0,
        redevanceDepartementale: 0
      })
    }}
    user={null}
  />
)
