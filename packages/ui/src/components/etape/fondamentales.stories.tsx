import { Fondamentales } from './fondamentales'
import { Meta, Story } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/Fondamentales',
  component: Fondamentales,
  argTypes: {},
}
export default meta

export const Partiel: Story = () => (
  <Fondamentales
    etape={{
      amodiataires: [],
      titulaires: [],
      dateDebut: toCaminoDate('2022-01-03'),
      dateFin: toCaminoDate('2022-01-04'),
      date: toCaminoDate('2022-01-04'),
      duree: 60,
      substances: ['auru', 'arge'],
      incertitudes: {
        amodiataires: false,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        substances: false,
        titulaires: false,
      },
    }}
  />
)

export const FullCertain: Story = () => (
  <Fondamentales
    etape={{
      amodiataires: [{ id: newEntrepriseId('amodiataire1'), nom: 'amodiataire', operateur: true, etablissements: [] }],
      titulaires: [{ id: newEntrepriseId('titulaire1'), nom: 'titulaire', operateur: true, etablissements: [] }],
      dateDebut: toCaminoDate('2022-01-03'),
      dateFin: toCaminoDate('2022-01-04'),
      date: toCaminoDate('2022-01-04'),
      duree: 60,
      substances: ['auru', 'arge'],
      incertitudes: {
        amodiataires: false,
        date: false,
        dateDebut: false,
        dateFin: false,
        duree: false,
        substances: false,
        titulaires: false,
      },
    }}
  />
)
export const FullIncertain: Story = () => (
  <Fondamentales
    etape={{
      amodiataires: [{ id: newEntrepriseId('amodiataire1'), nom: 'amodiataire', operateur: true, etablissements: [] }],
      titulaires: [{ id: newEntrepriseId('titulaire1'), nom: 'titulaire', operateur: true, etablissements: [] }],
      dateDebut: toCaminoDate('2022-01-03'),
      dateFin: toCaminoDate('2022-01-04'),
      date: toCaminoDate('2022-01-04'),
      duree: 60,
      substances: ['auru', 'arge'],
      incertitudes: {
        amodiataires: true,
        date: true,
        dateDebut: true,
        dateFin: true,
        duree: true,
        substances: true,
        titulaires: true,
      },
    }}
  />
)
