import { PureEntreprise } from './entreprise'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date'
import { Entreprise, EntrepriseDocument, EntrepriseType, toDocumentId, newEntrepriseId } from 'camino-common/src/entreprise'
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
const creerEntrepriseAction = action('creerEntreprise')
const getEntrepriseDocumentsAction = action('getEntrepriseDocuments')
const getEntrepriseAction = action('getEntreprise')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const deleteEntrepriseDocumentAction = action('deleteEntrepriseDocument')

const annee = toCaminoAnnee('2023')

const entrepriseDocuments: EntrepriseDocument[] = [
  {
    id: toDocumentId(toCaminoDate('2019-08-26'), 'kbi', '12345678'),
    type_id: 'kbi',
    date: toCaminoDate('2019-08-26'),
    description: 'Kbis',
    can_delete_document: true,
  },
  {
    id: toDocumentId(toCaminoDate('2019-08-26'), 'idm', '12345678'),
    type_id: 'idm',
    date: toCaminoDate('2019-08-26'),
    description: 'Identification pelle mécanique',
    can_delete_document: false,
  },
]
const entreprise: EntrepriseType = {
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
  archive: false,
  titulaireTitres: [],
  amodiataireTitres: [],
  utilisateurs: [],
  etablissements: [],
}

const apiClient: EntrepriseApiClient = {
  getEntreprise: entrepriseId => {
    getEntrepriseAction(entrepriseId)
    return Promise.resolve(entreprise)
  },
  deleteEntrepriseDocument(entrepriseId, documentId) {
    deleteEntrepriseDocumentAction(entrepriseId, documentId)
    return Promise.resolve()
  },
  getEntrepriseDocuments: entrepriseId => {
    getEntrepriseDocumentsAction(entrepriseId)

    return Promise.resolve(entrepriseDocuments)
  },
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
  },
  creerEntreprise: siren => {
    creerEntrepriseAction(siren)
    return Promise.resolve()
  },
  creerEntrepriseDocument: (entrepriseId, document) => {
    creerEntrepriseDocumentAction(entrepriseId, document)
    return Promise.resolve(toDocumentId(document.date, document.typeId, '12345678'))
  },
}

export const Loading: StoryFn = () => <PureEntreprise currentYear={annee} entrepriseId={entreprise.id} apiClient={{ ...apiClient, getEntreprise: () => new Promise(() => ({})) }} user={null} />

export const NonConnecte: StoryFn = () => <PureEntreprise currentYear={annee} entrepriseId={entreprise.id} apiClient={apiClient} user={null} />

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
      dateDebut: toCaminoDate('2013-09-16'),
      dateFin: null,
    },
    {
      id: '',
      nom: 'Ancien établissement',
      dateDebut: toCaminoDate('2013-02-01'),
      dateFin: toCaminoDate('2013-09-15'),
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
}

export const Complet: StoryFn = () => (
  <PureEntreprise
    currentYear={annee}
    entrepriseId={completeEntreprise.id}
    apiClient={{
      ...apiClient,
      getEntreprise: entrepriseId => {
        getEntrepriseAction(entrepriseId)
        return Promise.resolve(completeEntreprise)
      },
      getFiscaliteEntreprise: data => {
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
      },
    }}
    user={{ role: 'super', ...testBlankUser }}
  />
)
