import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { PureTitre } from './titre'
import { action } from '@storybook/addon-actions'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date'
import { Router } from 'vue-router'
import { ApiClient } from '@/api/api-client'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { TitreGet, TitreIdOrSlug, TitreLink, demarcheGetValidator, titreGetValidator, titreIdValidator, titreSlugValidator } from 'camino-common/src/titres'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { LinkableTitre } from './titre/titres-link-form-api-client'
import { demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Titre',
  // @ts-ignore en attente du support par @storybook/vue3
  component: PureTitre,
  decorators: [
    vueRouter([
      { name: 'titre' },
      { name: 'demarche' },
      { name: 'activites' },
      { name: 'administration' },
      { name: 'entreprise' },
      { name: 'etape-creation' },
      { name: 'etape-edition' },
      { name: 'journaux' },
    ]),
  ],
}
export default meta

const editTitreAction = action('editTitre')
const updateDemarcheAction = action('updateDemarche')
const createDemarcheAction = action('createDemarche')
const deleteDemarcheAction = action('deleteDemarche')
const removeTitreAction = action('removeTitre')
const getTitreAction = action('getTitreAction')
const deleteEtapeAction = action('deleteEtapeAction')
const deposerEtapeAction = action('deposerEtapeAction')
const getTitresWithPerimetreForCarteAction = action('getTitresWithPerimetreForCarteAction')
const routerPushAction = action('routerPushAction')
const routerReplaceAction = action('routerReplaceAction')
const loadTitreLinksAction = action('loadTitreLinksAction')
const loadLinkableTitresAction = action('loadLinkableTitresAction')
const getTitreUtilisateurAbonneAction = action('getTitreUtilisateurAbonneAction')
const titreUtilisateurAbonneAction = action('titreUtilisateurAbonneAction')
const linkTitresAction = action('linkTitresAction')
const date = toCaminoDate('2023-10-24')

type PropsApiClient = Pick<
  ApiClient,
  | 'getTitreById'
  | 'getTitresWithPerimetreForCarte'
  | 'deleteEtape'
  | 'deposeEtape'
  | 'loadTitreLinks'
  | 'loadLinkableTitres'
  | 'linkTitres'
  | 'titreUtilisateurAbonne'
  | 'getTitreUtilisateurAbonne'
  | 'editTitre'
  | 'removeTitre'
  | 'createDemarche'
  | 'updateDemarche'
  | 'deleteDemarche'
>
const routerPushMock: Pick<Router, 'push' | 'replace'> = {
  push: to => {
    routerPushAction(to)

    return Promise.resolve()
  },
  replace: to => {
    routerReplaceAction(to)

    return Promise.resolve()
  },
}

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

const titresTo: TitreLink[] = [{ id: titreIdValidator.parse('id10'), nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [linkableTitres[0]]

const demarcheSlug = demarcheSlugValidator.parse('slug-demarche-1')
const titre: TitreGet = {
  id: titreIdValidator.parse('id-du-titre'),
  nom: 'Nom du titre',
  slug: titreSlugValidator.parse('slug-du-titre'),
  titre_type_id: 'arm',
  titre_statut_id: 'val',

  references: [
    { nom: 'Duo', referenceTypeId: 'ifr' },
    { nom: '2012/12', referenceTypeId: 'deb' },
  ],
  titre_last_modified_date: toCaminoDate('2021-01-01'),
  titre_doublon: null,
  nb_activites_to_do: 2,
  demarches: [
    {
      id: demarcheIdValidator.parse('id-demarche-1'),
      demarche_type_id: 'oct',
      slug: demarcheSlug,
      demarche_date_debut: toCaminoDate('2019-01-01'),
      demarche_date_fin: toCaminoDate('2021-01-01'),
      demarche_statut_id: 'acc',
      ordre: 0,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      etapes: [
        {
          id: etapeIdValidator.parse('etapeId'),
          notes: null,
          slug: etapeSlugValidator.parse('etape-slug'),
          etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
          etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
          date,
          ordre: 1,
          decisions_annexes_contenu: {},
          decisions_annexes_sections: [],
          fondamentale: {
            date_debut: null,
            duree: null,
            date_fin: null,
            substances: [],
            titulaires: [{ id: entrepriseIdValidator.parse('id-entreprise1'), nom: 'Super titulaire', operateur: false }],
            amodiataires: [],
            perimetre: {
              geojsonMultiPolygon: {
                properties: null,
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [-53.58181013905019, 3.8309654861273],
                        [-53.58178306390299, 3.8219278216269807],
                        [-53.572785590706495, 3.82195493825841],
                        [-53.57281257175149, 3.8309926670647294],
                        [-53.58181013905019, 3.8309654861273],
                      ],
                    ],
                  ],
                },
              },
              surface: null,
              communes: [],
              sdom_zones: [],
              forets: [],
              secteurs_maritimes: [],
            },
          },
          sections_with_values: [],
          documents: [],
          entreprises_documents: [],
        },
      ],
    },
  ],
}

