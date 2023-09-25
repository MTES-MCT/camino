import { vueRouter } from 'storybook-vue3-router'
import { PureActiviteEdition, Props } from './activite-edition'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { Activite, activiteIdOrSlugValidator, activiteIdValidator, activiteSlugValidator } from 'camino-common/src/activite'

const meta: Meta = {
  title: 'Components/Activite/Edition',
  // @ts-ignore
  component: PureActiviteEdition,
  decorators: [vueRouter([{ name: 'titre' }, { name: 'activites' }, { name: 'activite' }])],
}
export default meta

const getActiviteAction = action('getActivite')
const uploadTempDocumentAction = action('uploadTempDocument')
const deposerActiviteAction = action('deposerActivite')
const goBackAction = action('goBack')

const activite: Activite = {
  id: activiteIdValidator.parse('activiteId'),
  slug: activiteSlugValidator.parse('slug-activite'),
  activite_statut_id: 'abs',
  type_id: 'grp',
  annee: toCaminoAnnee('2023'),
  date_saisie: null,
  date: toCaminoDate('2023-01-01'),
  periode_id: 1,
  suppression: false,
  deposable: false,
  modification: true,
  sections_with_value: [
    {
      id: 'renseignements',
      elements: [
        {
          id: 'orBrut',
          nom: 'Or brut extrait (g)',
          description: 'Masse d’or brut en sortie de mine extrait au cours du trimestre (exemple : masse sous la forme de concentré gravimétrique).',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: null,
        },
        {
          id: 'mercure',
          nom: 'Mercure récupéré (g)',
          description: 'Masse en gramme de l’ensemble des produits contaminés envoyés en traitement au cours du trimestre.',
          type: 'number',
          value: null,
        },
        {
          id: 'carburantDetaxe',
          nom: 'Carburant détaxé (l)',
          description: 'Volume total en litre de carburant détaxé consommé au cours du trimestre par les travaux réalisés sur le chantier.',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: null,
        },
        {
          id: 'carburantConventionnel',
          nom: 'Carburant conventionnel (l)',
          description: 'Volume total en litre de carburant conventionnel consommé au cours du trimestre par les travaux réalisés sur le chantier.',
          type: 'number',
          value: null,
        },
        {
          id: 'pompes',
          nom: 'Pompes présentes',
          description: 'Des pompes étaient-elles présentes sur le chantier',
          type: 'radio',
          value: null,
        },
        {
          id: 'pelles',
          nom: 'Pelles actives',
          description: 'Nombre moyen de pelles actives au cours du trimestre utilisées sur le chantier (aménagement, exploitation, réhabilitation).',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: 4,
        },
        { id: 'effectifs', nom: 'Effectifs', description: 'Nombre moyen de salariés sur le chantier au cours du trimestre.', type: 'number', value: null },
        {
          id: 'environnement',
          nom: 'Dépenses relatives à la protection de l’environnement (euros)',
          description:
            'Montant en euros des investissements consentis au cours du trimestre listés à l’<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000021850940&cidTexte=LEGITEXT000006069569" target="_blank" rel="noopener noreferrer">article 318 C de l’annexe II du code général des impôts</a>. Afin de bénéficier des déductions fiscales afférentes, les justificatifs attestant de la réalisation effective des investissements sont susceptibles de vous êtres demandés par l’administration.',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: null,
        },
      ],
    },
    {
      id: 'travaux',
      nom: 'Statut des travaux',
      elements: [
        {
          id: '4',
          nom: 'Avril',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'checkboxes',
          options: [
            { id: 'nonDebutes', nom: 'non débutés' },
            { id: 'exploitationEnCours', nom: 'exploitation en cours' },
            { id: 'arretTemporaire', nom: 'arrêt temporaire' },
            { id: 'rehabilitation', nom: 'réhabilitation' },
            { id: 'arretDefinitif', nom: 'arrêt définitif (après réhabilitation)' },
          ],
          value: [],
        },
        {
          id: '5',
          nom: 'Mai',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'checkboxes',
          options: [
            { id: 'nonDebutes', nom: 'non débutés' },
            { id: 'exploitationEnCours', nom: 'exploitation en cours' },
            { id: 'arretTemporaire', nom: 'arrêt temporaire' },
            { id: 'rehabilitation', nom: 'réhabilitation' },
            { id: 'arretDefinitif', nom: 'arrêt définitif (après réhabilitation)' },
          ],
          value: [],
        },
        {
          id: '6',
          nom: 'Juin',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'checkboxes',
          options: [
            { id: 'nonDebutes', nom: 'non débutés' },
            { id: 'exploitationEnCours', nom: 'exploitation en cours' },
            { id: 'arretTemporaire', nom: 'arrêt temporaire' },
            { id: 'rehabilitation', nom: 'réhabilitation' },
            { id: 'arretDefinitif', nom: 'arrêt définitif (après réhabilitation)' },
          ],
          value: [],
        },
      ],
    },
    {
      id: 'complement',
      nom: 'Informations complémentaires',
      elements: [
        {
          id: 'texte',
          description:
            'Toute information sur les événements marquants du trimestre (accident, incident, arrêt ou suspension d’activité en précisant les raisons, évolution de l’exploitation, difficultés rencontrées, etc.).',
          dateDebut: toCaminoDate('2018-01-01'),
          optionnel: true,
          type: 'textarea',
          value: null,
        },
      ],
    },
  ],
  titre: { nom: 'Titre avec activité', slug: 'm-ax-titre-avec-activite-2022' },
  activite_documents: [],
}

