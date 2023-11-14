import { Meta, StoryFn } from '@storybook/vue3'
import { DemarcheEtape } from './demarche-etape'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { toCaminoDate } from 'camino-common/src/date'
import { EtapeEntrepriseDocument, documentIdValidator, entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { titreSlugValidator } from 'camino-common/src/titres'
import { Router } from 'vue-router'
import { action } from '@storybook/addon-actions'
import { vueRouter } from 'storybook-vue3-router'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { EtapeDocument, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Demarche/Etape',
  // @ts-ignore
  component: DemarcheEtape,
  decorators: [vueRouter([{ name: 'entreprise' }]), () => ({ template: '<div class="dsfr"><story/></div>' })],
}

export default meta

const date = toCaminoDate('2023-10-24')
const titreSlug = titreSlugValidator.parse('titre-slug')
const routerPushAction = action('routerPushAction')

const routerPushMock: Pick<Router, 'push'> = {
  push: to => {
    routerPushAction(to)

    return Promise.resolve()
  },
}

const documents: EtapeDocument[] = [
  {
    id: documentIdValidator.parse('id'),
    document_type_id: 'atf',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'bil',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'bil',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
]

const entrepriseDocuments: EtapeEntrepriseDocument[] = [
  {
    id: entrepriseDocumentIdValidator.parse('id'),
    date: toCaminoDate('2023-01-01'),
    entreprise_document_type_id: 'atf',
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: null,
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: 'bil',
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
]

export const DemandeNoMap: StoryFn = () => (
  <DemarcheEtape
    user={{ ...testBlankUser, role: 'super' }}
    id={etapeIdValidator.parse('etapeId')}
    slug={etapeSlugValidator.parse('etape-slug')}
    titreSlug={titreSlug}
    router={routerPushMock}
    etape_type_id={EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId}
    etape_statut_id={EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId}
    date={date}
    fondamentale={{
      date_debut: toCaminoDate('2023-10-25'),
      duree: 12,
      date_fin: null,
      substances: ['auru', 'arge'],
      titulaires: [
        { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1', operateur: false },
        { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2', operateur: true },
      ],

      amodiataires: [{ id: entrepriseIdValidator.parse('amodiataire1'), nom: 'Amodiataire 1', operateur: false }],
      geojsonMultiPolygon: null,
      surface: null,
    }}
    sections_with_values={[
      { id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' },
      {
        id: 'odlep',
        elements: [
          {
            id: 'lien',
            nom: 'Lien public externe',
            type: 'url',
            optionnel: true,
            description: '',
            value: 'https://beta.gouv.fr',
          },
        ],
      },
    ]}
    documents={documents}
    entreprises_documents={entrepriseDocuments}
  />
)

export const DemandeNoSnapshot: StoryFn = () => (
  <DemarcheEtape
    user={{ ...testBlankUser, role: 'super' }}
    id={etapeIdValidator.parse('etapeId')}
    slug={etapeSlugValidator.parse('etape-slug')}
    titreSlug={titreSlug}
    router={routerPushMock}
    etape_type_id={EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId}
    etape_statut_id={EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId}
    date={date}
    fondamentale={{
      date_debut: toCaminoDate('2023-10-25'),
      duree: 12,
      date_fin: null,
      substances: ['auru', 'arge'],
      titulaires: [
        { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1', operateur: false },
        { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2', operateur: true },
      ],
      amodiataires: [{ id: entrepriseIdValidator.parse('amodiataire1'), nom: 'Amodiataire 1', operateur: false }],
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
            [
              [
                [-53.60031408473134, 3.8224780986447566],
                [-53.59891645305842, 3.8181831495446303],
                [-53.58181205656814, 3.82379854768971],
                [-53.58320964990986, 3.828093576227541],
                [-53.60031408473134, 3.8224780986447566],
              ],
            ],
            [
              [
                [-53.583861926103765, 3.8502114455117433],
                [-53.592379712320195, 3.834289122043602],
                [-53.588417035915334, 3.8321501920354253],
                [-53.57989914401643, 3.8480725119510217],
                [-53.583861926103765, 3.8502114455117433],
              ],
            ],
          ],
        },
      },
      surface: 10,
    }}
    sections_with_values={[{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' }]}
    documents={[]}
    entreprises_documents={[]}
  />
)

export const Depot: StoryFn = () => (
  <DemarcheEtape
    id={etapeIdValidator.parse('etapeId')}
    user={{ ...testBlankUser, role: 'super' }}
    slug={etapeSlugValidator.parse('etape-slug')}
    titreSlug={titreSlug}
    router={routerPushMock}
    etape_type_id={EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeTypeId}
    etape_statut_id={EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeStatutId}
    date={date}
    sections_with_values={[]}
    documents={documents}
    entreprises_documents={entrepriseDocuments}
  />
)

export const AvisDefavorable: StoryFn = () => (
  <DemarcheEtape
    id={etapeIdValidator.parse('etapeId')}
    user={{ ...testBlankUser, role: 'super' }}
    slug={etapeSlugValidator.parse('etape-slug')}
    titreSlug={titreSlug}
    router={routerPushMock}
    etape_type_id={EtapesTypesEtapesStatuts.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_.DEFAVORABLE.etapeTypeId}
    etape_statut_id={EtapesTypesEtapesStatuts.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_.DEFAVORABLE.etapeStatutId}
    date={date}
    sections_with_values={[]}
    documents={[]}
    entreprises_documents={[]}
  />
)