const apiClient: PropsApiClient = {
  editTitre: (...params) => {
    editTitreAction(params)

    return Promise.resolve()
  },
  deleteDemarche: (...params) => {
    deleteDemarcheAction(params)

    return Promise.resolve()
  },
  createDemarche: (...params) => {
    createDemarcheAction(params)

    return Promise.resolve(demarcheSlugValidator.parse('slug'))
  },
  updateDemarche: (...params) => {
    updateDemarcheAction(params)

    return Promise.resolve(demarcheSlugValidator.parse('slug'))
  },
  removeTitre: (...params) => {
    removeTitreAction(params)

    return Promise.resolve()
  },
  getTitreUtilisateurAbonne: (...params) => {
    getTitreUtilisateurAbonneAction(params)

    return Promise.resolve(true)
  },
  titreUtilisateurAbonne: (...params) => {
    titreUtilisateurAbonneAction(params)

    return Promise.resolve()
  },
  loadLinkableTitres:
    (...params) =>
    () => {
      loadLinkableTitresAction(params)

      return Promise.resolve([])
    },
  linkTitres: (...params) => {
    linkTitresAction(params)

    return Promise.resolve({ aval: [], amont: [] })
  },
  loadTitreLinks: titreId => {
    loadTitreLinksAction(titreId)

    return Promise.resolve({
      amont: [],
      aval: [],
    })
  },
  getTitresWithPerimetreForCarte: (...params) => {
    getTitresWithPerimetreForCarteAction(params)

    return Promise.resolve({
      elements: [
        {
          id: titreIdValidator.parse('id-du-titre-voisin'),
          nom: 'nom du titre',
          references: [],
          slug: titreSlugValidator.parse('slug-du-titre-voisin'),
          titreStatutId: TitresStatutIds.Valide,
          typeId: TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES,
          titulaires: [],
          geojsonMultiPolygon: {
            type: 'Feature',
            properties: {},

            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-53.57, 3.84],
                    [-53.56, 3.81],
                    [-53.565, 3.8309926670647294],
                    [-53.57, 3.84],
                  ],
                ],
              ],
            },
          },
        },
      ],
      total: 1,
    })
  },
  getTitreById: titreIdOrSlug => {
    getTitreAction(titreIdOrSlug)

    return Promise.resolve(titre)
  },

  deleteEtape: etapeId => {
    deleteEtapeAction(etapeId)

    return Promise.resolve()
  },

  deposeEtape: etapeId => {
    deposerEtapeAction(etapeId)

    return Promise.resolve()
  },
}

const currentDate = caminoDateValidator.parse('2024-01-09')

export const FullWithMapNoSnapshot: StoryFn = () => (
  <PureTitre currentDate={currentDate} currentDemarcheSlug={demarcheSlug} user={{ ...testBlankUser, role: 'super' }} router={routerPushMock} apiClient={apiClient} titreIdOrSlug={titre.id} />
)
export const Full: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlug}
    initTab="points"
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    titreIdOrSlug={titre.id}
  />
)

const chantePieApiClient: PropsApiClient = {
  ...apiClient,

  getTitreUtilisateurAbonne: (...params) => {
    getTitreUtilisateurAbonneAction(params)

    return Promise.resolve(false)
  },
  getTitreById: (titreIdOrSlug: TitreIdOrSlug) => {
    getTitreAction(titreIdOrSlug)

    // prettier-ignore
    const chantepieData = titreGetValidator.parse({"id":"Ju80kBYMoDstD5J6H8wqWRdo","nom":"Chantepie","slug":"m-cx-chantepie-1988","titre_type_id":"cxm","titre_statut_id":"val","titre_doublon":null,"references":[{"nom":"2013-0224-MI","referenceTypeId":"deb"}],"titre_last_modified_date":"2023-10-12","demarches":[{"id":"PpD4be1fwbWJ7TZCdwvZj0vQ","slug":"m-cx-chantepie-1988-oct01","description":null,"etapes":[{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":null,"duree":600,"substances":["auru","arge","cuiv","ferx","plom","souf","zinc","scoc"],"titulaires":[{"id":"fr-632022711","nom":"ELF AQUITAINE PRODUCTION","operateur":false}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-0.105658320330431,48.1489209342693],[-0.115003633563279,48.1398379979624],[-0.0996023094257926,48.1209828190687],[-0.0852402595925762,48.1212930049111],[-0.0616864580218711,48.1486971325525],[-0.105658320330431,48.1489209342693]]]]},"properties":null},"surface":8,"communes":[{"id":"72256","nom":"Rouez"},{"id":"72351","nom":"Tennie"}],"secteurs_maritimes":[],"sdom_zones":[],"forets":[]}},"etape_statut_id":"acc","date":"1988-09-01","id":"OxqtxQwW0B3AUIHFR7k32Ycl","ordre":2,"notes":null,"slug":"m-cx-chantepie-1988-oct01-dpu01","sections_with_values":[{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000000681488"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"INDE8800659D"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":600,"substances":["auru","arge","cuiv","ferx","plom","souf","zinc","scoc"],"titulaires":[{"id":"fr-632022711","nom":"ELF AQUITAINE PRODUCTION","operateur":false}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-0.105658320330431,48.1489209342693],[-0.115003633563279,48.1398379979624],[-0.0996023094257926,48.1209828190687],[-0.0852402595925762,48.1212930049111],[-0.0616864580218711,48.1486971325525],[-0.105658320330431,48.1489209342693]]]]},"properties":null},"surface":8,"communes":[{"id":"72256","nom":"Rouez"},{"id":"72351","nom":"Tennie"}],"secteurs_maritimes":[],"sdom_zones":[],"forets":[]}},"etape_statut_id":"acc","date":"1988-08-24","id":"XkNmBmjc6YYY6OEncdCAldnU","ordre":1,"notes":null,"slug":"m-cx-chantepie-1988-oct01-dex01","sections_with_values":[{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"oct","demarche_statut_id":"acc","demarche_date_debut":"1988-09-01","demarche_date_fin":"2038-09-01","ordre":1},{"id":"mkPvJYXFO2InPppXamCRo2Cv","slug":"m-cx-chantepie-1988-mut01","description":null,"etapes":[{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":[],"titulaires":[{"id":"fr-409160132","nom":"TOTALENERGIES EP FRANCE (TEPF)","operateur":false}],"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2000-06-06","id":"lc3diJKRphb029ufvF73FlSn","ordre":2,"notes":null,"slug":"m-cx-chantepie-1988-mut01-dpu01","sections_with_values":[{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000000765254"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"ECOI0000251A"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":[],"titulaires":[{"id":"fr-409160132","nom":"TOTALENERGIES EP FRANCE (TEPF)","operateur":false}],"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2000-05-25","id":"2n1RaQcCxZMVta2Qfv1pUIRS","ordre":1,"notes":null,"slug":"m-cx-chantepie-1988-mut01-dex01","sections_with_values":[{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"mut","demarche_statut_id":"acc","demarche_date_debut":null,"demarche_date_fin":null,"ordre":2}],"nb_activites_to_do":null})
    chantepieData.nom = 'Chantepie avec un titre assez long'
    chantepieData.nb_activites_to_do = 2

    return Promise.resolve(chantepieData)
  },
}

export const ChantepieOctroi: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-cx-chantepie-1988-oct01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'admin', administrationId: 'min-mtes-dgaln-01' }}
    router={routerPushMock}
    apiClient={chantePieApiClient}
    titreIdOrSlug={titre.id}
  />
)

export const ChantepieOctroiAsEntreprise: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-cx-chantepie-1988-oct01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('fr-409160132') }] }}
    router={routerPushMock}
    apiClient={chantePieApiClient}
    titreIdOrSlug={titre.id}
  />
)