const apiClient: Props['apiClient'] = {
  updateActivite(activiteId, sectionsWithValue, activiteDocumentIds, newTempDocuments): Promise<void> {
    return Promise.resolve(undefined)
  },
  getActivite: activiteId => {
    getActiviteAction(activiteId)
    return Promise.resolve(activite)
  },
  uploadTempDocument: document => {
    uploadTempDocumentAction(document)
    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
  deposerActivite: activiteId => {
    deposerActiviteAction(activiteId)
    return Promise.resolve()
  },
}

const activiteId = activiteIdOrSlugValidator.parse('activiteId')
export const Loading: StoryFn = () => <PureActiviteEdition goBack={goBackAction} apiClient={{ ...apiClient, getActivite: () => new Promise(() => ({})) }} activiteId={activiteId} />
export const WithError: StoryFn = () => (
  <PureActiviteEdition goBack={goBackAction} apiClient={{ ...apiClient, getActivite: () => Promise.reject(new Error('Une erreur est survenue')) }} activiteId={activiteId} />
)

export const FullEmpty: StoryFn = () => <PureActiviteEdition goBack={goBackAction} apiClient={apiClient} activiteId={activiteId} />

export const FullEmptyWithMandatoryDocument: StoryFn = () => (
  <PureActiviteEdition
    goBack={goBackAction}
    apiClient={{
      ...apiClient,
      getActivite: () => {
        return Promise.resolve({ ...activite, type_id: 'wrp' })
      },
    }}
    activiteId={activiteId}
  />
)

export const FullDeposable: StoryFn = () => (
  <PureActiviteEdition
    goBack={goBackAction}
    apiClient={{
      ...apiClient,
      getActivite: () => {
        return Promise.resolve({
          ...activite,
          sections_with_value: [
            {
              id: 'renseignements',
              elements: [
                {
                  id: 'orBrut',
                  nom: 'Or brut extrait (g)',
                  description: 'Masse d’or brut en sortie de mine extrait au cours du trimestre (exemple : masse sous la forme de concentré gravimétrique).',
                  dateDebut: toCaminoDate('2018-01-01'),
                  type: 'number',
                  value: 0,
                },
                {
                  id: 'mercure',
                  nom: 'Mercure récupéré (g)',
                  description: 'Masse en gramme de l’ensemble des produits contaminés envoyés en traitement au cours du trimestre.',
                  type: 'number',
                  value: 120,
                },
                {
                  id: 'carburantDetaxe',
                  nom: 'Carburant détaxé (l)',
                  description: 'Volume total en litre de carburant détaxé consommé au cours du trimestre par les travaux réalisés sur le chantier.',
                  dateDebut: toCaminoDate('2018-01-01'),
                  type: 'number',
                  value: 8000,
                },
              ],
            },
          ],
          activite_documents: [],
        })
      },
    }}
    activiteId={activiteId}
  />
)
