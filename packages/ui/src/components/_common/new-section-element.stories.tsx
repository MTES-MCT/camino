import { SectionElement } from './new-section-element'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Common/SectionElement',
  component: SectionElement,
}
export default meta

export const Text: StoryFn = () => (
  <SectionElement
    element={{
      id: 'id',
      type: 'text',
      nom: "nom de l'élément",
      description: 'description',
      value: 'Valeur',
    }}
  />
)

export const GranulatsMarins: StoryFn = () => (
  <SectionElement
    element={{
      id: 'volumeGranulatsExtrait',
      type: 'number',
      nom: 'Granulats Marins',
      description: 'description',
      value: 200,
    }}
  />
)

export const JORF: StoryFn = () => (
  <SectionElement
    element={{
      id: 'jorf',
      type: 'text',
      nom: 'JORF',
      description: 'description',
      value: 'JORFTEXT000000592092',
    }}
  />
)

export const Url: StoryFn = () => (
  <SectionElement
    element={{
      id: 'id',
      type: 'url',
      nom: "nom de l'élément",
      description: 'description',
      value: 'https://google.fr',
    }}
  />
)

export const Date: StoryFn = () => (
  <SectionElement
    element={{
      id: 'id',
      type: 'date',
      nom: 'Une date',
      description: 'description',
      value: toCaminoDate('2022-01-01'),
    }}
  />
)

export const Checkboxes: StoryFn = () => (
  <SectionElement
    element={{
      id: 'id',
      type: 'checkboxes',
      nom: 'Une checkbox',
      value: ['option1', 'option3'],
      options: [
        { id: 'option1', nom: 'Option 1' },
        { id: 'option2', nom: 'Option 2' },
        { id: 'option3', nom: 'Option 3' },
        { id: 'option4', nom: 'Option 4' },
      ],
    }}
  />
)

export const Select: StoryFn = () => (
  <SectionElement
    element={{
      id: 'id',
      type: 'select',
      nom: 'Un select',
      value: 'option1',
      options: [
        { id: 'option1', nom: 'Option 1' },
        { id: 'option2', nom: 'Option 2' },
        { id: 'option3', nom: 'Option 3' },
        { id: 'option4', nom: 'Option 4' },
      ],
    }}
  />
)

export const Number: StoryFn = () => (
  <SectionElement
    element={{
      id: 'id',
      type: 'number',
      nom: 'Un nombre',
      value: 2,
    }}
  />
)

export const Radio: StoryFn = () => (
  <div>
    <SectionElement
      element={{
        id: 'id',
        type: 'radio',
        nom: 'Un radio bouton',
        value: true,
      }}
    />
    <SectionElement
      element={{
        id: 'id',
        type: 'radio',
        nom: 'Un autre radio bouton',
        value: false,
      }}
    />
  </div>
)
