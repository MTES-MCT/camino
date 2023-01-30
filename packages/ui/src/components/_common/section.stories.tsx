import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { Section } from './section'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/common/Section',
  component: Section
}
export default meta

const fileDownload = action('fileDownload')
export const Default: Story = () => (
  <Section
    fileDownload={fileDownload}
    entete={false}
    contenu={{ franchissements: 3, mecanisation: true }}
    date={toCaminoDate('2022-01-01')}
    section={{
      nom: 'Caractéristiques ARM',
      elements: [
        { id: 'mecanisation', type: 'radio', nom: 'Mécanisation' },
        {
          id: 'franchissements',
          nom: "Franchissements de cours d'eau",
          type: 'integer',
          description: "Nombre de franchissements de cours d'eau"
        }
      ]
    }}
  />
)

export const WithoutContent: Story = () => (
  <Section
    fileDownload={fileDownload}
    entete={false}
    contenu={{}}
    date={toCaminoDate('2022-01-01')}
    section={{
      nom: 'Caractéristiques ARM',
      elements: [
        { id: 'mecanisation', type: 'radio', nom: 'Mécanisation' },
        {
          id: 'franchissements',
          nom: "Franchissements de cours d'eau",
          type: 'integer',
          description: "Nombre de franchissements de cours d'eau"
        }
      ]
    }}
  />
)
