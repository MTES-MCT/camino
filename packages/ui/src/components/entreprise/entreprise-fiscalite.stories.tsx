import { EntrepriseFiscalite } from './entreprise-fiscalite'
import { Meta, StoryFn } from '@storybook/vue3'
import type { Fiscalite } from 'camino-common/src/validators/fiscalite'
import { CaminoAnnee, toCaminoAnnee } from 'camino-common/src/date'
import { CaminoHttpError } from '@/api/client-rest'

const meta: Meta = {
  title: 'Components/Entreprise/Fiscalite',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: EntrepriseFiscalite,
}
export default meta

export const Ok: StoryFn = () => (
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

export const Guyane: StoryFn = () => (
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

export const GuyaneAnneePrecedente: StoryFn = () => (
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

export const Loading: StoryFn = () => (
  <EntrepriseFiscalite getFiscaliteEntreprise={() => new Promise<Fiscalite>(_resolve => {})} anneeCourante={toCaminoAnnee('2021')} annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]} />
)

export const WithError: StoryFn = () => (
  <EntrepriseFiscalite getFiscaliteEntreprise={() => Promise.reject(new Error('because reasons'))} anneeCourante={toCaminoAnnee('2021')} annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]} />
)

export const WithUnauthorized: StoryFn = () => (
  <EntrepriseFiscalite
    getFiscaliteEntreprise={() => Promise.reject(new CaminoHttpError('because reasons', 403))}
    anneeCourante={toCaminoAnnee('2021')}
    annees={[toCaminoAnnee('2021'), toCaminoAnnee('2022')]}
  />
)
