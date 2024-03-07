import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { MapPattern } from '../_map/pattern'
import { DsfrPerimetre } from './dsfr-perimetre'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { ApiClient } from '@/api/api-client'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'

const meta: Meta = {
  title: 'Components/Common/Perimetre',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DsfrPerimetre,
}
export default meta

const geojson4326_perimetre: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.5660583466962, 4.23944263425535],
          [-52.5591878553913, 4.22269896902571],
          [-52.5550566725882, 4.22438936251509],
          [-52.5619271168799, 4.24113309117193],
          [-52.5660583466962, 4.23944263425535],
        ],
      ],
    ],
  },
}

const geojson4326_points: FeatureCollectionPoints = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-52.5660583466962, 4.23944263425535] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-52.5660583466962, 4.23944263425535] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-52.5660583466962, 4.23944263425535] } },
  ],
}

const pushAction = action('push')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')
const getTitresWithPerimetreForCarteAction = action('getGeojsonByGeoSystemeId')

const apiClientMock: Pick<ApiClient, 'getTitresWithPerimetreForCarte' | 'getGeojsonByGeoSystemeId'> = {
  getGeojsonByGeoSystemeId: (geojson, geoSystemeId) => {
    getGeojsonByGeoSystemeIdAction(geojson, geoSystemeId)

    return Promise.resolve(geojson4326_points)
  },
  getTitresWithPerimetreForCarte: carte => {
    getTitresWithPerimetreForCarteAction(carte)

    return Promise.resolve({ elements: [], total: 0 })
  },
}

export const DefaultNoSnapshot: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{ geojson4326_perimetre, geojson4326_points: null, geojson_origine_perimetre: geojson4326_perimetre, geojson_origine_points: null, geojson_origine_geo_systeme_id: '4326' }}
      calculateNeighbours={true}
      apiClient={{
        ...apiClientMock,
        getTitresWithPerimetreForCarte: params => {
          getTitresWithPerimetreForCarteAction(params)

          return Promise.resolve({
            elements: [
              {
                id: titreIdValidator.parse('anotherTitreId'),
                nom: 'nom du titre',
                references: [],
                slug: titreSlugValidator.parse('slug-du-titre'),
                titreStatutId: TitresStatutIds.Echu,
                typeId: TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN,
                titulaires: [],
                geojson4326_perimetre: {
                  type: 'Feature',
                  properties: {},

                  geometry: {
                    type: 'MultiPolygon',
                    coordinates: [
                      [
                        [
                          [-52.54, 4.22269896902571],
                          [-52.55, 4.22438936251509],
                          [-52.55, 4.24113309117193],
                          [-52.54, 4.22269896902571],
                        ],
                      ],
                    ],
                  },
                },
              },
            ],
            total: 0,
          })
        },
      }}
      titreSlug={titreSlugValidator.parse('titre-slug')}
      router={{
        push: to => {
          pushAction(to)

          return Promise.resolve()
        },
      }}
    />
  </>
)

export const NoNeighborsNoSnapshot: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{ geojson4326_perimetre, geojson4326_points: null, geojson_origine_perimetre: geojson4326_perimetre, geojson_origine_points: null, geojson_origine_geo_systeme_id: '4326' }}
      calculateNeighbours={false}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
    />
  </>
)

const perimetreWithLacune: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.5660583466962, 4.23944263425535],
          [-52.5591878553913, 4.22269896902571],
          [-52.5550566725882, 4.22438936251509],
          [-52.5619271168799, 4.24113309117193],
          [-52.5660583466962, 4.23944263425535],
        ],
        [
          [-52.563, 4.236],
          [-52.5591878553913, 4.227],
          [-52.561, 4.236],
          [-52.563, 4.236],
        ],
      ],
    ],
  },
}
export const PolygonWithLacuneNoSnapshot: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre: perimetreWithLacune,
        geojson4326_points: null,
        geojson_origine_perimetre: perimetreWithLacune,
        geojson_origine_points: null,
        geojson_origine_geo_systeme_id: '4326',
      }}
      calculateNeighbours={true}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
      router={{
        push: to => {
          pushAction(to)

          return Promise.resolve()
        },
      }}
    />
  </>
)

