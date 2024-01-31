import { ITitreDemarche, IPropId, ITitreEtape, ICommune } from '../../types.js'

import { titreContenuTitreEtapeFind, titrePropTitreEtapeFind } from './titre-prop-etape-find.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
const currentDate = toCaminoDate('2023-04-06')

describe("id de l'étape d'une propriété valide (dé-normalise)", () => {
  test("trouve l'id de la dernière étape acceptée de la démarche d'octroi acceptée ayant la propriété 'geojson4326Perimetre'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1989-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1989-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('1989-01-02'),
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
              {
                id: newEtapeId('h-cx-courdemanges-1989-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                date: toCaminoDate('1989-01-01'),
                ordre: 1,
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1989-mut01'),
            typeId: 'mut',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1989-mut01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-mut01'),
                typeId: 'dpu',
                statutId: 'acc',
                date: toCaminoDate('1989-02-03'),
                ordre: 2,
              },
              {
                id: newEtapeId('h-cx-courdemanges-1989-mut01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-mut01'),
                typeId: 'dex',
                date: toCaminoDate('1989-02-02'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )?.id
    ).toEqual('h-cx-courdemanges-1989-oct01-dpu01')
  })

  test("ne trouve pas d'id si la dernière étape acceptée de la dernière démarche acceptée possède une propriété 'points' vide", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('1989-01-02'),
                geojson4326Perimetre: null,
              },
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                date: toCaminoDate('1989-01-01'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )
    ).toBeNull()
  })

  test("trouve l'id de la dernière étape acceptée de la démarche de mutation acceptée ayant la propriété 'points'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1986-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1986-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-oct01'),
                typeId: 'dpu',
                date: toCaminoDate('1986-01-02'),
                statutId: 'acc',
                ordre: 2,
              },
              {
                id: newEtapeId('h-cx-courdemanges-1986-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                date: toCaminoDate('1986-01-01'),
                ordre: 1,
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1986-mut01'),
            typeId: 'mut',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1986-mut01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-mut01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('1986-02-02'),
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
              {
                id: newEtapeId('h-cx-courdemanges-1986-mut01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-mut01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('1986-02-01'),
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )?.id
    ).toEqual('h-cx-courdemanges-1986-mut01-dpu01')
  })

  test("ne trouve pas d'id si aucune étape acceptée ne contient la propriété 'communes'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'communes',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1986-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1986-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('1986-01-02'),
              },
              {
                id: newEtapeId('h-cx-courdemanges-1986-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('1986-01-01'),
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1986-mut01'),
            typeId: 'mut',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1986-mut01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-mut01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
                date: toCaminoDate('1986-02-02'),
              },
              {
                id: newEtapeId('h-cx-courdemanges-1986-mut01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-mut01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('1986-02-01'),
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )
    ).toBeNull()
  })

  test("trouve l'id de la dernière étape acceptée de la dernière démarche d'octroi en instruction ayant la propriété 'points'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1985-mut01'),
            typeId: 'mut',
            statutId: 'ins',
            ordre: 2,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1985-mut01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1985-mut01'),
                typeId: 'dpu',
                statutId: 'acc',
                date: toCaminoDate('1985-01-01'),
                ordre: 2,
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
              {
                id: newEtapeId('h-cx-courdemanges-1985-mut01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1985-mut01'),
                typeId: 'dex',
                date: toCaminoDate('1985-01-01'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1985-oct01'),
            typeId: 'oct',
            statutId: 'ins',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1985-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1985-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('1985-02-02'),
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
              {
                id: newEtapeId('h-cx-courdemanges-1985-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1985-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('1985-02-01'),
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )?.id
    ).toEqual('h-cx-courdemanges-1985-oct01-dpu01')
  })

  test("ne trouve pas d'id si l'étape est rejetée", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1984-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1984-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1984-oct01'),
                typeId: 'dpu',
                statutId: 'rej',
                ordre: 2,
                date: toCaminoDate('1984-01-01'),
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
              {
                id: newEtapeId('h-cx-courdemanges-1984-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1984-oct01'),
                date: toCaminoDate('1984-01-01'),
                typeId: 'dex',
                statutId: 'rej',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )
    ).toBeNull()
  })

  test("trouve l'id de la dernière étape de formalisation de la demande de la dernière démarche d'octroi acceptée ayant la propriété 'points'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1983-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1983-oct01-mfr01'),
                date: toCaminoDate('1983-01-01'),
                titreDemarcheId: newDemarcheId(newDemarcheId('h-cx-courdemanges-1983-oct01')),
                typeId: 'mfr',
                statutId: 'acc',
                ordre: 1,
                geojson4326Perimetre: { properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] }, type: 'Feature' },
              } as ITitreEtape,
            ],
          },
        ],
        TitresStatutIds.Valide
      )?.id
    ).toEqual('h-cx-courdemanges-1983-oct01-mfr01')
  })

  test("ne trouve pas la dernière étape de dpu d'une démarche de prolongation ou de demande de titre en instruction car l'étape contient un périmètre et le titre a le statut 'modification en instance' et aucune phase n'est valide", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1981-pro01'),
            typeId: 'pro',
            statutId: 'ins',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-pro01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-pro01'),
                typeId: 'dpu',
                statutId: 'acc',
                date: toCaminoDate('1981-01-01'),
                ordre: 1,
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-oct01'),
                typeId: 'dpu',
                date: toCaminoDate('1981-01-01'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.ModificationEnInstance
      )
    ).toEqual(null)
  })

  test("ne trouve pas l'id de la dernière étape de dpu d'une démarche de prolongation ou de demande de titre en instruction car l'étape contient un périmètre et le titre a le statut 'modification en instance' mais la phase est encore valide", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1981-pro01'),
            typeId: 'pro',
            statutId: 'ins',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-pro01-dpu01'),
                titreDemarcheId: newDemarcheId(newDemarcheId('h-cx-courdemanges-1981-pro01')),
                date: '1981-01-01',
                typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
                statutId: ETAPES_STATUTS.ACCEPTE,
                ordre: 1,
              },
            ] as ITitreEtape[],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-oct01'),
                typeId: 'dpu',
                date: toCaminoDate('1981-01-01'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.ModificationEnInstance
      )
    ).toBeNull()
  })

  test("ne trouve pas l'id de la dernière étape de dpu car aucune démarche de prolongation ou de demande de titre en instruction ne contient de périmètre et le titre a le statut 'modification en instance'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'points',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1981-mut01'),
            typeId: 'mut',
            statutId: 'ins',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-mut01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-mut01'),
                typeId: 'dpu',
                statutId: 'acc',
                date: toCaminoDate('1981-01-01'),
                ordre: 1,
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-oct01'),
                typeId: 'dpu',
                date: toCaminoDate('1981-01-01'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.ModificationEnInstance
      )
    ).toBe(null)
  })

  test.each(['points', 'surface', 'communes'] as IPropId[])(
    "trouve l'id de la dernière étape de n’importe quel type d'une démarche de prolongation ou de demande de titre en instruction car l'étape contient la propriété %s et le titre a le statut 'modification en instance' et aucune phase n'est valide",
    propId => {
      expect(
        titrePropTitreEtapeFind(
          currentDate,
          propId,
          [
            {
              id: newDemarcheId('h-cx-courdemanges-1981-pro01'),
              typeId: 'pro',
              statutId: 'ins',
              ordre: 2,
              etapes: [
                {
                  id: newEtapeId('h-cx-courdemanges-1981-pro01-dpu01'),
                  date: toCaminoDate('1981-01-01'),
                  titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-pro01'),
                  typeId: 'aac',
                  statutId: 'acc',
                  ordre: 1,
                  geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
                  surface: 3.2,
                  substances: ['auru'],
                  communes: ['paris' as unknown as ICommune],
                },
              ],
            },
            {
              id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
              typeId: 'oct',
              statutId: 'acc',
              ordre: 1,
              etapes: [
                {
                  id: newEtapeId('h-cx-courdemanges-1981-oct01-dpu01'),
                  titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-oct01'),
                  typeId: 'dpu',
                  statutId: 'acc',
                  ordre: 1,
                  date: toCaminoDate('1981-01-01'),
                  geojson4326Perimetre: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'MultiPolygon',
                      coordinates: [
                        [
                          [
                            [1, 2],
                            [2, 3],
                          ],
                        ],
                      ],
                    },
                  },
                  surface: 3,
                  substances: ['arge'],
                  communes: ['tours'] as unknown as ICommune[],
                },
              ],
            },
          ],
          TitresStatutIds.ModificationEnInstance
        )?.id
      ).toEqual('h-cx-courdemanges-1981-oct01-dpu01')
    }
  )

  test.each<IPropId>(['titulaires', 'substances'])("ne trouve pas l'id de la mod car la propriété %s n’est pas modifiée par cette étape", propId => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        propId,
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1981-pro01'),
            typeId: 'pro',
            statutId: 'ins',
            ordre: 2,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-pro01-dpu01'),
                date: toCaminoDate('1981-01-01'),
                titreDemarcheId: newDemarcheId(newDemarcheId('h-cx-courdemanges-1981-pro01')),
                typeId: 'aac',
                statutId: 'acc',
                ordre: 1,
                geojson4326Perimetre: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] } },
                surface: 3.2,
                substances: ['auru'],
                titulaires: [{ id: newEntrepriseId('titulaire2') }],
                amodiataires: [{ id: newEntrepriseId('amodiataire2') }],
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-oct01-dpu01'),
                titreDemarcheId: newDemarcheId(newDemarcheId('h-cx-courdemanges-1981-oct01')),
                typeId: 'dpu',
                statutId: 'acc',
                date: toCaminoDate('1981-01-01'),
                ordre: 1,
                geojson4326Perimetre: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'MultiPolygon',
                    coordinates: [
                      [
                        [
                          [1, 2],
                          [2, 3],
                        ],
                      ],
                    ],
                  },
                },
                surface: 3,
                substances: ['arge'],
                titulaires: [{ id: newEntrepriseId('titulaire1') }],
                amodiataires: [{ id: newEntrepriseId('amodiataire1') }],
              },
            ],
          },
        ],
        TitresStatutIds.ModificationEnInstance
      )?.id
    ).toEqual('h-cx-courdemanges-1981-oct01-dpu01')
  })

  test("trouve l'id de l’unique étape de la démarche d’octroi contenant la propriété 'titulaires'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'titulaires',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1982-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1982-oct01-mfr01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1982-oct01'),
                typeId: 'mfr',
                statutId: 'aco',
                ordre: 1,
                date: toCaminoDate('1982-01-01'),
                dateFin: toCaminoDate('2018-12-31'),
                titulaires: [{ id: newEntrepriseId('fr-123456789') }],
              },
            ],
          },
        ],
        TitresStatutIds.DemandeInitiale
      )?.id
    ).toEqual('h-cx-courdemanges-1982-oct01-mfr01')
  })

  // amodiataires

  test("trouve pas d'id si la démarche de l'étape contenant la propriété 'amodiataires' a une phase valide", () => {
    const newDate = toCaminoDate('2015-01-02')
    expect(
      titrePropTitreEtapeFind(
        newDate,
        'amodiataires',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1982-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            demarcheDateDebut: toCaminoDate('1982-01-01'),
            demarcheDateFin: toCaminoDate('2018-12-31'),
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1982-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1982-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('1982-01-01'),
                dateFin: toCaminoDate('2018-12-31'),
                amodiataires: [{ id: newEntrepriseId('fr-123456789') }],
              },
            ],
          },
        ],
        TitresStatutIds.Valide
      )?.id
    ).toBe('h-cx-courdemanges-1982-oct01-dpu01')
  })

  test("trouve l'id de dernière étape contenant la propriété 'amodiataires' dont la démarche précédente a une phase valide", () => {
    const newDate = toCaminoDate('2021-10-01')
    expect(
      titrePropTitreEtapeFind(
        newDate,
        'amodiataires',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1982-amo01'),
            typeId: 'amo',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1982-amo01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1982-amo01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 1,
                dateFin: toCaminoDate('4018-12-31'),
                date: toCaminoDate('1982-01-01'),
                amodiataires: [{ id: newEntrepriseId('fr-123456789') }],
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1982-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            demarcheDateDebut: toCaminoDate('2021-01-01'),
            demarcheDateFin: toCaminoDate('2022-01-01'),
            etapes: [],
          },
        ],
        TitresStatutIds.ModificationEnInstance
      )?.id
    ).toEqual('h-cx-courdemanges-1982-amo01-dpu01')
  })

  test("ne trouve pas l'id de la dernière étape contenant la propriété 'amodiataires'", () => {
    expect(
      titrePropTitreEtapeFind(
        currentDate,
        'amodiataires',
        [
          {
            id: newDemarcheId('h-cx-courdemanges-1981-amo01'),
            typeId: 'amo',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-amo01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-amo01'),
                typeId: 'dpu',
                statutId: 'acc',
                date: toCaminoDate('1981-01-01'),
                ordre: 1,
                amodiataires: [{ id: newEntrepriseId('fr-123456789') }],
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1981-pro01'),
            typeId: 'pro',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-pro01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-pro01'),
                typeId: 'dpu',
                date: toCaminoDate('1981-01-01'),
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
          {
            id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1981-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-oct01'),
                date: toCaminoDate('1981-01-01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 1,
              },
            ],
          },
        ],
        TitresStatutIds.ModificationEnInstance
      )
    ).toBeNull()
  })
})

