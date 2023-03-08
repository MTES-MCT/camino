import { TitresLink } from './pure-titres-link'
import { Meta, Story } from '@storybook/vue3'
import { LinkableTitre } from '@/components/titre/pure-titres-link-form-api-client'

const meta: Meta = {
  title: 'Components/Titre/TitresLink',
  component: TitresLink,
  argTypes: {},
}
export default meta

const titres: LinkableTitre[] = [
  {
    id: 'id1',
    nom: 'Abttis Coucou',
    titreStatutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2016-10-28',
          dateFin: '2017-03-17',
        },
      },
    ],
  },
  {
    id: 'id2',
    nom: 'Affluent Crique Saint Bernard',
    titreStatutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2008-11-30',
          dateFin: '2019-02-27',
        },
      },
    ],
  },
  {
    id: 'id3',
    nom: 'Nouveau titre',
    titreStatutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2008-11-30',
          dateFin: '2019-02-27',
        },
      },
    ],
  },
]

export const AXM: Story = () => <TitresLink config={{ type: 'single', selectedTitreId: null }} loadLinkableTitres={() => Promise.resolve(titres)} />

export const AXMWithAlreadySelectedTitre: Story = () => <TitresLink config={{ type: 'single', selectedTitreId: 'id1' }} loadLinkableTitres={() => Promise.resolve(titres)} />

export const DemarcheFusion: Story = () => <TitresLink config={{ type: 'multiple', selectedTitreIds: [] }} loadLinkableTitres={() => Promise.resolve(titres)} />

export const DemarcheFusionWithAlreadySelectedTitre: Story = () => <TitresLink config={{ type: 'multiple', selectedTitreIds: ['id1', 'id2'] }} loadLinkableTitres={() => Promise.resolve(titres)} />

export const Loading: Story = () => (
  <TitresLink
    config={{
      type: 'multiple',
      selectedTitreIds: ['id1'],
    }}
    loadLinkableTitres={() => new Promise<LinkableTitre[]>(resolve => {})}
  />
)

export const WithError: Story = () => (
  <TitresLink
    config={{
      type: 'multiple',
      selectedTitreIds: ['id1'],
    }}
    loadLinkableTitres={() => Promise.reject(new Error('because reasons'))}
  />
)
