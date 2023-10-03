import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { SectionsEdit } from './new-sections-edit'
import { toCaminoDate } from 'camino-common/src/date'
import { UNITES, Unite, Unites } from 'camino-common/src/static/unites'
import { ActiviteSectionElement, ActivitesTypes, isSubstancesFiscales } from 'camino-common/src/static/activitesTypes'
import { getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { SubstancesFiscale } from 'camino-common/src/static/substancesFiscales'
import { DeepReadonly } from 'vue'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'

const meta: Meta = {
  title: 'Components/Common/SectionsEdit',
  // @ts-ignore
  component: SectionsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const completeUpdateAction = action('completeUpdate')
export const Default: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        nom: 'Renseignements',
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
            value: null,
          },
          { id: 'effectifs', nom: 'Effectifs', description: 'Nombre moyen de salariés sur le chantier au cours du trimestre.', type: 'number', value: null },
          {
            id: 'environnement',
            nom: 'Dépenses relatives à la protection de l’environnement (euros)',
            description:
              'Montant en euros des investissements consentis au cours du trimestre listés à l’<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000021850940&cidTexte=LEGITEXT000006069569" target="_blank" rel="noopener noreferrer">article 318 C de l’annexe II du code général des impôts</a>. Afin de bénéficier des déductions fiscales afférentes, les justificatifs attestant de la réalisation effective des investissements sont susceptibles de vous êtres demandés par l’administration.',
            dateDebut: toCaminoDate('2018-01-01'),
            type: 'number',
            optionnel: true,
            value: null,
          },
        ],
      },
    ]}
  />
)

export const TousLesElementsVidesOptionnels: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        elements: [
          {
            id: 'integer',
            nom: 'integer',
            description: 'Description pour integer',
            type: 'integer',
            optionnel: true,
            value: null,
          },
          {
            id: 'number',
            nom: 'number',
            description: 'Description pour number',
            type: 'number',
            optionnel: true,
            value: null,
          },
          {
            id: 'date',
            nom: 'date',
            description: 'Description pour date',
            type: 'date',
            optionnel: true,
            value: null,
          },
          {
            id: 'textarea',
            nom: 'textarea',
            description: 'Description pour textarea',
            type: 'textarea',
            optionnel: true,
            value: null,
          },
          {
            id: 'text',
            nom: 'text',
            description: 'Description pour text',
            type: 'text',
            optionnel: true,
            value: null,
          },
          {
            id: 'radio',
            nom: 'radio',
            description: 'Description pour radio',
            type: 'radio',
            value: null,
          },
          {
            id: 'checkbox',
            nom: 'checkbox',
            description: 'Description pour checkbox',
            type: 'checkbox',
            value: null,
          },
          {
            id: 'checkboxes',
            nom: 'checkboxes',
            description: 'Description pour checkboxes',
            type: 'checkboxes',
            options: [
              { id: '1', nom: 'checkbox 1' },
              { id: '2', nom: 'checkbox2' },
            ],
            value: [],
          },
          {
            id: 'select',
            nom: 'select',
            description: 'Description pour select',
            type: 'select',
            optionnel: true,
            options: UNITES as NonEmptyArray<Unite>,
            value: null,
          },
        ],
      },
    ]}
  />
)

export const TousLesElementsRequis: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        elements: [
          {
            id: 'integer',
            nom: 'integer',
            description: 'Description pour integer',
            type: 'integer',
            value: null,
          },
          {
            id: 'number',
            nom: 'number',
            description: 'Description pour number',
            type: 'number',
            value: null,
          },
          {
            id: 'date',
            nom: 'date',
            description: 'Description pour date',
            type: 'date',
            value: null,
          },
          {
            id: 'textarea',
            nom: 'textarea',
            description: 'Description pour textarea',
            type: 'textarea',
            value: null,
          },
          {
            id: 'text',
            nom: 'text',
            description: 'Description pour text',
            type: 'text',
            value: null,
          },
          {
            id: 'radio',
            nom: 'radio',
            description: 'Description pour radio',
            type: 'radio',
            value: null,
          },
          {
            id: 'checkbox',
            nom: 'checkbox',
            description: 'Description pour checkbox',
            type: 'checkbox',
            value: null,
          },
          {
            id: 'checkboxes',
            nom: 'checkboxes',
            description: 'Description pour checkboxes',
            type: 'checkboxes',
            options: [
              { id: '1', nom: 'checkbox 1' },
              { id: '2', nom: 'checkbox2' },
            ],
            value: [],
          },
          {
            id: 'select',
            nom: 'select',
            description: 'Description pour select',
            type: 'select',
            optionnel: false,
            options: UNITES as NonEmptyArray<Unite>,
            value: null,
          },
        ],
      },
    ]}
  />
)