const bigGeoJson: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    // prettier-ignore
    "coordinates": [      [        [          [            -4.370364497124209,            48.53380508608616          ],          [            -4.373271574712479,            48.47151134163559          ],          [            -4.03753485335386,            48.579164636474836          ],          [            -3.89919702975027,            48.603980178934115          ],          [            -3.860482328708233,            48.62511389817695          ],          [            -3.858436311611334,            48.629031691751045          ],          [            -3.862157259991486,            48.633014015139416          ],          [            -3.870281882041237,            48.63550010399696          ],          [            -3.879786359001045,            48.639113643702565          ],          [            -3.895430188480503,            48.64455770816115          ],          [            -3.89902273351368,            48.64822789311303          ],          [            -3.902536979616769,            48.654435032933826          ],          [            -3.906528075174153,            48.66061643462235          ],          [            -3.904489574558275,            48.6643307169305          ],          [            -3.89647573803132,            48.66601900245078          ],          [            -3.890673665115296,            48.667020244464325          ],          [            -3.890721315690864,            48.67062455977177          ],          [            -3.892950905315848,            48.67088770685571          ],          [            -3.898005277721187,            48.6723935639094          ],          [            -3.8992413951649,            48.67074624589731          ],          [            -3.903300809713803,            48.67034264689684          ],          [            -3.907548440632195,            48.66910635173531          ],          [            -3.91185396569359,            48.669954398127075          ],          [            -3.914635548862354,            48.67322568941628          ],          [            -3.920575104032537,            48.67458696237509          ],          [            -3.924157593611878,            48.669749821082725          ],          [            -3.927138109422188,            48.66538094626539          ],          [            -3.927802453245391,            48.66178827244388          ],          [            -3.92880004801291,            48.660065331624466          ],          [            -3.930674658925236,            48.657424523021          ],          [            -3.934385020441046,            48.65730036039394          ],          [            -3.940574301992641,            48.65682750256307          ],          [            -3.949892212356874,            48.653210569309856          ],          [            -3.9518951695476,            48.64983646195122          ],          [            -3.95135848409069,            48.646306571150944          ],          [            -3.952791103114349,            48.64456097348628          ],          [            -3.954311041643234,            48.64535110107629          ],          [            -3.957178207067545,            48.65093506946735          ],          [            -3.95632686509049,            48.654756209794456          ],          [            -3.954939197043658,            48.66049485799891          ],          [            -3.958264581105623,            48.66351217516115          ],          [            -3.954301077151103,            48.665175330569724          ],          [            -3.958113788215813,            48.66678821578858          ],          [            -3.958288500972019,            48.67004622329816          ],          [            -3.953583216471425,            48.67102223996598          ],          [            -3.952154912225681,            48.67280542236          ],          [            -3.954601922703807,            48.67354649576719          ],          [            -3.957150323952388,            48.6728667311387          ],          [            -3.962232217223142,            48.674085603023535          ],          [            -3.96509885038279,            48.67647290565392          ],          [            -3.968196892552599,            48.67354977814375          ],          [            -3.970552500285286,            48.67336152037275          ],          [            -3.971907150463719,            48.67429537178488          ],          [            -3.971687730880199,            48.67565139942766          ],          [            -3.968925351937541,            48.67998621214178          ],          [            -3.97276835094199,            48.68681279071675          ],          [            -3.969905040239144,            48.687617856017994          ],          [            -3.967785856011854,            48.69274164929216          ],          [            -3.97050395358365,            48.693904041872074          ],          [            -3.974129066864182,            48.69665141578885          ],          [            -3.976827175680581,            48.699084231748806          ],          [            -3.973964059500176,            48.70207052891004          ],          [            -3.97557715354335,            48.70449012698265          ],          [            -3.972337757698344,            48.70582333762662          ],          [            -3.974038535718974,            48.710344199247295          ],          [            -3.972061362590358,            48.71168433267898          ],          [            -3.969407494937729,            48.71919463600953          ],          [            -3.966114995158957,            48.719188628020184          ],          [            -3.964815895310649,            48.72248973384656          ],          [            -3.968123622922862,            48.72216808659624          ],          [            -3.970117554054281,            48.7239825094888          ],          [            -3.971030085004171,            48.72531725688056          ],          [            -3.974105493634571,            48.72442714535237          ],          [            -3.977130032296356,            48.72223266964199          ],          [            -3.98038470744471,            48.72282149601802          ],          [            -3.98267568678471,            48.72451484026706          ],          [            -3.983159793997456,            48.72623219482621          ],          [            -3.985655519886893,            48.726898196761965          ],          [            -3.988412331317411,            48.727004809776105          ],          [            -3.990251104366354,            48.72588975599552          ],          [            -3.992106999472123,            48.723541171653366          ],          [            -3.992308257471176,            48.72204072794657          ],          [            -3.990818477440011,            48.71838055340067          ],          [            -3.993241558794496,            48.715311146944074          ],          [            -3.99726181945054,            48.71273584775902          ],          [            -4.000886986292233,            48.71141716999743          ],          [            -4.005573266114372,            48.715195490443925          ],          [            -4.004640753163968,            48.716989015759715          ],          [            -4.007861713401779,            48.72044675798358          ],          [            -4.009590286562232,            48.72068101995395          ],          [            -4.012907971574204,            48.71865165832863          ],          [            -4.010881803078078,            48.716872551149415          ],          [            -4.013298574720932,            48.713765123429766          ],          [            -4.018283788022766,            48.71146515516518          ],          [            -4.02502266800395,            48.710486602386844          ],          [            -4.029102910364339,            48.7109751516783          ],          [            -4.032895375568785,            48.712496949149184          ],          [            -4.034013864663466,            48.71364906002572          ],          [            -4.035203599079426,            48.71386049099469          ],          [            -4.036426674181452,            48.711761570746404          ],          [            -4.035857818689737,            48.70935978588029          ],          [            -4.037836186006247,            48.70536884991981          ],          [            -4.040876440962449,            48.70331706201061          ],          [            -4.042661395770205,            48.70267658451317          ],          [            -4.044522857875245,            48.70264835316387          ],          [            -4.048746772595955,            48.70536952092104          ],          [            -4.051782617787177,            48.70458102418029          ],          [            -4.053387641319855,            48.70237110662314          ],          [            -4.054960885021424,            48.69887510664347          ],          [            -4.057098904957046,            48.688336149296134          ],          [            -4.047492224129947,            48.6881905546806          ],          [            -4.04264615919883,            48.688356681641565          ],          [            -4.05570877851515,            48.685187990084636          ],          [            -4.061384711067841,            48.687678086132514          ],          [            -4.063856568443375,            48.68626486757381          ],          [            -4.069006699782528,            48.687977416990556          ],          [            -4.066114156101222,            48.68600063748565          ],          [            -4.065917761777147,            48.68383188367652          ],          [            -4.06536435070835,            48.68281963355705          ],          [            -4.062811851052143,            48.68243638561189          ],          [            -4.063604286352126,            48.680735563101265          ],          [            -4.061249339782617,            48.68019915458731          ],          [            -4.060491984152113,            48.67893668983929          ],          [            -4.056630622211962,            48.67523642323898          ],          [            -4.055350396131191,            48.67179995101334          ],          [            -4.057224936686009,            48.670572879663034          ],          [            -4.057969445321888,            48.675068847630506          ],          [            -4.059622862128396,            48.675122344607715          ],          [            -4.06024682153259,            48.67613145254186          ],          [            -4.063213863275964,            48.67815002912692          ],          [            -4.064507934140134,            48.677605925445725          ],          [            -4.067195178609656,            48.67891661518815          ],          [            -4.068000601946539,            48.68272446881325          ],          [            -4.07116708376152,            48.68462241191764          ],          [            -4.080222240659125,            48.689712089777736          ],          [            -4.082890717412141,            48.693212237422216          ],          [            -4.0837341887691,            48.69168549285934          ],          [            -4.08645810312384,            48.69005696722575          ],          [            -4.08922980276701,            48.69161527586137          ],          [            -4.091651149022687,            48.69171173600047          ],          [            -4.095188717132302,            48.686965610139666          ],          [            -4.097383839952319,            48.69356464812578          ],          [            -4.102536986221444,            48.69351221259058          ],          [            -4.106197887484285,            48.692515838515405          ],          [            -4.109568285925066,            48.69472448012849          ],          [            -4.115803404112282,            48.69506791354793          ],          [            -4.118098969264236,            48.692778728280935          ],          [            -4.12511664716867,            48.693877169595176          ],          [            -4.127837461875522,            48.69361476668908          ],          [            -4.131236501370729,            48.6960475956426          ],          [            -4.136181126707938,            48.69293107079426          ],          [            -4.142132619722753,            48.69237814384752          ],          [            -4.150020162763907,            48.69217377284019          ],          [            -4.152170300893284,            48.691487051119246          ],          [            -4.162483098525137,            48.68833023827453          ],          [            -4.174170898732186,            48.657628672506775          ],          [            -4.409843663429304,            48.633874515395604          ],          [            -4.370364497124209,            48.53380508608616          ]
        ]
      ]
    ],
  },
}

