import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { NewSection } from './new-section'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/common/Section',
  component: NewSection,
}
export default meta

const fileDownload = action('fileDownload')
export const Default: Story = () => (
  <NewSection
    fileDownload={fileDownload}
    entete={false}
    date={toCaminoDate('2022-01-01')}
    section={{
      nom: 'Caractéristiques ARM',
      id: 'arm',
      elements: [
        { id: 'mecanisation', type: 'radio', nom: 'Mécanisation', value: true },
        {
          id: 'franchissements',
          nom: "Franchissements de cours d'eau",
          type: 'integer',
          value: 3,
          description: "Nombre de franchissements de cours d'eau",
        },
      ],
    }}
  />
)

export const WithoutContent: Story = () => (
  <NewSection
    fileDownload={fileDownload}
    entete={false}
    date={toCaminoDate('2022-01-01')}
    section={{
      nom: 'Caractéristiques ARM',
      id: 'arm',
      elements: [
        {
          id: 'mecanisation',
          type: 'radio',
          nom: 'Mécanisation',
          value: undefined,
        },
        {
          id: 'franchissements',
          nom: "Franchissements de cours d'eau",
          type: 'integer',
          description: "Nombre de franchissements de cours d'eau",
          value: undefined,
        },
      ],
    }}
  />
)
