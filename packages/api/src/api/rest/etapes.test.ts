import { arePointsOnPerimeter, etapesTypesPossibleACetteDateOuALaPlaceDeLEtape } from './etapes.js'
import { ArmOctMachine } from '../../business/rules-demarches/arm/oct.machine.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test, vi } from 'vitest'
import { onlyUnique } from 'camino-common/src/typescript-tools.js'
import { newEtapeId } from '../../database/models/_format/id-create.js'
import { TitreEtapeForMachine } from '../../business/rules-demarches/machine-common.js'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape.js'

import { FeatureMultiPolygon } from 'camino-common/src/perimetre'

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

test('arePointsOnPerimeter', () => {
  expect(arePointsOnPerimeter(bigGeoJson, { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [1, 2] } }] })).toBe(false)
  expect(
    arePointsOnPerimeter(bigGeoJson, { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-4.174170898732186, 48.657628672506775] } }] })
  ).toBe(true)
})

test('arePointsOnPerimeter every point is on the perimeter', () => {
  expect(
    arePointsOnPerimeter(bigGeoJson, {
      type: 'FeatureCollection',
      features: bigGeoJson.geometry.coordinates.flatMap(coordinates =>
        coordinates.flatMap(sub => sub.flatMap(coordinate => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [coordinate[0], coordinate[1]] } })))
      ),
    })
  ).toBe(true)
})
describe('etapesTypesPossibleACetteDateOuALaPlaceDeLEtape', function () {
  const etapes: TitreEtapeForMachine[] = [
    {
      id: newEtapeId('etapeId16'),
      typeId: 'sco',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 16,
      date: toCaminoDate('2020-08-17'),
      contenu: { arm: { mecanise: true } },
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId1'),
      typeId: 'mfr',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 1,
      date: toCaminoDate('2019-09-19'),
      contenu: { arm: { mecanise: true, franchissements: 19 } },
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId5'),
      typeId: 'mcp',
      statutId: 'com',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 5,
      date: toCaminoDate('2019-11-27'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId10'),
      typeId: 'asc',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 10,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId14'),
      typeId: 'pfc',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 14,
      date: toCaminoDate('2020-05-22'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId8'),
      typeId: 'mcr',
      statutId: 'fav',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 8,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId4'),
      typeId: 'pfd',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 4,
      date: toCaminoDate('2019-11-20'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId15'),
      typeId: 'vfc',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 15,
      date: toCaminoDate('2020-05-22'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId13'),
      typeId: 'mnb',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 13,
      date: toCaminoDate('2020-05-18'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId12'),
      typeId: 'aca',
      statutId: 'fav',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 12,
      date: toCaminoDate('2020-05-13'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId6'),
      typeId: 'rde',
      statutId: 'fav',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 6,
      date: toCaminoDate('2019-12-04'),
      communes: [],
      surface: null,
      contenu: { arm: { franchissements: 19 } },
    },
    {
      id: newEtapeId('etapeId2'),
      typeId: 'mdp',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 2,
      date: toCaminoDate('2019-09-20'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId7'),
      typeId: 'vfd',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 7,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId11'),
      typeId: 'sca',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 11,
      date: toCaminoDate('2020-05-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId3'),
      typeId: 'dae',
      statutId: 'exe',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 3,
      date: toCaminoDate('2019-10-11'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId17'),
      typeId: 'aco',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 17,
      date: toCaminoDate('2022-05-05'),
      contenu: null,
      communes: [],
      surface: null,
    },
  ]

  const machine = new ArmOctMachine()
  test('modifie une étape existante', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, 'etapeId3', toCaminoDate('2019-10-11'))
    expect(tested).toHaveLength(1)
    expect(tested[0].etapeTypeId).toStrictEqual('dae')
  })

  test('modifie une étape existante à la même date devrait permettre de recréer la même étape', () => {
    for (const etape of etapes ?? []) {
      const etapesTypesPossibles = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, etape.id, etape.date)
      if (etapesTypesPossibles.length === 0) {
        console.error(`pas d'étapes possibles à l'étape ${JSON.stringify(etape)}. Devrait contenir AU MOINS la même étape`)
      }
      expect(etapesTypesPossibles.length).toBeGreaterThan(0)
      expect(etapesTypesPossibles.map(({ etapeTypeId }) => etapeTypeId)).toContain(etape.typeId)
    }
  })

  test('ajoute une nouvelle étape à la fin', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-05-06'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toHaveLength(1)
    expect(tested[0]).toBe('mnv')
  })

  test('ajoute une nouvelle étape en plein milieu', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['mod', 'ede', 'edm'])
  })

  test('peut faire une dae, une rde et pfd AVANT la mfr', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        ordre: 1,
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-16'),
        contenu: { arm: { mecanise: true, franchissements: 2 } },
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idMdp'),
        ordre: 2,
        typeId: 'mdp',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-17'),
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['pfd', 'dae', 'rde'])
  })

  test('peut faire que une pfd AVANT la mfr non mecanisee', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        ordre: 1,
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-16'),
        contenu: { arm: { mecanise: false } },
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idMdp'),
        ordre: 2,
        typeId: 'mdp',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-17'),
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['pfd'])
  })

  test('peut faire refuser une rde après une demande mécanisée', () => {
    console.warn = vi.fn()
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        date: toCaminoDate('2021-11-02'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        contenu: {
          arm: {
            mecanise: true,
            franchissements: 9,
          },
        },
        ordre: 3,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idrcm'),
        date: toCaminoDate('2021-11-17'),
        typeId: 'rcm',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        contenu: {
          arm: {
            mecanise: true,
            franchissements: 9,
          },
        },
        ordre: 7,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idMcp'),
        date: toCaminoDate('2021-11-05'),
        typeId: 'mcp',
        statutId: 'inc',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 5,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcp'),
        date: toCaminoDate('2021-11-17'),
        typeId: 'mcp',
        statutId: 'com',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 8,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('iddae'),
        date: toCaminoDate('2021-10-15'),
        typeId: 'dae',
        statutId: 'exe',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,

        ordre: 1,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcr'),
        date: toCaminoDate('2021-11-22'),
        typeId: 'mcr',
        statutId: 'fav',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        contenu: null,
        ordre: 10,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcb'),
        date: toCaminoDate('2021-12-09'),
        typeId: 'mcb',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,

        ordre: 13,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idedm'),
        date: toCaminoDate('2021-11-30'),
        typeId: 'edm',
        statutId: 'fav',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 12,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idvfd'),
        date: toCaminoDate('2021-11-19'),
        typeId: 'vfd',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 9,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idpfd'),
        date: toCaminoDate('2021-10-26'),
        typeId: 'pfd',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 2,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmdp'),
        date: toCaminoDate('2021-11-02'),
        typeId: 'mdp',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 4,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcm'),
        date: toCaminoDate('2021-11-05'),
        typeId: 'mcm',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 6,
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-07-01'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['mod', 'des', 'css', 'ede', 'asc', 'rcb', 'rde', 'mcb'])
    vi.resetAllMocks()
  })
  test('peut faire une completude (mcp) le même jour que le dépôt (mdp) de la demande', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('id3'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-06-23'),
        contenu: {
          arm: {
            mecanise: true,
            franchissements: 4,
          },
        },
        ordre: 3,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('id1'),
        typeId: 'dae',
        statutId: 'exe',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2021-06-22'),
        ordre: 1,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('id4'),

        typeId: 'mdp',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-07-01'),
        ordre: 4,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('id2'),

        typeId: 'pfd',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2021-07-05'),
        ordre: 2,
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-07-01'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['mod', 'des', 'css', 'rde', 'mcb', 'mcp'])
  })
})