export const BigNoSnapshot: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{ geojson4326_perimetre: bigGeoJson, geojson4326_points: null, geojson_origine_perimetre: bigGeoJson, geojson_origine_points: null, geojson_origine_geo_systeme_id: '4326' }}
      titreSlug={titreSlugValidator.parse('titre-slug')}
      router={{
        push: to => {
          pushAction(to)

          return Promise.resolve()
        },
      }}
      calculateNeighbours={true}
      apiClient={apiClientMock}
    />
  </>
)

const multiplePolygone: FeatureMultiPolygon = {
  properties: {},
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
}

export const MultipleNoSnapshot: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre: multiplePolygone,
        geojson_origine_perimetre: multiplePolygone,
        geojson_origine_points: null,
        geojson_origine_geo_systeme_id: '4326',
        geojson4326_points: null,
      }}
      titreSlug={titreSlugValidator.parse('titre-slug')}
      router={{
        push: to => {
          pushAction(to)

          return Promise.resolve()
        },
      }}
      calculateNeighbours={true}
      apiClient={apiClientMock}
    />
  </>
)

const multiplePolygoneWithLacune: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.5660583466962, 4.23944263425535],
          [-52.5591878553913, 4.22269896902571],
          [-52.5550566725882, 4.22438936251509],
          [-52.5619271168799, 4.24113309117193],
          [-52.5660583466962, 4.23944263425535],
        ],
        [
          [-52.563, 4.236],
          [-52.5591878553913, 4.227],
          [-52.561, 4.236],
          [-52.563, 4.236],
        ],
      ],
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
      [
        [
          [-52.54, 4.22269896902571],
          [-52.55, 4.22438936251509],
          [-52.55, 4.24113309117193],
          [-52.54, 4.22269896902571],
        ],
      ],
    ],
  },
}
export const MultiplePolygonWithLacuneTableau: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre: multiplePolygoneWithLacune,
        geojson4326_points: null,
        geojson_origine_perimetre: multiplePolygoneWithLacune,
        geojson_origine_points: null,
        geojson_origine_geo_systeme_id: '4326',
      }}
      calculateNeighbours={true}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
      router={{
        push: to => {
          pushAction(to)

          return Promise.resolve()
        },
      }}
      initTab={'points'}
    />
  </>
)