export const ChantepieMutation: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-cx-chantepie-1988-mut01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={chantePieApiClient}
    titreIdOrSlug={titre.id}
  />
)

const criqueAdolpheApiClient: PropsApiClient = {
  ...apiClient,
  getTitreById: (titreIdOrSlug: TitreIdOrSlug) => {
    getTitreAction(titreIdOrSlug)

    // prettier-ignore
    const criqueAdolpheData = titreGetValidator.parse({"id":"tbFvGIDboAzxTb54GQyghTyc","nom":"Crique Adolphe","slug":"m-ar-crique-adolphe-2023","titre_type_id":"arm","titre_statut_id":"val","titre_doublon":null,"references":[{"nom":"2022-032","referenceTypeId":"ptm"},{"nom":"AR 2022-027","referenceTypeId":"onf"}],"titre_last_modified_date":"2023-10-20","demarches":[{"id":"yAvBOMdHDsyES7phbS5hRKLA","slug":"m-ar-crique-adolphe-2023-oct01","description":null,"etapes":[{"etape_type_id":"sco","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":null,"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"fai","date":"2023-09-19","id":"5649942721fd9f3478381ae9","ordre":16,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-sco01","sections_with_values":[{"id":"suivi","nom":"Suivi de la démarche","elements":[{"id":"signataire","nom":"Signataire ONF","description":"Prénom et nom du représentant légal du titulaire de l'ONF","optionnel":true,"type":"text","value":null},{"id":"titulaire","nom":"Signataire titulaire","description":"Prénom et nom du représentant légal du titulaire de l'autorisation","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"aca","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":null,"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"fav","date":"2023-01-11","id":"oXXG5ToIYbw8MvdYPX7sMMAP","ordre":12,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-aca01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"sca","etape_statut_id":"fai","date":"2023-01-11","id":"WLXKWB9Fv17gm2gTJYIXnTyX","ordre":11,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-sca01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"rde","etape_statut_id":"fav","date":"2022-12-29","id":"y0SCXGJ1OBYSthcWyojyOLZX","ordre":9,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-rde01","sections_with_values":[{"id":"deal","nom":"DEAL","elements":[{"id":"numero-dossier-deal-eau","nom":"Numéro de dossier","description":"Numéro de dossier DEAL Service eau","optionnel":true,"type":"text","value":""},{"id":"numero-recepisse","nom":"Numéro de récépissé","description":"Numéro de récépissé émis par la DEAL Service eau","optionnel":true,"type":"text","value":"R03-2022-12-29-00005"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mcr","etape_statut_id":"fav","date":"2022-12-05","id":"0vdB4jaJbpIpyUnIZkKPsmCm","ordre":7,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-mcr01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mfr","fondamentale":{"date_debut":null,"date_fin":null,"duree":4,"substances":["auru"],"titulaires":[{"id":"fr-794312231","nom":"SOCIETE MINIERE DE L OUEST (S.M.O)","operateur":false}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.58181013905019,3.8309654861273],[-53.58178306390299,3.8219278216269807],[-53.572785590706495,3.82195493825841],[-53.57281257175149,3.8309926670647294],[-53.58181013905019,3.8309654861273]]],[[[-53.60031408473134,3.8224780986447566],[-53.59891645305842,3.8181831495446303],[-53.58181205656814,3.82379854768971],[-53.58320964990986,3.828093576227541],[-53.60031408473134,3.8224780986447566]]],[[[-53.583861926103765,3.8502114455117433],[-53.592379712320195,3.834289122043602],[-53.588417035915334,3.8321501920354253],[-53.57989914401643,3.8480725119510217],[-53.583861926103765,3.8502114455117433]]]]},"properties":null},"surface":3,"communes":[{"id":"97353","nom":"Maripasoula"}],"secteurs_maritimes":[],"sdom_zones":[],"forets":[]}},"etape_statut_id":"fai","date":"2022-11-08","id":"pwqOEAsAmaWi0o24QiVeVZ40","ordre":3,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-mfr01","sections_with_values":[{"id":"arm","nom":"Caractéristiques ARM","elements":[{"id":"mecanise","nom":"Prospection mécanisée","description":"","type":"radio","value":true},{"id":"franchissements","nom":"Franchissements de cours d'eau","description":"Nombre de franchissements de cours d'eau","optionnel":true,"type":"integer","value":12}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mdp","etape_statut_id":"fai","date":"2022-11-08","id":"pF4UG6UrCOJmKjtgmtpwthTQ","ordre":4,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-mdp01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dae","etape_statut_id":"exe","date":"2022-09-26","id":"KA7tyvIdlqQmmVOuVjEl0Hdt","ordre":1,"notes":null,"slug":"m-ar-crique-adolphe-2023-oct01-dae01","sections_with_values":[{"id":"mea","nom":"Mission autorité environnementale","elements":[{"id":"arrete","nom":"Arrêté préfectoral","description":"Numéro de l'arrêté préfectoral portant décision dans le cadre de l’examen au cas par cas du projet d’autorisation de recherche minière","optionnel":true,"type":"text","value":"R03-2022-09-26-00002"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"oct","demarche_statut_id":"acc","demarche_date_debut":"2023-09-19","demarche_date_fin":"2024-01-19","ordre":1}],"nb_activites_to_do":null})
    criqueAdolpheData.nb_activites_to_do = 0

    return Promise.resolve(criqueAdolpheData)
  },
}

export const CriqueAdolpheOctroi: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-ar-crique-adolphe-2023-oct01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={criqueAdolpheApiClient}
    titreIdOrSlug={titre.id}
  />
)

const abattisKoticaApiClient: PropsApiClient = {
  ...apiClient,
  getTitreById: (titreIdOrSlug: TitreIdOrSlug) => {
    getTitreAction(titreIdOrSlug)

    // prettier-ignore
    const abattisData = titreGetValidator.parse({"id":"ooyCY2eGMXLunjmwPbBYyQcf","nom":"Abattis Kotika","slug":"m-ar-abattis-kotika-2006","titre_type_id":"arm","titre_statut_id":"ech","titre_doublon":null,"references":[{"nom":"AR2006060","referenceTypeId":"onf"},{"nom":"2006-061","referenceTypeId":"ptm"}],"titre_last_modified_date":null,"demarches":[{"id":"SjKhYLXdqcla1BaN3nmgQhPs","slug":"m-ar-abattis-kotika-2006-oct01","description":null,"etapes":[{"etape_type_id":"sco","fondamentale":{"date_debut":null,"date_fin":"2007-03-27","duree":4,"substances":["auru"],"titulaires":[{"id":"fr-480857036","nom":"TOMANY","operateur":false}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-54.256565011133,3.95310428827045],[-54.2571944444789,3.94846823388004],[-54.2392714613677,3.9464520807474],[-54.2387665564076,3.95076254570704],[-54.256565011133,3.95310428827045]]],[[[-54.251541223062,3.94479622927321],[-54.251001625524,3.94017377611083],[-54.2330489949186,3.94209562569541],[-54.2335613570663,3.94667311503072],[-54.251541223062,3.94479622927321]]]]},"properties":null},"surface":2,"communes":[{"id":"97362","nom":"Papaichton"}],"secteurs_maritimes":[],"sdom_zones":["0_potentielle","2"],"forets":[]}},"etape_statut_id":"fai","date":"2006-11-28","id":"1iF8kbcg0oGaEMAJxgUZYk8W","ordre":6,"notes":null,"slug":"m-ar-abattis-kotika-2006-oct01-sco01","sections_with_values":[{"id":"arm","nom":"Caractéristiques ARM","elements":[{"id":"mecanise","nom":"Prospection mécanisée","type":"radio","value":null}]},{"id":"suivi","nom":"Suivi de la démarche","elements":[{"id":"signataire","nom":"Signataire ONF","description":"Prénom et nom du représentant légal du titulaire de l'ONF","optionnel":true,"type":"text","value":"Michel Borderes"},{"id":"titulaire","nom":"Signataire titulaire","description":"Prénom et nom du représentant légal du titulaire de l'autorisation","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"def","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":[],"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2006-11-28","id":"Pw734o5mdB2K2AWaOKQ85Ydz","ordre":5,"notes":null,"slug":"m-ar-abattis-kotika-2006-oct01-def01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"men","etape_statut_id":"fai","date":"2006-10-16","id":"TMWQQo20x3j7BJ8Sboaq1B20","ordre":2,"notes":null,"slug":"m-ar-abattis-kotika-2006-oct01-men01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"oct","demarche_statut_id":"acc","demarche_date_debut":"2006-11-28","demarche_date_fin":"2007-03-27","ordre":1}],"nb_activites_to_do":null})
    abattisData.nb_activites_to_do = 0

    return Promise.resolve(abattisData)
  },
}

export const AbattisKoticaOctroi: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-ar-abattis-kotika-2006-oct01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'defaut' }}
    router={routerPushMock}
    apiClient={abattisKoticaApiClient}
    titreIdOrSlug={titre.id}
  />
)

const bonEspoirApiClient: PropsApiClient = {
  ...apiClient,
  getTitreById: (titreIdOrSlug: TitreIdOrSlug) => {
    getTitreAction(titreIdOrSlug)

    // prettier-ignore
    const bonEspoirData = titreGetValidator.parse({"id":"sJorD6pQomXTN7oRpyGwLijB","nom":"Bon Espoir","slug":"m-pr-bon-espoir-2001","titre_type_id":"prm","titre_statut_id":"ech","titre_doublon":null,"references":[{"nom":"21/2001","referenceTypeId":"dea"},{"nom":"2013-0033-MI","referenceTypeId":"deb"}],"titre_last_modified_date":"2023-11-30","demarches":[{"id":"ry8fHgRWiKEOE1x1ZANmajh8","slug":"m-pr-bon-espoir-2001-oct01","description":null,"etapes":[{"etape_type_id":"dpu","fondamentale":{"date_debut":"2001-11-01","date_fin":null,"duree":60,"substances":["auru","scoc"],"titulaires":null,"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.9579321010744,5.07776938770113],[-53.9575232150351,4.98735333700249],[-53.8673626701318,4.98775355007457],[-53.8672265271601,4.95631734759459],[-53.7770631139658,4.95670276466037],[-53.7769878916108,4.93868722476635],[-53.5698730075868,4.93952315477954],[-53.5702069576163,5.02537608911083],[-53.759383911755,5.02460196044417],[-53.7596128864516,5.07864912381548],[-53.9579321010744,5.07776938770113]]]]},"properties":null},"surface":465.5,"communes":[{"id":"97306","nom":"Mana"},{"id":"97311","nom":"Saint-Laurent-du-Maroni"}],"secteurs_maritimes":[],"sdom_zones":["0","2"],"forets":["LDD","MDF","PAUL"]}},"etape_statut_id":"acc","date":"2001-10-26","id":"CRVhvEIQAc319vUd8BfZoH5W","ordre":2,"notes":null,"slug":"m-pr-bon-espoir-2001-oct01-dpu01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":3201430},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":"EUR"}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000000774145"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"ECOI0100462D"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":[],"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2001-10-24","id":"Ce4K8goEZzjqXRJLL051jcpD","ordre":1,"notes":null,"slug":"m-pr-bon-espoir-2001-oct01-dex01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[{"id":"2001-10-24-dec-cdc61459","description":"Décret du 24 octobre 2001 accordant un permis de recherches A en Guyane","document_type_id":"dec","public_lecture":true,"entreprises_lecture":true}],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"oct","demarche_statut_id":"acc","demarche_date_debut":"2001-11-01","demarche_date_fin":"2006-11-01","ordre":1},{"id":"PnFewl8P4Zt5Vm49zXqyn7Ml","slug":"m-pr-bon-espoir-2001-pr101","description":null,"etapes":[{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":["auru"],"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2010-03-02","id":"qtn2a3DNPx258VZgSjqXGKf6","ordre":4,"notes":null,"slug":"m-pr-bon-espoir-2001-pr101-dpu02","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":560000},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":"EUR"}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000021889053"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"DEVO1003938A"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":[],"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2010-02-17","id":"tjOMgkb83wksMc6DFuqrecbu","ordre":3,"notes":null,"slug":"m-pr-bon-espoir-2001-pr101-dex02","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[{"id":"2010-02-17-arr-a26ea089","description":"Arrêté du 17 février 2010 modifiant l'arrêté du 6 mai 2009 prolongeant la validité du permis exclusif de recherches de mines d'or dit « Permis de Bon Espoir » et réduisant sa surface (Guyane)","document_type_id":"arr","public_lecture":true,"entreprises_lecture":true}],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":"2011-10-31","duree":null,"substances":["auru"],"titulaires":null,"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.9577777777778,5.07666666666667],[-53.9575,5.0325],[-53.8944444444444,5.00055555555556],[-53.8208333333333,4.97972222222222],[-53.7138888888889,4.96388888888889],[-53.7322222222222,5.02361111111111],[-53.8763888888889,5.02277777777778],[-53.9577777777778,5.07666666666667]]]]},"properties":null},"surface":122.275,"communes":[{"id":"97306","nom":"Mana"},{"id":"97311","nom":"Saint-Laurent-du-Maroni"}],"secteurs_maritimes":[],"sdom_zones":["0","2"],"forets":["LDD","PAUL"]}},"etape_statut_id":"acc","date":"2009-05-16","id":"07cbyPCYcOtKYkw4kOqg2Sed","ordre":2,"notes":null,"slug":"m-pr-bon-espoir-2001-pr101-dpu01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":837000},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":"EUR"}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000020616467"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"DEVO0909004A"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":[],"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2009-05-06","id":"orsPMmIfX4kSgVus0HTrBxAo","ordre":1,"notes":null,"slug":"m-pr-bon-espoir-2001-pr101-dex01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[{"id":"2009-05-06-arr-54f88e41","description":"Arrêté du 6 mai 2009 prolongeant la validité du permis exclusif de recherches de mines d'or dit « Permis Bon Espoir » et réduisant sa superficie (Guyane)","document_type_id":"arr","public_lecture":true,"entreprises_lecture":true}],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"pr1","demarche_statut_id":"acc","demarche_date_debut":"2006-11-01","demarche_date_fin":"2011-10-31","ordre":2},{"id":"EMFAv33wlGqMcjd6DwKzQBvr","slug":"m-pr-bon-espoir-2001-pr201","description":null,"etapes":[{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":"2016-10-31","duree":60,"substances":["auru","scoc"],"titulaires":[{"id":"fr-401802863","nom":"ARMINA RESSOURCES MINIERES SARL","operateur":false}],"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2015-08-15","id":"Qp5DRYEN3Nc9n4CIwEYW7evs","ordre":9,"notes":null,"slug":"m-pr-bon-espoir-2001-pr201-dpu01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":1250000},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":"EUR"}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000031053068"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"EINL1518062A"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":60,"substances":["auru","scoc"],"titulaires":[{"id":"fr-401802863","nom":"ARMINA RESSOURCES MINIERES SARL","operateur":false}],"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2015-08-03","id":"ABvgimvovFWeEhoMOrKi4wAy","ordre":8,"notes":null,"slug":"m-pr-bon-espoir-2001-pr201-dex01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[{"id":"2015-08-03-arm-8bf71a65","description":"Arrêté du 3 août 2015 prolongeant la durée de validité du permis exclusif de recherches de mines d'or et de substances connexes dit « Permis de Bon Espoir » attribué à la société Armina Ressources Minières dans le département de Guyane","document_type_id":"arm","public_lecture":true,"entreprises_lecture":true}],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mdp","etape_statut_id":"fai","date":"2011-06-30","id":"nLXaR7H78V43GB47ypDoqvKz","ordre":2,"notes":null,"slug":"m-pr-bon-espoir-2001-pr201-mdp01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mfr","fondamentale":{"date_debut":null,"date_fin":null,"duree":60,"substances":["auru","arge","cuiv"],"titulaires":[{"id":"fr-401802863","nom":"ARMINA RESSOURCES MINIERES SARL","operateur":false}],"amodiataires":null,"perimetre":null},"etape_statut_id":"fai","date":"2011-06-29","id":"iV47juaOeL4EAUsOqiWN6gOO","ordre":1,"notes":null,"slug":"m-pr-bon-espoir-2001-pr201-mfr01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"pr2","demarche_statut_id":"acc","demarche_date_debut":"2011-10-31","demarche_date_fin":"2016-10-31","ordre":3}],"nb_activites_to_do":null})
    bonEspoirData.nb_activites_to_do = 0
    // prettier-ignore
    bonEspoirData.demarches.push(demarcheGetValidator.parse({ "id": "idtravaux", "ordre": 4, "slug": "m-pr-bon-espoir-2001-dam01", "description": null, "etapes": [{"etape_type_id": "wpo", "ordre": 4,notes: null, "etape_statut_id": "acc","date": "2012-07-23",	"id": "idEtapeTravaux1","slug": "m-pr-bon-espoir-2001-dam01-wpo01","sections_with_values": [],"entreprises_documents": [],"documents": [{"id": "2012-07-23-apd-607c3aa8","description": "N°2012-SPR-DRMSS-1","document_type_id": "apd","public_lecture": false,"entreprises_lecture": false	}],"decisions_annexes_contenu": null,"decisions_annexes_sections": null},	{"etape_type_id": "wpp", "ordre": 3,notes: null,"etape_statut_id": "fai","date": "2011-05-04","id": "idEtapeTravaux2","slug": "m-pr-bon-espoir-2001-dam01-wpp01","sections_with_values": [],"entreprises_documents": [],"documents": [{"id": "id_Document","description": "","document_type_id": "apu","public_lecture": false,"entreprises_lecture": false	}],"decisions_annexes_contenu": null,"decisions_annexes_sections": null},	{"etape_type_id": "wfd", "ordre": 2,notes: null, "etape_statut_id": "fai","date": "2010-10-01","id": "idEtapeTravaux3","slug": "m-pr-bon-espoir-2001-dam01-wfd01","sections_with_values": [],"entreprises_documents": [],"documents": [],"decisions_annexes_contenu": null,"decisions_annexes_sections": null},	{"etape_type_id": "wre","ordre": 1,notes: null,"etape_statut_id": "fav","date": "2010-10-01","id": "idEtapeTravaux4","slug": "m-pr-bon-espoir-2001-dam01-wre01","sections_with_values": [],"entreprises_documents": [],"documents": [],"decisions_annexes_contenu": null,"decisions_annexes_sections": null}],"demarche_type_id": "dam","demarche_statut_id": "fpm","demarche_date_debut": null,"demarche_date_fin": null


  }))
    // prettier-ignore
    bonEspoirData.demarches.push(demarcheGetValidator.parse({"id":"KxHulLhT5XtziPhZDWpFuyA9", "ordre": 5, "slug":"m-pr-bon-espoir-2001-vct01","description":null,"etapes":[{"etape_type_id":"mcr","etape_statut_id":"fav","date":"2017-08-07","id":"OOKaEetpmAhDX17hcLEFWTZ1","ordre":4,notes: null,"slug":"m-pr-bon-espoir-2001-vct01-mcr01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mdp","etape_statut_id":"fai","date":"2016-11-07","id":"fNt0G9CmdMc6iIG9x239wZ5E","ordre":2,notes: null,"slug":"m-pr-bon-espoir-2001-vct01-mdp01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mfr","fondamentale":{"date_debut":null,"date_fin":null,"duree":180,"substances":["auru","scoc"],"titulaires":[{"id":"fr-401802863","nom":"ARMINA RESSOURCES MINIERES SARL","operateur":false}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.95781742722346,5.076877972864504],[-53.95761604147164,5.032517695391918],[-53.894654620091046,5.000735152488521],[-53.82094960753945,4.97999409410299],[-53.71414492282594,4.963998224562106],[-53.73241245985785,5.023653513799631],[-53.87657715038456,5.023033474690702],[-53.95781742722346,5.076877972864504]]]]},"properties":null},"surface":122.275,"communes":[{"id":"97311","nom":"Saint-Laurent-du-Maroni"},{"id":"97306","nom":"Mana"}],"secteurs_maritimes":[],"sdom_zones":["0","2"],"forets":["LDD","PAUL"]}},"etape_statut_id":"fai","date":"2016-10-28","id":"VqBn5DzAtcMQWFY0CIiO6X1A","ordre":1,notes: null,"slug":"m-pr-bon-espoir-2001-vct01-mfr01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"vct","demarche_statut_id":"ins","demarche_date_debut":"2016-10-31","demarche_date_fin":null}))

    return Promise.resolve(bonEspoirData)
  },
}

export const BonEspoirOctroi: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-pr-bon-espoir-2001-oct01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('fr-401802863') }] }}
    router={routerPushMock}
    apiClient={bonEspoirApiClient}
    titreIdOrSlug={titre.id}
  />
)

export const BonEspoirProlongation2: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-pr-bon-espoir-2001-pr201')}
    initTab="points"
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('fr-401802863') }] }}
    router={routerPushMock}
    apiClient={bonEspoirApiClient}
    titreIdOrSlug={titre.id}
  />
)

