import { leafletGeojsonCenterFind, leafletGeojsonBuild, leafletMarkerBuild, leafletDivIconBuild } from '../_map/leaflet'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DomaineId, sortedDomaines } from 'camino-common/src/static/domaines'
import type { DivIconOptions, GeoJSON, GeoJSONOptions, Layer, LeafletEventHandlerFnMap, Marker, MarkerClusterGroup, PopupOptions } from 'leaflet'
import { CommonTitre } from 'camino-common/src/titres'
import { TitreId } from 'camino-common/src/validators/titres'
import { dsfrVariableCouleurParDomaine } from '../_common/domaine'
import { capitalize } from 'camino-common/src/strings'
import { GeojsonPoint, MultiPolygon } from 'camino-common/src/perimetre'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { REGION_IDS, RegionId } from 'camino-common/src/static/region'
import { CaminoRouter } from '@/typings/vue-router'

const leafletCoordinatesFind = (geojson: { coordinates: [number, number] }) => {
  const coordinates = geojson.coordinates

  return {
    lng: coordinates[0],
    lat: coordinates[1],
  }
}

export const regionsCoordinates = {
  [REGION_IDS['Auvergne-Rhône-Alpes']]: [
    [1.6767, 47.3135],
    [8.05888, 44.0947],
  ],
  [REGION_IDS['Bourgogne-Franche-Comté']]: [
    [2.43281, 48.7518],
    [7.61855, 45.8748],
  ],
  [REGION_IDS.Bretagne]: [
    [-6.1227, 49.2643],
    [-0.847, 46.9604],
  ],
  [REGION_IDS['Centre-Val de Loire']]: [
    [-0.20478, 49.2364],
    [3.6911, 46.082],
  ],
  [REGION_IDS.Corse]: [
    [43, 8],
    [41.3, 10.3],
  ],
  [REGION_IDS['Grand Est']]: [
    [2.4767, 46.0504],
    [8.807, 50.36781],
  ],
  [REGION_IDS.Guadeloupe]: [
    [-61.99099, 16.54896],
    [-61.0809, 15.8889],
  ],
  [REGION_IDS.Guyane]: [
    [-55, 6],
    [-51, 2],
  ],
  [REGION_IDS['Hauts-de-France']]: [
    [0.7737, 51.238],
    [4.75514, 48.7052],
  ],
  [REGION_IDS['La Réunion']]: [
    [55.0667443, -20.814978],
    [55.97294, -21.4697],
  ],
  [REGION_IDS.Martinique]: [
    [-61.44022, 14.9367],
    [-60.6146, 14.31359],
  ],
  [REGION_IDS.Mayotte]: [
    [44.81316, -12.5722],
    [45.48503, -13.0706],
  ],
  [REGION_IDS.Normandie]: [
    [-2.88915, 50.32793],
    [1.98169, 48.1257],
  ],
  [REGION_IDS['Nouvelle-Aquitaine']]: [
    [-2.142071, 47.2883],
    [2.44759, 42.4752],
  ],
  [REGION_IDS.Occitanie]: [
    [-0.38563, 45.3292],
    [4.95648, 42.297],
  ],
  [REGION_IDS['Pays de la Loire']]: [
    [-2.73269, 48.8376],
    [1.0683, 46.1369],
  ],
  [REGION_IDS["Provence-Alpes-Côte d'Azur"]]: [
    [4.17411, 45.144],
    [8.1894, 42.869],
  ],
  [REGION_IDS['Île-de-France']]: [
    [1.35898, 49.3419],
    [3.671916, 48.0665],
  ],
} as const satisfies Record<RegionId, [[number, number], [number, number]]>
export const zones = {
  fr: {
    id: 'fr',
    name: 'Hexagone',
    coordinates: [
      [-5, 41],
      [10, 51],
    ],
  },
  gf: {
    id: 'gf',
    name: 'Guyane',
    coordinates: regionsCoordinates[REGION_IDS.Guyane],
  },
  oi: {
    id: 'oi',
    name: 'Océan Indien',
    coordinates: [
      [39, -23],
      [58, -13],
    ],
  },
  an: {
    id: 'an',
    name: 'Antilles',
    coordinates: [
      [-64, 15],
      [-59, 16],
    ],
  },
} as const satisfies { [id: string]: { id: string; name: string; coordinates: [[number, number], [number, number]] } }

const L = window.L

export type CaminoMarkerClusterGroup = MarkerClusterGroup & { caminoDomaineId?: DomaineId }
export const clustersBuild = () =>
  sortedDomaines.reduce<{ [key in DomaineId]?: CaminoMarkerClusterGroup }>((clusters, { id }) => {
    clusters[id] = L.markerClusterGroup({
      iconCreateFunction(cluster) {
        // Based on pattern.tsx

        const baseElement = document.getElementById(`domaine_${id}`)
        const element = baseElement?.cloneNode(true) as unknown as HTMLElement | undefined
        if (element) {
          const childCount = cluster.getChildCount()

          element.removeAttribute('id')
          let className = 'pill'
          if (childCount > 1) {
            const dsfrTagElement = element.getElementsByTagName('p')[0]
            if (childCount >= 10) {
              dsfrTagElement.textContent = '10+'
              className += ' leaflet-marker-cluster-big'
            } else {
              dsfrTagElement.textContent = `${childCount}`
            }
          }
          const divIconOptions: DivIconOptions = {
            html: element,
            className,
            iconSize: undefined,
            iconAnchor: [20, 20],
          }

          return new L.DivIcon(divIconOptions)
        }
        throw new Error(`Pas d'icone trouvée pour le domaine ${id}`)
      },
      disableClusteringAtZoom: 10,
      animate: true,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
    })
    const cluster = clusters[id]
    if (cluster) {
      cluster.caminoDomaineId = id
    }

    return clusters
  }, {})

