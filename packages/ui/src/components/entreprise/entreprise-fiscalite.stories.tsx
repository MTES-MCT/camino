import { EntrepriseFiscalite } from './entreprise-fiscalite'
import { Meta, Story } from '@storybook/vue3'
import { Fiscalite } from 'camino-common/src/fiscalite'
import { CaminoAnnee, toCaminoAnnee } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Entreprise/Fiscalite',
  component: EntrepriseFiscalite,
  argTypes: {},
}
export default meta

export const Ok: Story = () => (
  <EntrepriseFiscalite
    getFiscaliteEntreprise={() =>
      Promise.resolve({
        redevanceCommunale: 1600.071,
        redevanceDepartementale: 330.98,
      })
    }
    anneeCourante={toCaminoAnnee('2022')}
    annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]}
  />
)

export const Guyane: Story = () => (
  <EntrepriseFiscalite
    getFiscaliteEntreprise={(annee: CaminoAnnee) =>
      Promise.resolve({
        redevanceCommunale: Number.parseInt(annee) * 1600.071,
        redevanceDepartementale: Number.parseInt(annee) * 330.98,
        guyane: {
          taxeAurifereBrute: Number.parseInt(annee) * 4100,
          totalInvestissementsDeduits: Number.parseInt(annee) * 100,
          taxeAurifere: Number.parseInt(annee) * 210,
        },
      })
    }
    anneeCourante={toCaminoAnnee('2022')}
    annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]}
  />
)

export const GuyaneAnneePrecedente: Story = () => (
  <EntrepriseFiscalite
    getFiscaliteEntreprise={(annee: CaminoAnnee) =>
      Promise.resolve({
        redevanceCommunale: Number.parseInt(annee) * 1600.071,
        redevanceDepartementale: Number.parseInt(annee) * 330.98,
        guyane: {
          taxeAurifereBrute: Number.parseInt(annee) * 4100,
          totalInvestissementsDeduits: Number.parseInt(annee) * 100,
          taxeAurifere: Number.parseInt(annee) * 210,
        },
      })
    }
    anneeCourante={toCaminoAnnee('2021')}
    annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]}
  />
)

export const Loading: Story = () => (
  <EntrepriseFiscalite getFiscaliteEntreprise={() => new Promise<Fiscalite>(resolve => {})} anneeCourante={toCaminoAnnee('2021')} annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]} />
)

export const WithError: Story = () => (
  <EntrepriseFiscalite getFiscaliteEntreprise={() => Promise.reject(new Error('because reasons'))} anneeCourante={toCaminoAnnee('2021')} annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]} />
)
