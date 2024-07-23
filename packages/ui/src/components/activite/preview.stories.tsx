import { Preview } from './preview'
import { Meta, StoryFn } from '@storybook/vue3'
import { Activite, activiteIdValidator, activiteSlugValidator } from 'camino-common/src/activite'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { ActiviteApiClient } from './activite-api-client'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Activite/Preview',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: Preview,
}
export default meta

const activite: Activite = {
  suppression: false,
  modification: false,
  date: toCaminoDate('2022-01-01'),
  date_saisie: toCaminoDate('2022-01-01'),
  id: activiteIdValidator.parse('id'),
  slug: activiteSlugValidator.parse('slug'),
  type_id: 'gra',
  activite_statut_id: ACTIVITES_STATUTS_IDS.CLOTURE,
  deposable: false,
  annee: toCaminoAnnee(2022),
  periode_id: 1,
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
          optionnel: false,
        },
        {
          id: 'mercure',
          nom: 'Mercure récupéré (g)',
          description: 'Masse en gramme de l’ensemble des produits contaminés envoyés en traitement au cours du trimestre.',
          type: 'number',
          value: null,
          optionnel: false,
        },
        {
          id: 'carburantDetaxe',
          nom: 'Carburant détaxé (l)',
          description: 'Volume total en litre de carburant détaxé consommé au cours du trimestre par les travaux réalisés sur le chantier.',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: null,
          optionnel: false,
        },
        {
          id: 'carburantConventionnel',
          nom: 'Carburant conventionnel (l)',
          description: 'Volume total en litre de carburant conventionnel consommé au cours du trimestre par les travaux réalisés sur le chantier.',
          type: 'number',
          value: null,
          optionnel: false,
        },
        {
          id: 'pompes',
          nom: 'Pompes présentes',
          description: 'Des pompes étaient-elles présentes sur le chantier',
          type: 'radio',
          value: null,
          optionnel: false,
        },
        {
          id: 'pelles',
          nom: 'Pelles actives',
          description: 'Nombre moyen de pelles actives au cours du trimestre utilisées sur le chantier (aménagement, exploitation, réhabilitation).',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: 4,
          optionnel: false,
        },
        { id: 'effectifs', nom: 'Effectifs', description: 'Nombre moyen de salariés sur le chantier au cours du trimestre.', type: 'number', optionnel: false, value: null },
        {
          id: 'environnement',
          nom: 'Dépenses relatives à la protection de l’environnement (euros)',
          description:
            'Montant en euros des investissements consentis au cours du trimestre listés à l’<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000021850940&cidTexte=LEGITEXT000006069569" target="_blank" rel="noopener noreferrer">article 318 C de l’annexe II du code général des impôts</a>. Afin de bénéficier des déductions fiscales afférentes, les justificatifs attestant de la réalisation effective des investissements sont susceptibles de vous êtres demandés par l’administration.',
          dateDebut: toCaminoDate('2018-01-01'),
          type: 'number',
          value: null,
          optionnel: false,
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
          optionnel: false,
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
          optionnel: false,
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
          optionnel: false,
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
  activite_documents: [],
  titre: {
    nom: 'Nom du titre',
    slug: 'slug-du-titre',
  },
}
const deposerActiviteAction = action('deposerActiviteAction')
const supprimerActiviteAction = action('supprimerActiviteAction')

const apiClient: Pick<ActiviteApiClient, 'deposerActivite' | 'supprimerActivite'> = {
  deposerActivite: (...params: unknown[]) => {
    deposerActiviteAction(params)

    return Promise.resolve()
  },
  supprimerActivite(activiteId) {
    supprimerActiviteAction(activiteId)

    return Promise.resolve()
  },
}

export const Defaut: StoryFn = () => <Preview apiClient={apiClient} activite={activite} />

export const ACompleter: StoryFn = () => (
  <Preview
    apiClient={apiClient}
    activite={{
      ...activite,
      deposable: false,
      modification: true,
      type_id: ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"],
      activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION,
    }}
  />
)

export const Deposable: StoryFn = () => <Preview apiClient={apiClient} activite={{ ...activite, deposable: true, modification: true, activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION }} />

export const Supprimable: StoryFn = () => (
  <Preview apiClient={apiClient} activite={{ ...activite, suppression: true, deposable: false, modification: true, activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION }} />
)
