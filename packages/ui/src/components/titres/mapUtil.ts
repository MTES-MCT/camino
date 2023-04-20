import { leafletMarkerClusterGroupBuild, leafletGeojsonCenterFind, leafletGeojsonBuild, leafletMarkerBuild, leafletIconBuild } from '../_map/leaflet'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DomaineId, sortedDomaines } from 'camino-common/src/static/domaines'
import { DivIconOptions, GeoJSON, GeoJSONOptions, LeafletEventHandlerFnMap, Map, Marker, MarkerClusterGroup, PopupOptions } from 'leaflet'
import { Router } from 'vue-router'
import { CommonTitre } from 'camino-common/src/titres'
import { GeoJsonObject } from 'geojson'

const leafletCoordinatesFind = (geojson: { geometry: { coordinates: [number, number] } }) => {
  const coordinates = geojson.geometry.coordinates

  return {
    lng: coordinates[0],
    lat: coordinates[1],
  }
}
export const zones = [
  {
    id: 'fr',
    name: 'Métropole',
    type: 'LineString',
    coordinates: [
      [-5, 41],
      [10, 51],
    ],
  },
  {
    id: 'gf',
    name: 'Guyane',
    type: 'LineString',
    coordinates: [
      [-55, 6],
      [-51, 2],
    ],
  },
  {
    id: 'oi',
    name: 'Océan Indien',
    type: 'LineString',
    coordinates: [
      [39, -23],
      [58, -13],
    ],
  },
  {
    id: 'an',
    name: 'Antilles',
    type: 'LineString',
    coordinates: [
      [-64, 15],
      [-59, 16],
    ],
  },
] as const

export const clustersBuild = () =>
  sortedDomaines.reduce<{ [key in DomaineId]?: MarkerClusterGroup }>((clusters, { id }) => {
    const divIconOptions: DivIconOptions = {
      html: id.toUpperCase(),
      className: `py-xs px-s pill small mono color-bg bold bg-domaine-${id}`,
      iconSize: undefined,
      iconAnchor: [0, 0],
    }

    clusters[id] = leafletMarkerClusterGroupBuild(divIconOptions)

    return clusters
  }, {})

const domainesColors: Record<DomaineId, string> = {
  c: '#b88847',
  f: '#4a515d',
  g: '#c94f17',
  h: '#c2266a',
  m: '#376faa',
  r: '#a0aa31',
  s: '#7657b5',
  w: '#1ea88c',
} as const

const iconUrlFind = (domaineId: DomaineId) => {
  const iconSvg = `<svg width="32" height="40" xmlns="http://www.w3.org/2000/svg"><style>text {font-family:'Lucida Sans Typewriter', monaco, 'Lucida Console', monospace; font-weight:700;}</style><polygon points="16,40 24,30 8,30" fill="white" /><ellipse ry="16" rx="16" cy="16" cx="16" stroke-width="1" stroke="white" fill="${
    domainesColors[domaineId]
  }"/><text xml:space="preserve" text-anchor="middle" font-size="13" y="21" x="16" fill="white">${domaineId.toUpperCase()}</text></svg>`

  return 'data:image/svg+xml;base64,' + btoa(iconSvg)
}

export interface TitreWithPoint extends CommonTitre {
  geojsonMultiPolygon?: GeoJsonObject
  geojsonCentre?: { geometry: { coordinates: [number, number] } }
}
export type CaminoMarker = {
  marker: Marker
  id?: string | number
  domaineId?: DomaineId
}
export const layersBuild = (titres: TitreWithPoint[], router: Router) =>
  titres.reduce<{ geojsons: Record<string, GeoJSON>; markers: CaminoMarker[] }>(
    ({ geojsons, markers }, titre, index) => {
      if (!titre.geojsonMultiPolygon && !titre.geojsonCentre) return { geojsons, markers }

      const titreId = titre.id || index
      const domaineId = getDomaineId(titre.typeId)
      const icon = leafletIconBuild({
        iconUrl: iconUrlFind(domaineId),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      })

      const latLng = titre.geojsonCentre ? leafletCoordinatesFind(titre.geojsonCentre) : leafletGeojsonCenterFind(titre.geojsonMultiPolygon)

      const marker = leafletMarkerBuild(latLng, icon)

      const popupHtmlTitulaires = titre.titulaires && titre.titulaires.length ? titre.titulaires.map(tt => `<li>${tt.nom}</li>`).join('') : ''

      const statut = titre.titreStatutId ? TitresStatuts[titre.titreStatutId] : { couleur: 'error', nom: 'Inconnu' }
      const popupHtml = `<h4 class="mb-s">${titre.nom ? titre.nom : ''}</h4><div class="mb-m"><span class="rnd py-xxs px-s cap-first mb-0 bold color-bg h6 bg-${statut.couleur}">${
        statut.nom
      }</span></div><ul class="list-prefix h6">${popupHtmlTitulaires}</ul>`

      const popupOptions: PopupOptions = {
        closeButton: false,
        offset: [0, -24],
        autoPan: false,
      }

      const titreRoute = titre.slug ? { name: 'titre', params: { id: titre.slug } } : null

      marker.bindPopup(popupHtml, popupOptions)

      const methods: LeafletEventHandlerFnMap = {
        click() {
          if (titreRoute) {
            router.push(titreRoute)
          }
        },
        mouseover(_e) {
          marker.openPopup()
        },
        mouseout(_e) {
          marker.closePopup()
        },
      }
      marker.on(methods)

      const className = `svg-fill-pattern-${getTitreTypeType(titre.typeId)}-${domaineId}`
      const geojsonOptions: GeoJSONOptions = {
        style: { fillOpacity: 0.75, weight: 1, color: 'white', className },
        onEachFeature: (_feature, layer) => {
          layer.bindPopup(popupHtml, popupOptions)
          layer.on(methods)
        },
      }

      const geojson = leafletGeojsonBuild(titre.geojsonMultiPolygon, geojsonOptions)

      if (marker) {
        markers.push({ marker, id: titreId, domaineId })
      }

      geojsons[titreId] = geojson

      return { geojsons, markers }
    },
    { geojsons: {}, markers: [] }
  )
