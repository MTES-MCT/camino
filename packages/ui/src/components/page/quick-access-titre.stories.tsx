import { DisplayTitre, PureQuickAccessTitre } from './quick-access-titre'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Page/QuickAccessTitre',
  component: PureQuickAccessTitre,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const onSelectedTitre = action('onSelectedTitre')
const onSearch = action('onSearch')

export const Simple: StoryFn = () => (
  <PureQuickAccessTitre
    titres={[
      {
        id: titreIdValidator.parse('1'),
        nom: 'monTitre',
        typeId: 'arm',
        demarches: [],
      },
      {
        id: titreIdValidator.parse('1'),
        nom: 'monSecondTitre',
        typeId: 'arg',
        demarches: [],
      },
    ]}
    onSearch={onSearch}
    onSelectedTitre={onSelectedTitre}
    id={'typeahead_id'}
  />
)

export const Full: StoryFn = () => (
  <PureQuickAccessTitre
    titres={[...Array(100).keys()].map((_, index) => ({
      id: titreIdValidator.parse(`${index}`),
      nom: `Nom du titre ${index}`,
      typeId: index % 3 === 0 ? 'arg' : index % 2 === 0 ? 'cxh' : 'axm',
      demarches: [{ demarcheDateDebut: toCaminoDate(`2023-01-0${(index % 9) + 1}`) }],
    }))}
    onSearch={onSearch}
    onSelectedTitre={onSelectedTitre}
    id={'typeahead_id'}
  />
)

export const FullAlwaysOpen: StoryFn = () => (
  <PureQuickAccessTitre
    titres={[...Array(100).keys()].map((_, index) => ({
      id: titreIdValidator.parse(`${index}`),
      nom: `Nom du titre ${index}`,
      typeId: index % 3 === 0 ? 'arg' : index % 2 === 0 ? 'cxh' : 'axm',
      demarches: [{ demarcheDateDebut: toCaminoDate(`2023-01-0${(index % 9) + 1}`) }],
    }))}
    onSearch={onSearch}
    onSelectedTitre={onSelectedTitre}
    alwaysOpen={true}
    id={'typeahead_id'}
  />
)

export const Empty: StoryFn = () => <PureQuickAccessTitre titres={[]} onSearch={onSearch} onSelectedTitre={onSelectedTitre} id={'typeahead_id'} />
export const DisplayTitreSeulSansDate: StoryFn = () => (
  <DisplayTitre
    titre={{
      nom: 'monTitre',
      typeId: 'arm',
      demarches: [],
    }}
  />
)

export const DisplayTitreSeulAvecDate: StoryFn = () => (
  <DisplayTitre
    titre={{
      nom: 'monTitre',
      typeId: 'arm',
      demarches: [{ demarcheDateDebut: toCaminoDate('2023-09-26') }],
    }}
  />
)
