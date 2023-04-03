import { EntrepriseType, PureEntreprise } from './entreprise'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoAnnee } from 'camino-common/src/date'
import { Entreprise, newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { EntrepriseApiClient } from './entreprise/entreprise-api-client'

const meta: Meta = {
  title: 'Components/Entreprise',
  component: PureEntreprise,
}
export default meta

type Item = { id: string; titre: string }

const getFiscaliteEntrepriseAction = action('getFiscaliteEntreprise')
const modifierEntrepriseAction = action('modifierEntreprise')

const items: Item[] = [
  { id: 'id1', titre: 'titreItem1' },
  { id: 'id2', titre: 'titreItem2' },
  { id: 'id3', titre: 'titreItem3' },
]

const annee = toCaminoAnnee('2023')
const entreprise = {
  id: newEntrepriseId(''),
  nom: 'nom entreprise',
  telephone: 'telephone',
  email: 'email@entreprise.fr',
  legalSiren: 'siren',
  legalForme: 'forme',
  adresse: 'adresse',
  codePostal: 'code postal',
  commune: 'commune',
  url: 'http://urlentreprise',
  documents: [],
  archive: false,
  titulaireTitres: [],
  amodiataireTitres: [],
  utilisateurs: [],
  etablissements: [],
}

export const apiClient: EntrepriseApiClient = {
  getFiscaliteEntreprise: data => {
    getFiscaliteEntrepriseAction(data)
    return Promise.resolve({
      redevanceCommunale: 0,
      redevanceDepartementale: 0,
    })
  
},
modifierEntreprise: entreprise => {
  modifierEntrepriseAction(entreprise)
  return Promise.resolve()

}
}

export const Loading: Story = () => (
  <PureEntreprise
    currentYear={annee}
    entreprise={undefined}
    apiClient={apiClient}
    user={null}
  />
)

export const NonConnecte: Story = () => (
  <PureEntreprise
    currentYear={annee}
    entreprise={entreprise}
    apiClient={apiClient}
    user={null}
  />
)

const completeEntreprise: EntrepriseType = {
  id: newEntrepriseId('any'),
  nom: 'An Entreprise',
  legalSiren: 'SIREN',
  legalForme: 'SAS, société par actions simplifiée',
  adresse: '21 par ici',
  codePostal: '38240',
  commune: 'CETTE COMUNE',
  email: 'email',
  telephone: 'telephone',
  url: 'url',
  archive: false,
  etablissements: [
    {
      id: '',
      nom: 'Nouvel établissement',
      dateDebut: '2013-09-16',
      dateFin: null,
      legalSiret: 'SIRET',
    },
    {
      id: '',
      nom: 'Ancien établissement',
      dateDebut: '2013-02-01',
      dateFin: '2013-09-15',
      legalSiret: 'siret',
    },
  ],
  utilisateurs: [
    {
      id: 'anId',
      nom: 'Nom user',
      prenom: 'Prénon',
      email: 'email@plop.wu',
      entreprises: [
        {
          id: newEntrepriseId('1'),
          nom: 'Nom entreprise',
        },
      ] as Entreprise[],
      role: 'entreprise',
    },
    {
      id: 'anotherId',
      nom: 'Other user',
      prenom: 'Other prenom',
      email: 'anotheremail@nothing.wu',
      entreprises: [
        {
          id: 'fr-791652399',
          nom: 'Nom entreprise',
        },
      ] as Entreprise[],
      role: 'entreprise',
    },
  ],
  titulaireTitres: [
    {
      id: 'idTitre1',
      slug: 'slugTitre1',
      nom: 'titre 1 nom',
      typeId: 'arm',
      coordonnees: {
        x: -52.2567292479798,
        y: 4.21739209644104,
      },
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: null,
      activitesAbsentes: null,
      titulaires: [
        {
          id: '',
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          departementId: '973',
        },
      ],
    },
    {
      id: 'idTitre2',
      slug: 'slugtitre',
      nom: 'NomTitre',
      typeId: 'axm',
      coordonnees: {
        x: -52.501264330237845,
        y: 4.270507245123385,
      },
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: 0,
      activitesAbsentes: 0,
      titulaires: [
        {
          id: 'entrepriseId',
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          departementId: '973',
        },
      ],
      references: [
        {
          referenceTypeId: 'dea',
          nom: 'plop/toto',
        },
      ],
    },
    {
      id: 'idTitre3',
      slug: 'slug3',
      nom: 'Nom titre 3',
      typeId: 'arm',
      coordonnees: {
        x: -52.2331344122413,
        y: 4.225520523981365,
      },
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: null,
      activitesAbsentes: null,
      titulaires: [
        {
          id: 'idEntreprise',
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          departementId: '973',
        },
      ],
    },
  ],
  amodiataireTitres: [
    {
      id: 'idTitre3',
      slug: 'slug3',
      nom: 'Nom titre 3',
      typeId: 'arm',
      coordonnees: {
        x: -52.2331344122413,
        y: 4.225520523981365,
      },
      titreStatutId: 'ech',
      substances: ['auru'],
      activitesEnConstruction: null,
      activitesAbsentes: null,
      titulaires: [
        {
          id: 'idEntreprise',
          nom: 'Nom entreprise',
        },
      ],
      communes: [
        {
          departementId: '973',
        },
      ],
    },
  ],
  documents: [
    {
      id: 'idDocument',
      type: {
        id: 'kbi',
        nom: 'Kbis',
      },
      date: '2019-08-26',
      description: 'Kbis',
      fichier: true,
      fichierTypeId: 'pdf',
      entreprisesLecture: true,
      modification: true,
      suppression: true,
    },
    {
      id: 'idDocument2',
      type: {
        id: 'idm',
        nom: 'Identification de matériel',
      },
      date: '2019-08-26',
      description: 'Identification pelle mécanique',
      fichier: true,
      fichierTypeId: 'pdf',
      entreprisesLecture: true,
      modification: false,
      suppression: false,
    },
  ],
}

export const Complet: Story = () => (
  <PureEntreprise
    currentYear={annee}
    entreprise={completeEntreprise}
    apiClient={{...apiClient, getFiscaliteEntreprise: data => {
      getFiscaliteEntrepriseAction(data)
      return Promise.resolve({
        guyane: {
          taxeAurifere: 12,
          taxeAurifereBrute: 38,
          totalInvestissementsDeduits: 1,
        },
        redevanceCommunale: 200,
        redevanceDepartementale: 78,
      })
    }}}
    user={{ role: 'super', ...testBlankUser }}
  />
)
