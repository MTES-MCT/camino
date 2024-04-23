import { Meta, StoryFn } from '@storybook/vue3'
import { NewSection } from './new-section'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Common/Section',
  component: NewSection,
}
export default meta

export const Default: StoryFn = () => (
  <NewSection
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

export const WithoutContent: StoryFn = () => (
  <NewSection
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
          value: null,
        },
        {
          id: 'franchissements',
          nom: "Franchissements de cours d'eau",
          type: 'integer',
          description: "Nombre de franchissements de cours d'eau",
          value: null,
        },
      ],
    }}
  />
)