const customPoints: FeatureCollectionPoints = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { nom: '1', description: 'Description du point 1' }, geometry: { type: 'Point', coordinates: geojson4326_perimetre.geometry.coordinates[0][0][0] } },
    { type: 'Feature', properties: { nom: '2', description: 'Description du point 2' }, geometry: { type: 'Point', coordinates: geojson4326_perimetre.geometry.coordinates[0][0][1] } },
  ],
}
export const CustomPoints: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre,
        geojson4326_points: customPoints,
        geojson_origine_perimetre: geojson4326_perimetre,
        geojson_origine_points: customPoints,
        geojson_origine_geo_systeme_id: '4326',
      }}
      initTab="points"
      calculateNeighbours={false}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
    />
  </>
)

const customPointWithoutNameAndDesc: FeatureCollectionPoints = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: { nom: null, description: null }, geometry: { type: 'Point', coordinates: geojson4326_perimetre.geometry.coordinates[0][0][0] } }],
}

export const CustomPointsWithoutNameAndDesc: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre,
        geojson4326_points: customPointWithoutNameAndDesc,
        geojson_origine_perimetre: geojson4326_perimetre,
        geojson_origine_points: customPointWithoutNameAndDesc,
        geojson_origine_geo_systeme_id: '4326',
      }}
      initTab="points"
      calculateNeighbours={false}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
    />
  </>
)

export const CustomPointsWithAnotherGeoSysteme: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre,
        geojson4326_points: customPointWithoutNameAndDesc,
        geojson_origine_perimetre: geojson4326_perimetre,
        geojson_origine_points: {
          type: 'FeatureCollection',
          properties: {},
          features: [{ type: 'Feature', properties: { nom: 'Nom', description: 'Description' }, geometry: { type: 'Point', coordinates: [338097.8, 462518.2] } }],
        },
        geojson_origine_geo_systeme_id: '2154',
      }}
      initTab="points"
      calculateNeighbours={false}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
    />
  </>
)

export const CustomPointsWithAnotherLegacyGeoSysteme: StoryFn = () => (
  <>
    <MapPattern />
    <DsfrPerimetre
      perimetre={{
        geojson4326_perimetre,
        geojson4326_points: customPointWithoutNameAndDesc,
        geojson_origine_perimetre: geojson4326_perimetre,
        geojson_origine_points: {
          type: 'FeatureCollection',
          properties: {},
          features: [{ type: 'Feature', properties: { nom: 'Nom', description: 'Description' }, geometry: { type: 'Point', coordinates: [338097.8, 462518.2] } }],
        },
        geojson_origine_geo_systeme_id: GEO_SYSTEME_IDS.RGFG95,
      }}
      initTab="points"
      calculateNeighbours={false}
      apiClient={apiClientMock}
      titreSlug={titreSlugValidator.parse('titre-slug')}
    />
  </>
)