describe("id de l'étape qui a un contenu", () => {
  test("retourne null si aucune étape n'est trouvé", () => {
    const etape1 = titreContenuTitreEtapeFind({ sectionId: 'arm', elementId: 'mecanisee' }, [{ id: newDemarcheId('demarche-id'), etapes: [{ id: newEtapeId('etape-id') }] }] as ITitreDemarche[], 'val')

    const etape2 = titreContenuTitreEtapeFind(
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          statutId: 'acc',
          etapes: [{ id: newEtapeId('etape-id'), statutId: 'fai' }],
        },
      ] as ITitreDemarche[],
      'val'
    )

    const etape3 = titreContenuTitreEtapeFind(
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: newTitreId('titre-id'),
          typeId: 'pro',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2020-01-02'),
          etapes: [
            {
              id: newEtapeId('etape-id'),
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dpu',
              date: toCaminoDate('2020-01-01'),
              statutId: 'acc',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ],
      'mod'
    )

    expect(etape1).toBeNull()
    expect(etape2).toBeNull()
    expect(etape3).toBeNull()
  })

  test("retourne l'id de l'étape si elle existe", () => {
    const etape1 = titreContenuTitreEtapeFind(
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: newTitreId('titre-id'),
          typeId: 'oct',
          etapes: [
            {
              id: newEtapeId('etape-id'),
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dpu',
              date: toCaminoDate('2020-01-03'),
              statutId: 'acc',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
        {
          id: newDemarcheId('demarche-id-2'),
          titreId: newTitreId('titre-id'),
          typeId: 'pro',
          etapes: [
            {
              id: newEtapeId('etape-id-2'),
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dex',
              date: toCaminoDate('2020-01-01'),
              statutId: 'fai',
            },
          ],
        },
      ],
      'val'
    )
    expect(etape1?.id).toEqual('etape-id')

    const etape2 = titreContenuTitreEtapeFind(
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: newTitreId('titre-id'),
          typeId: 'pro',
          statutId: 'acc',
          etapes: [
            {
              id: newEtapeId('etape-id'),
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dpu',
              date: toCaminoDate('2020-01-01'),
              statutId: 'acc',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ],
      'mod'
    )

    expect(etape2?.id).toEqual('etape-id')
  })

  test("ne retourne pas l'id de la demande si le titre n’est pas en dmi", () => {
    const etape = titreContenuTitreEtapeFind(
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: newTitreId('titre-id'),
          typeId: 'oct',
          etapes: [
            {
              id: newEtapeId('etape-id'),
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'mfr',
              date: toCaminoDate('2020-01-03'),
              statutId: 'aco',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ],
      'val'
    )
    expect(etape).toBeNull()
  })

  test("retourne l'id de la demande si le titre est en dmi", () => {
    const etape = titreContenuTitreEtapeFind(
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: newTitreId('titre-id'),
          typeId: 'oct',
          etapes: [
            {
              id: newEtapeId('etape-id'),
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'mfr',
              date: toCaminoDate('2020-01-03'),
              statutId: 'aco',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ],
      'dmi'
    )
    expect(etape!.id).toEqual('etape-id')
  })
})