export const BonEspoirTravaux: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-pr-bon-espoir-2001-dam01')}
    initTab="points"
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('fr-401802863') }] }}
    router={routerPushMock}
    apiClient={bonEspoirApiClient}
    titreIdOrSlug={titre.id}
  />
)

const basseManaApiClient: PropsApiClient = {
  ...apiClient,
  getTitreById: (titreIdOrSlug: TitreIdOrSlug) => {
    getTitreAction(titreIdOrSlug)

    // prettier-ignore
    const basseManaData = titreGetValidator.parse({"id":"ORKjSbwrb87xE53MsYClV8OF","nom":"Basse Mana","slug":"m-pr-basse-mana-2018","titre_type_id":"prm","titre_statut_id":"mod","titre_doublon":null,"references":[{"nom":"22/2018","referenceTypeId":"dea"},{"nom":"2016-0010-MI","referenceTypeId":"deb"}],"titre_last_modified_date":"2023-12-19","demarches":[{"id":"GnIerujOWqlS3U06Xcbc1Dr0","slug":"m-pr-basse-mana-2018-oct01","description":null,"etapes":[{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":null,"duree":36,"substances":["tant","niob","lith","bery","etai","wolf","tita","auru"],"titulaires":[{"id":"fr-790856850","nom":"SUDMINE","operateur":true}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.699125239725,5.29137675727333],[-53.735659753333,5.24333287037071],[-53.6847736578144,5.232646225266],[-53.664223513371,5.23752353831223],[-53.6554344678131,5.25034817283726],[-53.6402449164671,5.25044876137938],[-53.6331053301638,5.26979119871868],[-53.6650166925488,5.27353207619541],[-53.699125239725,5.29137675727333]]]]},"properties":null},"surface":48,"communes":[{"id":"97306","nom":"Mana"}],"secteurs_maritimes":[],"sdom_zones":["2"],"forets":["BSM"]}},"etape_statut_id":"acc","date":"2018-09-11","id":"ooH6ZbECJPcDPFsE0McnKvUm","ordre":9,"notes":null,"slug":"m-pr-basse-mana-2018-oct01-dpu01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":150000},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":"EUR"}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"JORFTEXT000037382008"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"ECOL1816264A"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":36,"substances":["tant","niob","lith","bery","etai","wolf","tita","auru"],"titulaires":[{"id":"fr-790856850","nom":"SUDMINE","operateur":true}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.699125239725,5.29137675727333],[-53.735659753333,5.24333287037071],[-53.6847736578144,5.232646225266],[-53.664223513371,5.23752353831223],[-53.6554344678131,5.25034817283726],[-53.6402449164671,5.25044876137938],[-53.6331053301638,5.26979119871868],[-53.6650166925488,5.27353207619541],[-53.699125239725,5.29137675727333]]]]},"properties":null},"surface":48,"communes":[{"id":"97306","nom":"Mana"}],"secteurs_maritimes":[],"sdom_zones":["2"],"forets":["BSM"]}},"etape_statut_id":"acc","date":"2018-08-31","id":"KJtV68vswF5ewUyF2jTuLGhS","ordre":8,"notes":null,"slug":"m-pr-basse-mana-2018-oct01-dex01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":150000},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":"EUR"}]},{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":"JORFTEXT000037382008"},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":"ECOL1816264A"}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mdp","etape_statut_id":"fai","date":"2016-08-28","id":"qVJM9zS6hWyIr3My5OoubQA3","ordre":2,"notes":null,"slug":"m-pr-basse-mana-2018-oct01-mdp01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mfr","fondamentale":{"date_debut":null,"date_fin":null,"duree":36,"substances":["tant","niob","scoc"],"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"fai","date":"2016-06-19","id":"abABihashClZP0lL3NUPELNV","ordre":1,"notes":null,"slug":"m-pr-basse-mana-2018-oct01-mfr01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"oct","demarche_statut_id":"acc","demarche_date_debut":"2018-09-11","demarche_date_fin":"2021-09-11","ordre":1},{"id":"mZAUVvPyznbzpj3e3grjFmlJ","slug":"m-pr-basse-mana-2018-pr101","description":null,"etapes":[{"etape_type_id":"rpu","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":null,"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"fai","date":"2023-11-17","id":"f76c17ab21ca966988390d92","ordre":11,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-rpu01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dpu","fondamentale":{"date_debut":null,"date_fin":null,"duree":null,"substances":null,"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2023-11-15","id":"71f6497117b21325d53d8e56","ordre":10,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-dpu01","sections_with_values":[{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":false,"type":"text","value":"Texte 3 sur 160"}]}],"entreprises_documents":[],"documents":[{"id":"2023-11-15-pub-4d420801","description":"","document_type_id":"pub","public_lecture":true,"entreprises_lecture":true}],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"dex","fondamentale":{"date_debut":null,"date_fin":null,"duree":30,"substances":null,"titulaires":null,"amodiataires":null,"perimetre":null},"etape_statut_id":"acc","date":"2023-11-07","id":"590f6dd2f808eeadf51b820e","ordre":9,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-dex01","sections_with_values":[{"id":"publication","nom":"Références Légifrance","elements":[{"id":"jorf","nom":"Numéro JORF","description":"","optionnel":true,"type":"text","value":null},{"id":"nor","nom":"Numéro NOR","description":"","optionnel":true,"type":"text","value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"ppc","etape_statut_id":"ter","date":"2023-04-14","id":"da4a6c74690a6d1ef01ddde2","ordre":6,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-ppc01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"ppu","etape_statut_id":"fai","date":"2023-03-27","id":"M1mK0vhAHH5CTaUwq4cJzK49","ordre":5,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-ppu01","sections_with_values":[{"id":"opdp","elements":[{"id":"lien","nom":"Lien public externe","description":"","optionnel":true,"type":"url","value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mfr","fondamentale":{"date_debut":null,"date_fin":null,"duree":60,"substances":["tant","niob","lith","bery","etai","wolf","tita","auru"],"titulaires":[{"id":"fr-790856850","nom":"SUDMINE","operateur":false}],"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.699150462397206,5.291394409468797],[-53.73568497160258,5.2433505257409125],[-53.684798879087204,5.232663883719148],[-53.664248736219285,5.2375411971227654],[-53.65545969176547,5.250365830767107],[-53.64027014144058,5.250466419912988],[-53.633130556393525,5.269808855679936],[-53.66511918689031,5.291623119512839],[-53.699150462397206,5.291394409468797]]]]},"properties":null},"surface":null,"communes":[{"id":"97306","nom":"Mana"}],"secteurs_maritimes":[],"sdom_zones":["2"],"forets":["BSM"]}},"etape_statut_id":"fai","date":"2021-04-30","id":"NKW0jIKc5cPBIp2dwu2VceCG","ordre":1,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-mfr01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mdp","etape_statut_id":"fai","date":"2021-04-30","id":"wFb34sxGyHoRNOByPffQZyAF","ordre":2,"notes":null,"slug":"m-pr-basse-mana-2018-pr101-mdp01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"pr1","demarche_statut_id":"acc","demarche_date_debut":"2021-09-11","demarche_date_fin":"2024-03-11","ordre":2},{"id":"5df48d3536a38dd1dab542d7","slug":"m-pr-basse-mana-2018-pr201","description":"","etapes":[{"etape_type_id":"mfr","fondamentale":{"date_debut":null,"date_fin":null,"duree":60,"substances":["tant","niob","lith","bery","etai","wolf","tita","auru"],"titulaires":null,"amodiataires":null,"perimetre":{"geojsonMultiPolygon":{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-53.695977302723314,5.258026897118486],[-53.69166175320614,5.243894120712839],[-53.691207934852734,5.238962048893827],[-53.66947244758239,5.236434510036549],[-53.66426676493007,5.2375411203489115],[-53.655468706369525,5.250365792413383],[-53.64027010339901,5.25045738302719],[-53.63422022259896,5.267391338838475],[-53.64933956522329,5.274005464773927],[-53.66943759690406,5.2748050575845875],[-53.66988205803166,5.281761503749559],[-53.671594626284566,5.281690874443703],[-53.67432345044184,5.276844434310086],[-53.67742349010169,5.274481516415551],[-53.68523182828244,5.270616251350751],[-53.695977302723314,5.258026897118486]]]]},"properties":null},"surface":20.69,"communes":[{"id":"97306","nom":"Mana"}],"secteurs_maritimes":[],"sdom_zones":["2"],"forets":["BSM"]}},"etape_statut_id":"fai","date":"2023-10-30","id":"47a22a6ca44891d40e2f4149","ordre":1,"notes":null,"slug":"m-pr-basse-mana-2018-pr201-mfr01","sections_with_values":[{"id":"prx","nom":"Propriétés du permis exclusif de recherches","elements":[{"id":"engagement","nom":"Engagement","optionnel":true,"type":"number","value":null},{"id":"engagementDeviseId","nom":"Devise de l'engagement","description":"","optionnel":true,"type":"select","options":[{"id":"EUR","nom":"Euros"},{"id":"FRF","nom":"Francs"},{"id":"XPF","nom":"Francs Pacifique"}],"value":null}]}],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null},{"etape_type_id":"mdp","etape_statut_id":"fai","date":"2023-10-30","id":"37a1752da216067fc73328f9","ordre":2,"notes":null,"slug":"m-pr-basse-mana-2018-pr201-mdp01","sections_with_values":[],"entreprises_documents":[],"documents":[],"decisions_annexes_contenu":null,"decisions_annexes_sections":null}],"demarche_type_id":"pr2","demarche_statut_id":"dep","demarche_date_debut":"2024-03-11","demarche_date_fin":null,"ordre":3}],"nb_activites_to_do":null})

    return Promise.resolve(basseManaData)
  },
}

export const BasseManaMod: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlugValidator.parse('m-pr-basse-mana-2018-pr101')}
    initTab="points"
    user={{ ...testBlankUser, role: 'defaut' }}
    router={routerPushMock}
    apiClient={basseManaApiClient}
    titreIdOrSlug={titreIdValidator.parse('ORKjSbwrb87xE53MsYClV8OF')}
  />
)

export const Empty: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlug}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={{
      ...apiClient,
      getTitreById: titreIdOrSlug => {
        getTitreAction(titreIdOrSlug)

        return Promise.resolve({
          id: titreIdValidator.parse('id-du-titre'),
          nb_activites_to_do: 0,
          nom: 'Nom du titre',
          slug: titreSlugValidator.parse('slug-du-titre'),
          titre_type_id: 'arm',
          titre_statut_id: 'val',
          references: [],
          titre_last_modified_date: toCaminoDate('2021-01-01'),
          titre_doublon: null,
          demarches: [],
        })
      },
    }}
    titreIdOrSlug={titre.id}
  />
)

export const WithDoublon: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlug}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={{
      ...apiClient,
      getTitreById: titreIdOrSlug => {
        getTitreAction(titreIdOrSlug)

        return Promise.resolve({
          id: titreIdValidator.parse('id-du-titre'),
          nb_activites_to_do: 0,
          nom: 'Nom du titre',
          slug: titreSlugValidator.parse('slug-du-titre'),
          titre_type_id: 'arm',
          titre_statut_id: 'val',
          references: [],
          titre_last_modified_date: toCaminoDate('2021-01-01'),
          titre_doublon: {
            id: titreIdValidator.parse('id-du-doublon'),
            nom: 'Nom du titre en doublon',
          },
          demarches: [],
        })
      },
    }}
    titreIdOrSlug={titre.id}
  />
)

export const WithLinkableTitres: StoryFn = () => (
  <PureTitre
    currentDate={currentDate}
    currentDemarcheSlug={demarcheSlug}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={{
      ...apiClient,
      loadLinkableTitres:
        (...params) =>
        () => {
          loadLinkableTitresAction(params)

          return Promise.resolve(linkableTitres)
        },
      linkTitres: (...params) => {
        linkTitresAction(params)

        return Promise.resolve({ aval: titresTo, amont: titresFrom })
      },
      loadTitreLinks: titreId => {
        loadTitreLinksAction(titreId)

        return Promise.resolve({
          amont: [{ id: titreIdValidator.parse('idEnAmont'), nom: 'nom du titre en amont' }],
          aval: [{ id: titreIdValidator.parse('idEnAval'), nom: 'nom du titre en aval' }],
        })
      },
      getTitreById: titreIdOrSlug => {
        getTitreAction(titreIdOrSlug)

        return Promise.resolve({
          id: titreIdValidator.parse('id-du-titre'),
          nb_activites_to_do: 0,
          nom: 'Nom du titre',
          slug: titreSlugValidator.parse('slug-du-titre'),
          titre_type_id: 'axm',
          titre_statut_id: 'val',
          references: [],
          titre_last_modified_date: toCaminoDate('2021-01-01'),
          titre_doublon: null,
          demarches: [],
        })
      },
    }}
    titreIdOrSlug={titre.id}
  />
)