export interface TitreWithPerimetre extends CommonTitre {
  geojson4326Perimetre?: MultiPolygon
  geojson4326Centre?: GeojsonPoint
}
type CaminoMarker = {
  marker: Marker
  id: TitreId
  domaineId: DomaineId
}

const svgDomaineAnchor = (domaineId: DomaineId): string => {
  return `
    <svg width="33" height="39" viewBox="0 0 33 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 23C1 25 10.0563 32.5564 16.5 39C22.9437 32.5564 30 26 32 23C32.5 22 33 22 33 16C33 5.5 23.8967 0 17 0C10.1033 0 5.17674e-05 4 0 16C-1.16842e-05 18.7406 0 21 0.5 23Z" fill="var(--${
    dsfrVariableCouleurParDomaine[domaineId]
  })"/>
<text x="12" y="22" class="mono" fill="#161616">${capitalize(domaineId)}</text>
</svg>
  `
}

export type LayerWithTitreId = Layer & { titreId: TitreId }
export const layersBuild = (titres: TitreWithPerimetre[], router: Pick<CaminoRouter, 'push'>, entreprises: Entreprise[], markersAlreadyInMap: TitreId[] = [], geojsonAlreadyInMap: TitreId[] = []) => {
  const div = document.createElement('div')
  const titleName = document.createElement('div')
  const listeTitulaires = document.createElement('ul')
  titleName.className = 'fr-text--lead'
  const entreprisesIndex = entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom
    return acc
  }, {})

  return titres.reduce<{ geojsons: Record<TitreId, GeoJSON>; markers: CaminoMarker[] }>(
    ({ geojsons, markers }, titre) => {
      if (!titre.geojson4326Perimetre && !titre.geojson4326Centre) return { geojsons, markers }

      const isMarkerAlreadyInMap = markersAlreadyInMap.includes(titre.id)
      const isPerimeterAlreadyInMap = geojsonAlreadyInMap.includes(titre.id)
      if (!titre.geojson4326Perimetre && isMarkerAlreadyInMap) {
        return { geojsons, markers }
      }

      if (isMarkerAlreadyInMap && isPerimeterAlreadyInMap) {
        return { geojsons, markers }
      }

      const titreId = titre.id
      const domaineId = getDomaineId(titre.typeId)

      const baseElement = document.getElementById(`domaine_${domaineId}`)
      const element = baseElement?.cloneNode(true) as unknown as HTMLElement | undefined

      if (element) {
        element.removeAttribute('id')

        const icon = leafletDivIconBuild({
          className: ``,
          html: svgDomaineAnchor(domaineId),
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        })

        const popupOptions: PopupOptions = {
          closeButton: false,
          offset: [0, -24],
          autoPan: false,
        }

        const populatePopup = () => {
          // Based on pattern.tsx
          const titreStatutBaseElement = document.getElementById(`titre_statut_${titre.titreStatutId}`)
          const titreStatutElement = titreStatutBaseElement?.cloneNode(true) as unknown as HTMLElement
          titreStatutElement.removeAttribute('id')
          const popupHtmlTitulaires = isNotNullNorUndefinedNorEmpty(titre.titulaireIds) ? titre.titulaireIds.map(id => `<li>${entreprisesIndex[id]}</li>`).join('') : ''

          div.innerHTML = ''
          titleName.textContent = titre.nom ? titre.nom : ''
          listeTitulaires.innerHTML = popupHtmlTitulaires
          div.appendChild(titleName)
          div.appendChild(titreStatutElement)
          div.appendChild(listeTitulaires)
        }
        if (!isMarkerAlreadyInMap) {
          const latLng = titre.geojson4326Centre ? leafletCoordinatesFind(titre.geojson4326Centre) : leafletGeojsonCenterFind(titre.geojson4326Perimetre)
          const marker = leafletMarkerBuild(latLng, icon)

          // @ts-ignore infernal à typer
          marker.titreId = titreId

          marker.bindPopup(div, popupOptions)
          const methods: LeafletEventHandlerFnMap = {
            click() {
              if (titre.slug) {
                router.push({ name: 'titre', params: { id: titre.slug } })
              }
            },
            mouseover(_e) {
              populatePopup()
              marker.openPopup()
            },
            mouseout(_e) {
              marker.closePopup()
            },
          }
          marker.on(methods)
          markers.push({ marker, id: titreId, domaineId })
        }

        if (!isPerimeterAlreadyInMap && titre.geojson4326Perimetre) {
          const className = `svg-fill-pattern-${getTitreTypeType(titre.typeId)}-${domaineId}`
          const geojsonOptions: GeoJSONOptions = {
            style: { fillOpacity: 0.75, weight: 1, color: 'white', className },
            onEachFeature: (_feature, layer) => {
              layer.bindPopup(div, popupOptions)

              layer.on({
                click() {
                  if (titre.slug) {
                    router.push({ name: 'titre', params: { id: titre.slug } })
                  }
                },
                mouseover(_e) {
                  populatePopup()
                  layer.openPopup()
                },
                mouseout(_e) {
                  layer.closePopup()
                },
              })
            },
          }

          const geojson = leafletGeojsonBuild(titre.geojson4326Perimetre, geojsonOptions)

          // @ts-ignore infernal à typer
          geojson.titreId = titreId
          geojsons[titreId] = geojson
        }
      }

      return { geojsons, markers }
    },
    { geojsons: {}, markers: [] }
  )
}
