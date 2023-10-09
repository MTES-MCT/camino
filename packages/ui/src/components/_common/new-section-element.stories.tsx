import { SectionElement } from './new-section-element'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Common/SectionElement',
  component: SectionElement,
}
export default meta

const fileDownload = action('fileDownload')

export const Text: StoryFn = () => (
  <SectionElement
    fileDownload={fileDownload}
    element={{
      id: 'id',
      type: 'text',
      nom: "nom de l'élément",
      description: 'description',
      value: 'Valeur',
    }}
  />
)
export const Url: StoryFn = () => (
  <SectionElement
    fileDownload={fileDownload}
    element={{
      id: 'id',
      type: 'url',
      nom: "nom de l'élément",
      description: 'description',
      value: 'https://google.fr',
    }}
  />
)

export const File: StoryFn = () => (
  <SectionElement
    fileDownload={fileDownload}
    element={{
      id: 'id',
      type: 'file',
      nom: 'Un fichier',
      description: 'description',
      value: 'superfichier.pdf',
    }}
  />
)

export const Date: StoryFn = () => (
  <SectionElement
    fileDownload={fileDownload}
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
    fileDownload={fileDownload}
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
    fileDownload={fileDownload}
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
    fileDownload={fileDownload}
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
      fileDownload={fileDownload}
      element={{
        id: 'id',
        type: 'radio',
        nom: 'Un radio bouton',
        value: true,
      }}
    />
    <SectionElement
      fileDownload={fileDownload}
      element={{
        id: 'id',
        type: 'radio',
        nom: 'Un autre radio bouton',
        value: false,
      }}
    />
  </div>
)
