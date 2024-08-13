import { Meta, StoryFn, StoryObj } from '@storybook/vue3'
import { PureTitreCreation } from './titre-creation'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ApiClient } from '@/api/api-client'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { action } from '@storybook/addon-actions'
import { etapeIdValidator } from 'camino-common/src/etape'
import { LinkableTitre } from './titre/titres-link-form-api-client'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { toCaminoDate } from 'camino-common/src/date'
import { expect, userEvent, within } from '@storybook/test'
import { CaminoError } from 'camino-common/src/zod-tools'

const meta = {
  title: 'Components/TitreCreation',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureTitreCreation,
} satisfies Meta<typeof PureTitreCreation>
export default meta
type Story = StoryObj<typeof meta>

const createTitreAction = action('createTitre')
const loadLinkableTitresAction = action('loadLinkableTitres')

const entreprise1Id = entrepriseIdValidator.parse('id1')
const titreId2 = titreIdValidator.parse('id2')

const linkableTitres: LinkableTitre[] = [
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
    id: titreId2,
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

const entreprises = [
  { id: entreprise1Id, nom: 'entreprise 1', legal_siren: null },
  { id: entrepriseIdValidator.parse('id2'), nom: 'entreprise 2', legal_siren: null },
]
const apiClient: Pick<ApiClient, 'createTitre' | 'loadLinkableTitres'> = {
  createTitre: value => {
    createTitreAction(value)

    return new Promise(resolve => {
      setTimeout(() => resolve({ titreId: titreIdValidator.parse('titreId'), etapeId: etapeIdValidator.parse('etapeId') }), 1000)
    })
  },
  loadLinkableTitres:
    (...params) =>
    () => {
      loadLinkableTitresAction(params)

      return Promise.resolve(linkableTitres)
    },
}

export const DefaultUserSuper: StoryFn = () => <PureTitreCreation entreprises={entreprises} user={{ ...testBlankUser, role: 'super' }} apiClient={apiClient} />
export const OnlyOneEntrepriseUserSuper: StoryFn = () => (
  <PureTitreCreation user={{ ...testBlankUser, role: 'super' }} entreprises={[{ id: entrepriseIdValidator.parse('id1'), nom: 'entreprise 1', legal_siren: null }]} apiClient={apiClient} />
)

export const OnlyOneEntrepriseUserEntreprise: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [entreprise1Id] }}
    entreprises={[{ id: entreprise1Id, nom: 'entreprise 1', legal_siren: null }]}
    apiClient={apiClient}
  />
)

export const NoEntreprise: StoryFn = () => (
  <PureTitreCreation user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [] }} entreprises={[{ id: entreprise1Id, nom: 'entreprise 1', legal_siren: null }]} apiClient={apiClient} />
)

export const FullSuper: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'super' }}
    entreprises={entreprises}
    apiClient={apiClient}
    initialValue={{
      nom: 'Titre full',
      references: [{ nom: 'REF', referenceTypeId: 'brg' }],
      titreTypeId: 'axm',
      titreFromIds: [titreId2],
    }}
  />
)

export const FullEntreprise: StoryFn = () => (
  <PureTitreCreation
    user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [entreprises[0].id] }}
    entreprises={entreprises}
    apiClient={apiClient}
    initialValue={{
      entrepriseId: entreprise1Id,
      nom: 'Titre full',
      references: [],
      titreTypeId: 'axm',
      titreFromIds: [titreId2],
    }}
  />
)

export const DisplayErrorMessageUserSuper: Story = {
  args: {
    entreprises,
    apiClient: {
      ...apiClient,
      createTitre: value => {
        createTitreAction(value)
        const error: CaminoError<string> = { message: "Une erreur parlante est survenue dans l'api" }
        return Promise.resolve(error)
      },
    },
    user: { ...testBlankUser, role: 'super' },
    initialValue: {
      nom: 'Titre full',
      references: [{ nom: 'REF', referenceTypeId: 'brg' }],
      titreTypeId: 'axm',
      titreFromIds: [titreId2],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Enregistrer'))

    const errorDiv = await canvas.findByText("Une erreur parlante est survenue dans l'api")
    expect(errorDiv).not.toBe(undefined)
  },
}
