import { IGeometry } from '../../types'

import { titresEtapesAreasUpdate } from './titres-etapes-areas-update'
import { titresEtapesGet } from '../../database/queries/titres-etapes'
import { foretsGet, communesGet } from '../../database/queries/territoires'

import {
  commune1,
  commune1SurfaceChangee,
  commune2,
  titresEtapesSansPoints,
  titresEtapesPoints,
  titresEtapesPointsVides,
  titresEtapesPointsMemeCommune,
  titresEtapesPointsCommuneInexistante,
  titresEtapesPointsCommuneExistante,
  foret1,
  foret1SurfaceChangee
} from './__mocks__/titres-etapes-communes-update-etapes'
import { apiGeoGet } from '../../tools/api-geo/index'

jest.mock('../../database/queries/titres-etapes', () => ({
  __esModule: true,
  titresEtapesCommunesUpdate: jest.fn().mockImplementation(a => a),
  titreEtapeCommuneDelete: jest.fn().mockImplementation(a => a),
  titresEtapesForetsUpdate: jest.fn().mockImplementation(a => a),
  titreEtapeForetDelete: jest.fn().mockImplementation(a => a),
  titresEtapesSDOMZonesUpdate: jest.fn().mockImplementation(a => a),
  titreEtapeSDOMZoneDelete: jest.fn().mockImplementation(a => a),
  titresEtapesGet: jest.fn()
}))

jest.mock('../../database/queries/territoires', () => ({
  __esModule: true,
  communesUpsert: jest.fn().mockImplementation(a => a),
  foretsUpsert: jest.fn().mockImplementation(a => a),
  sdomZonesUpsert: jest.fn().mockImplementation(a => a),
  communesGet: jest.fn(),
  foretsGet: jest.fn(),
  sdomZonesGet: jest.fn().mockImplementation(() => [])
}))

jest.mock('../../tools/geojson', () => ({
  __esModule: true,
  geojsonFeatureMultiPolygon: (points: IGeometry) => ({
    geometry: { coordinates: [points] }
  })
}))

jest.mock('../../tools/api-geo/index', () => ({
  apiGeoGet: jest.fn()
}))

console.info = jest.fn()
console.error = jest.fn()

const titresEtapesGetMock = jest.mocked(titresEtapesGet, true)
const foretsGetMock = jest.mocked(foretsGet, true)
const communesGetMock = jest.mocked(communesGet, true)
const geoAreaGeojsonGetMock = jest.mocked(apiGeoGet, true)

describe('mise ?? jour de toutes les territoires des ??tapes', () => {
  test('ajoute 2 communes et 1 for??t dans une ??tape et dans la liste de communes et des for??ts', async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPoints])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [commune1, commune2],
      forets: [foret1],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    const {
      areasUpdated: foretsUpdated = [],
      titresEtapesAreasUpdated: titresEtapesForetsUpdated = [],
      titresEtapesAreasDeleted: titresEtapesForetsDeleted = []
    } = result.titresForets

    expect(communesUpdated.length).toEqual(2)
    expect(titresEtapesCommunesUpdated.length).toEqual(2)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)

    expect(foretsUpdated.length).toEqual(1)
    expect(titresEtapesForetsUpdated.length).toEqual(1)
    expect(titresEtapesForetsDeleted.length).toEqual(0)
  })

  test("n'ajoute qu'une seule fois une commune en doublon", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPointsMemeCommune])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [commune1, commune1],
      forets: [],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(1)
    expect(titresEtapesCommunesUpdated.length).toEqual(1)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
  })

  test("n'ajoute aucune commune dans l'??tape ni dans la liste de communes", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPoints])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [],
      forets: [],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
  })

  test("n'ajoute pas de commune si l'??tape n'a pas de p??rim??tre", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPointsVides])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [],
      forets: [],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
  })

  test("n'ajoute pas de commune si l'??tape n'a pas de la propri??t?? `points`", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesSansPoints])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [],
      forets: [],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
  })

  test("n'ajoute pas de commune si elle existe d??j?? dans l'??tape", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPointsCommuneExistante])
    foretsGetMock.mockResolvedValue([foret1])
    communesGetMock.mockResolvedValue([commune1])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [commune1],
      forets: [foret1],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
  })

  test("met ?? jour la commune et la for??t dans l'??tape si sa surface couverte a chang??", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPointsCommuneExistante])
    foretsGetMock.mockResolvedValue([foret1])
    communesGetMock.mockResolvedValue([commune1])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [commune1SurfaceChangee],
      forets: [foret1SurfaceChangee],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(1)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)

    const {
      areasUpdated: foretsUpdated = [],
      titresEtapesAreasUpdated: titresEtapesForetsUpdated = [],
      titresEtapesAreasDeleted: titresEtapesForetsDeleted = []
    } = result.titresForets

    expect(foretsUpdated.length).toEqual(0)
    expect(titresEtapesForetsUpdated.length).toEqual(1)
    expect(titresEtapesForetsDeleted.length).toEqual(0)
  })

  test("supprime une commune si l'??tape ne la contient plus dans son p??rim??tre", async () => {
    titresEtapesGetMock.mockResolvedValue([
      titresEtapesPointsCommuneInexistante
    ])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [],
      forets: [],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesDeleted.length).toEqual(1)
  })

  test("met ?? jour la commune dans l'??tape si sa surface couverte a chang??", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPointsCommuneExistante])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([commune1])
    geoAreaGeojsonGetMock.mockResolvedValue({
      communes: [commune1SurfaceChangee],
      forets: [],
      sdomZones: []
    })

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes

    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(1)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
  })

  test("retourne un message d'erreur si l'API G??o communes ne r??pond pas", async () => {
    titresEtapesGetMock.mockResolvedValue([titresEtapesPointsVides])
    foretsGetMock.mockResolvedValue([])
    communesGetMock.mockResolvedValue([])
    geoAreaGeojsonGetMock.mockResolvedValue(null)

    const result = await titresEtapesAreasUpdate()

    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = result.titresCommunes
    expect(communesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesUpdated.length).toEqual(0)
    expect(titresEtapesCommunesDeleted.length).toEqual(0)
    expect(geoAreaGeojsonGetMock).toHaveBeenCalled()

    expect(console.error).toHaveBeenCalled()
  })
})