export const TousLesElementsRemplis: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        elements: [
          {
            id: 'integer',
            nom: 'integer',
            description: 'Description pour integer',
            type: 'integer',
            value: 12,
          },
          {
            id: 'number',
            nom: 'number',
            description: 'Description pour number',
            type: 'number',
            value: 8.2,
          },
          {
            id: 'date',
            nom: 'date',
            description: 'Description pour date',
            type: 'date',
            value: toCaminoDate('2023-09-01'),
          },
          {
            id: 'textarea',
            nom: 'textarea',
            description: 'Description pour textarea',
            type: 'textarea',
            value: 'ceci est un textarea',
          },
          {
            id: 'text',
            nom: 'text',
            description: 'Description pour text',
            type: 'text',
            value: 'ceci est un text',
          },
          {
            id: 'radio',
            nom: 'radio',
            description: 'Description pour radio',
            type: 'radio',
            value: true,
          },
          {
            id: 'checkbox',
            nom: 'checkbox',
            description: 'Description pour checkbox',
            type: 'checkbox',
            value: true,
          },
          {
            id: 'checkboxes',
            nom: 'checkboxes',
            description: 'Description pour checkboxes',
            type: 'checkboxes',
            options: [
              { id: '1', nom: 'checkbox 1' },
              { id: '2', nom: 'checkbox2' },
              { id: '3', nom: 'checkbox3' },
            ],
            value: ['1', '2'],
          },
          {
            id: 'select',
            nom: 'select',
            description: 'Description pour select',
            type: 'select',
            options: UNITES as NonEmptyArray<Unite>,
            value: 'deg',
          },
        ],
      },
    ]}
  />
)
export const VolumeGranulatsExtrait: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        elements: [
          {
            id: 'volumeGranulatsExtrait',
            nom: 'Volume de granulats marins extrait (m3)',
            type: 'number',
            description: "Volume de granulats marins extrait, en mètre cube, au cours de l'année.",
            value: 12,
          },
        ],
      },
    ]}
  />
)

export const Date: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        elements: [
          {
            id: 'date',
            nom: 'Une date',
            type: 'date',
            description: 'Et quelle belle date',
            value: null,
          },
        ],
      },
    ]}
  />
)

export const Checkboxes: StoryFn = () => (
  <SectionsEdit
    completeUpdate={(complete, newContent) => {
      completeUpdateAction(complete, newContent)
    }}
    sectionsWithValue={[
      {
        id: 'renseignements',
        elements: [
          {
            id: 'checkbox',
            nom: 'Une checkbox',
            type: 'checkboxes',
            description: 'Et quelle belle checkbox',
            options: [
              { id: '1', nom: 'nom' },
              { id: '2', nom: 'plop' },
              { id: '3', nom: 'plop 3' },
            ],
            value: [],
          },
        ],
      },
    ]}
  />
)

export const ToutesLesActivites: StoryFn = () => (
  <>
    <table>
      <thead>
        <td>type</td>
        <td>section</td>
      </thead>

      {Object.values(ActivitesTypes).map(activiteType => {
        return (
          <tr>
            <td>{activiteType.nom}</td>

            <td>
              <SectionsEdit
                completeUpdate={(complete, newContent) => {
                  completeUpdateAction(complete, newContent)
                }}
                sectionsWithValue={getSectionsWithValue(
                  activiteType.sections.map(section => {
                    if (isSubstancesFiscales(section)) {
                      return {
                        ...section,
                        elements: [SubstancesFiscale.auru].map(sf => {
                          const unite = Unites[sf.uniteId]
                          const element: DeepReadonly<ActiviteSectionElement> = {
                            id: sf.id,
                            nom: `${sf.nom}`,
                            type: 'number',
                            description: `<b>${unite.symbole} (${unite.nom})</b> ${sf.description}`,
                            uniteId: sf.uniteId,
                          }

                          return element
                        }),
                      }
                    }

                    return section
                  }),
                  {}
                )}
              />{' '}
            </td>
          </tr>
        )
      })}
    </table>
  </>
)
