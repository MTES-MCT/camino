import { leafletGeojsonCenterFind, leafletGeojsonBuild, leafletMarkerBuild, leafletDivIconBuild } from '../_map/leaflet'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DomaineId, sortedDomaines } from 'camino-common/src/static/domaines'
import { DivIconOptions, GeoJSON, GeoJSONOptions, LeafletEventHandlerFnMap, Map, Marker, MarkerClusterGroup, PopupOptions } from 'leaflet'
import { Router } from 'vue-router'
import { CommonTitre, TitreId } from 'camino-common/src/titres'
import { GeoJsonObject } from 'geojson'

const leafletCoordinatesFind = (geojson: { geometry: { coordinates: [number, number] } }) => {
  const coordinates = geojson.geometry.coordinates

  return {
    lng: coordinates[0],
    lat: coordinates[1],
  }
}
export const zones = {
  fr: {
    id: 'fr',
    name: 'Métropole',
    type: 'LineString',
    coordinates: [
      [-5, 41],
      [10, 51],
    ],
  },
  gf: {
    id: 'gf',
    name: 'Guyane',
    type: 'LineString',
    coordinates: [
      [-55, 6],
      [-51, 2],
    ],
  },
  oi: {
    id: 'oi',
    name: 'Océan Indien',
    type: 'LineString',
    coordinates: [
      [39, -23],
      [58, -13],
    ],
  },
  an: {
    id: 'an',
    name: 'Antilles',
    type: 'LineString',
    coordinates: [
      [-64, 15],
      [-59, 16],
    ],
  },
} as const

const L = window.L

export type CaminoMarkerClusterGroup = MarkerClusterGroup & {caminoDomaineId?: DomaineId}
export const clustersBuild = () =>
  sortedDomaines.reduce<{ [key in DomaineId]?: CaminoMarkerClusterGroup }>((clusters, { id }) => {
    clusters[id] = L.markerClusterGroup({
      iconCreateFunction(cluster) {
        // Based on pattern.tsx

        const baseElement = document.getElementById(`domaine_${id}`)
        const element = baseElement?.cloneNode(true) as unknown as HTMLElement | undefined
        if (element) {
          const childCount = cluster.getChildCount()

          let size
          if (childCount < 5) size = 'xs'
          else if (childCount < 15) size = 's'
          else if (childCount < 40) size = 'm'
          else size = 'l'
          element.removeAttribute('id')
          const divIconOptions: DivIconOptions = {
            html: element,
            className: `pill leaflet-marker-cluster-${size}`,
            iconSize: undefined,
            iconAnchor: [0, 0],
          }

          return new L.DivIcon(divIconOptions)
        }
        throw new Error(`Pas d'icone trouvée pour le domaine ${id}`)
      },
      disableClusteringAtZoom: 10,
      animate: true,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      maxClusterRadius(x) {
        return 2048 / Math.pow(x, 2)
      },
    })
    const cluster = clusters[id]
    if (cluster) {
      cluster.caminoDomaineId = id
    }

    return clusters
  }, {})

export interface TitreWithPoint extends CommonTitre {
  geojsonMultiPolygon?: GeoJsonObject
  geojsonCentre?: { geometry: { coordinates: [number, number] } }
}
export type CaminoMarker = {
  marker: Marker
  id: TitreId
  domaineId: DomaineId
}
export const layersBuild = (titres: TitreWithPoint[], router: Router, skipTitres: TitreId[] = []) =>
  titres.reduce<{ geojsons: Record<string, GeoJSON>; markers: CaminoMarker[] }>(
    ({ geojsons, markers }, titre) => {
      if (!titre.geojsonMultiPolygon && !titre.geojsonCentre) return { geojsons, markers }

      if (!titre.geojsonMultiPolygon && skipTitres.includes(titre.id)) {
        return {geojsons, markers}
      }
      const titreId = titre.id
      const domaineId = getDomaineId(titre.typeId)

      // Based on pattern.tsx
      const baseElement = document.getElementById(`domaine_${domaineId}`)
      const titreStatutBaseElement = document.getElementById(`titre_statut_${titre.titreStatutId}`)
      const element = baseElement?.cloneNode(true) as unknown as HTMLElement | undefined
      const titreStatutElement = titreStatutBaseElement?.cloneNode(true) as unknown as HTMLElement | undefined
      if (element && titreStatutElement) {
        element.removeAttribute('id')
        titreStatutElement.removeAttribute('id')
        const icon = leafletDivIconBuild({
          className: ``,
          html: element,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        })

        const latLng = titre.geojsonCentre ? leafletCoordinatesFind(titre.geojsonCentre) : leafletGeojsonCenterFind(titre.geojsonMultiPolygon)

        const popupHtmlTitulaires = titre.titulaires && titre.titulaires.length ? titre.titulaires.map(tt => `<li>${tt.nom}</li>`).join('') : ''

        const div = document.createElement('div')
        const titleName = document.createElement('div')
        const listeTitulaires = document.createElement('ul')

        titleName.className = 'fr-text--lead'
        titleName.textContent = titre.nom ? titre.nom : ''
        div.appendChild(titleName)
        div.appendChild(titreStatutElement)
        div.appendChild(listeTitulaires)
        listeTitulaires.innerHTML = popupHtmlTitulaires

        const popupOptions: PopupOptions = {
          closeButton: false,
          offset: [0, -24],
          autoPan: false,
        }

        const titreRoute = titre.slug ? { name: 'titre', params: { id: titre.slug } } : null
        if (!skipTitres.includes(titre.id)) {
        const marker = leafletMarkerBuild(latLng, icon)

        marker.bindPopup(div, popupOptions)
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
        markers.push({ marker, id: titreId, domaineId })
      }

        const className = `svg-fill-pattern-${getTitreTypeType(titre.typeId)}-${domaineId}`
        const geojsonOptions: GeoJSONOptions = {
          style: { fillOpacity: 0.75, weight: 1, color: 'white', className },
          onEachFeature: (_feature, layer) => {
            layer.bindPopup(div, popupOptions)
            
            layer.on({
              click() {
                if (titreRoute) {
                  router.push(titreRoute)
                }
              },
              mouseover(_e) {
                layer.openPopup()
              },
              mouseout(_e) {
                layer.closePopup()
              }})
          },
        }

        const geojson = leafletGeojsonBuild(titre.geojsonMultiPolygon, geojsonOptions)

        
        geojsons[titreId] = geojson
      }

      return { geojsons, markers }
    },
    { geojsons: {}, markers: [] }
  )
