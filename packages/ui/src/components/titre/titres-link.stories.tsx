import { TitresLink } from './titres-link'
import { Meta, StoryFn } from '@storybook/vue3'
import { LinkableTitre } from '@/components/titre/titres-link-form-api-client'
import { action } from '@storybook/addon-actions'
import { toCaminoDate } from 'camino-common/src/date'
import { titreIdValidator } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Titre/TitresLink',
  component: TitresLink,
  argTypes: {},
}
export default meta

const titres: LinkableTitre[] = [
  {
    id: titreIdValidator.parse('id1'),
    nom: 'Abttis Coucou',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2016-10-28'),
        demarcheDateFin: toCaminoDate('2017-03-17'),
      },
    ],
  },
  {
    id: titreIdValidator.parse('id2'),
    nom: 'Affluent Crique Saint Bernard',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2008-11-30'),
        demarcheDateFin: toCaminoDate('2019-02-27'),
      },
    ],
  },
  {
    id: titreIdValidator.parse('id3'),
    nom: 'Nouveau titre',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2008-11-30'),
        demarcheDateFin: toCaminoDate('2019-02-27'),
      },
    ],
  },
]
const onSelectTitre = action('onSelectTitre')
const onSelectTitres = action('onSelectTitres')
export const AXM: StoryFn = () => (
  <TitresLink config={{ type: 'single', selectedTitreId: null }} loadLinkableTitres={() => Promise.resolve(titres)} onSelectTitre={onSelectTitre} onSelectTitres={onSelectTitres} />
)

export const AXMWithAlreadySelectedTitre: StoryFn = () => (
  <TitresLink
    config={{ type: 'single', selectedTitreId: titreIdValidator.parse('id1') }}
    loadLinkableTitres={() => Promise.resolve(titres)}
    onSelectTitre={onSelectTitre}
    onSelectTitres={onSelectTitres}
  />
)

export const DemarcheFusion: StoryFn = () => (
  <TitresLink config={{ type: 'multiple', selectedTitreIds: [] }} loadLinkableTitres={() => Promise.resolve(titres)} onSelectTitre={onSelectTitre} onSelectTitres={onSelectTitres} />
)

export const DemarcheFusionWithAlreadySelectedTitre: StoryFn = () => (
  <TitresLink
    config={{ type: 'multiple', selectedTitreIds: [titreIdValidator.parse('id1'), titreIdValidator.parse('id2')] }}
    loadLinkableTitres={() => Promise.resolve(titres)}
    onSelectTitre={onSelectTitre}
    onSelectTitres={onSelectTitres}
  />
)

export const Loading: StoryFn = () => (
  <TitresLink
    config={{
      type: 'multiple',
      selectedTitreIds: [titreIdValidator.parse('id1')],
    }}
    loadLinkableTitres={() => new Promise<LinkableTitre[]>(resolve => {})}
    onSelectTitre={onSelectTitre}
    onSelectTitres={onSelectTitres}
  />
)

export const WithError: StoryFn = () => (
  <TitresLink
    config={{
      type: 'multiple',
      selectedTitreIds: [titreIdValidator.parse('id1')],
    }}
    loadLinkableTitres={() => Promise.reject(new Error('because reasons'))}
    onSelectTitre={onSelectTitre}
    onSelectTitres={onSelectTitres}
  />
)
