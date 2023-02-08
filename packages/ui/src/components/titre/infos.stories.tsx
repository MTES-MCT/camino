import { Meta, Story } from '@storybook/vue3'
import { Infos, Props } from './infos'
import { TitreLink, TitreLinks } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Titre/Infos',
  component: Infos
}
export default meta

const titresTo: TitreLink[] = [{ id: 'id10', nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [{ id: 'id11', nom: 'Titre père' }]

const apiClient: Props['apiClient'] = {
  loadLinkableTitres: () => () => Promise.resolve([]),
  loadTitreLinks: () => Promise.resolve({ aval: titresTo, amont: titresFrom }),
  linkTitres: () =>
    new Promise<TitreLinks>(resolve =>
      resolve({ aval: titresTo, amont: titresFrom })
    )
}

export const Default: Story = () => (
  <Infos
    titre={{
      id: 'fakeId',
      typeId: 'arm',
      type: {
        sections: [
          {
            elements: [
              {
                id: 'mecanisation',
                nom: 'Mécanisation',
                description: 'Est-ce que c’est mécanisé'
              }
            ],
            id: 'arm'
          }
        ]
      },
      contenu: { arm: { mecanisation: true } },
      titreStatutId: 'val',
      demarches: [
        {
          id: 'oct',
          phase: {
            dateDebut: '2020-01-01',
            dateFin: '2022-01-01',
            phaseStatutId: 'ech'
          },
          type: { id: 'oct' }
        },
        {
          id: 'pro',
          phase: {
            dateDebut: '2022-01-01',
            dateFin: '2025-01-01',
            phaseStatutId: 'val'
          },
          type: { id: 'pro' }
        }
      ],
      administrations: ['ope-onf-973-01'],
      titulaires: [
        {
          id: 'entreprise1',
          nom: 'Entreprise 1',
          legalSiren: 'Entreprise 1 Siren',
          operateur: true
        },
        {
          id: 'entreprise2',
          nom: 'Entreprise 2',
          legalSiren: 'Entreprise 2 Siren',
          operateur: false
        }
      ],
      amodiataires: [
        {
          id: 'entreprise3',
          nom: 'Entreprise 3',
          legalSiren: 'Entreprise 3 Siren',
          operateur: false
        }
      ],
      substances: ['auru', 'scoc'],
      references: [{ nom: '2023/01', referenceTypeId: 'ifr' }]
    }}
    user={{ role: 'super', administrationId: undefined }}
    apiClient={apiClient}
  ></Infos>
)

export const Empty: Story = () => (
  <Infos
    titre={{
      id: 'fakeId',
      typeId: 'arm',
      type: {
        sections: []
      },
      contenu: {},
      titreStatutId: 'dmi',
      demarches: [],
      administrations: [],
      titulaires: [],
      amodiataires: [],
      substances: [],
      references: []
    }}
    user={{ role: 'super', administrationId: undefined }}
    apiClient={{
      loadLinkableTitres: () => () => Promise.resolve([]),
      loadTitreLinks: () => Promise.resolve({ aval: [], amont: [] }),
      linkTitres: () =>
        new Promise<TitreLinks>(resolve => resolve({ aval: [], amont: [] }))
    }}
  ></Infos>
)