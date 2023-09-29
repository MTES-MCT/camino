import { leafletGeojsonCenterFind, leafletGeojsonBuild, leafletMarkerBuild, leafletDivIconBuild } from '../_map/leaflet'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DomaineId, Domaines, sortedDomaines } from 'camino-common/src/static/domaines'
import type { DivIconOptions, GeoJSON, GeoJSONOptions, Layer, LeafletEventHandlerFnMap, Marker, MarkerClusterGroup, PopupOptions } from 'leaflet'
import { Router } from 'vue-router'
import { CommonTitre, TitreId } from 'camino-common/src/titres'
import { GeoJsonObject } from 'geojson'
import { createVNode } from 'vue'
import { couleurParDomaine } from '../_common/domaine'
import { capitalize } from 'camino-common/src/strings'

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

export interface TitreWithPoint extends CommonTitre {
  geojsonMultiPolygon?: GeoJsonObject
  geojsonCentre?: { geometry: { coordinates: [number, number] } }
}
export type CaminoMarker = {
  marker: Marker
  id: TitreId
  domaineId: DomaineId
}

export const svgDomaineAnchor = (domaineId: DomaineId): string => {
  return `
    <svg width="33" height="39" viewBox="0 0 33 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 23C1 25 10.0563 32.5564 16.5 39C22.9437 32.5564 30 26 32 23C32.5 22 33 22 33 16C33 5.5 23.8967 0 17 0C10.1033 0 5.17674e-05 4 0 16C-1.16842e-05 18.7406 0 21 0.5 23Z" fill="var(--${
    couleurParDomaine[domaineId]
  })"/>
<text x="12" y="22" class="mono" fill="#161616">${capitalize(domaineId)}</text>
</svg>
  `
}

export type LayerWithTitreId = Layer & { titreId: TitreId }
export const layersBuild = (titres: TitreWithPoint[], router: Router, markersAlreadyInMap: TitreId[] = [], geojsonAlreadyInMap: TitreId[] = []) => {
  const div = document.createElement('div')
  const titleName = document.createElement('div')
  const listeTitulaires = document.createElement('ul')
  titleName.className = 'fr-text--lead'

  return titres.reduce<{ geojsons: Record<TitreId, GeoJSON>; markers: CaminoMarker[] }>(
    ({ geojsons, markers }, titre) => {
      if (!titre.geojsonMultiPolygon && !titre.geojsonCentre) return { geojsons, markers }

      const isMarkerAlreadyInMap = markersAlreadyInMap.includes(titre.id)
      const isPerimeterAlreadyInMap = geojsonAlreadyInMap.includes(titre.id)
      if (!titre.geojsonMultiPolygon && isMarkerAlreadyInMap) {
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
          const popupHtmlTitulaires = titre.titulaires && titre.titulaires.length ? titre.titulaires.map(tt => `<li>${tt.nom}</li>`).join('') : ''

          div.innerHTML = ''
          titleName.textContent = titre.nom ? titre.nom : ''
          listeTitulaires.innerHTML = popupHtmlTitulaires
          div.appendChild(titleName)
          div.appendChild(titreStatutElement)
          div.appendChild(listeTitulaires)
        }
        const titreRoute = titre.slug ? { name: 'titre', params: { id: titre.slug } } : null
        if (!isMarkerAlreadyInMap) {
          const latLng = titre.geojsonCentre ? leafletCoordinatesFind(titre.geojsonCentre) : leafletGeojsonCenterFind(titre.geojsonMultiPolygon)
          const marker = leafletMarkerBuild(latLng, icon)

          // @ts-ignore infernal à typer
          marker.titreId = titreId

          marker.bindPopup(div, popupOptions)
          const methods: LeafletEventHandlerFnMap = {
            click() {
              if (titreRoute) {
                router.push(titreRoute)
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

        if (!isPerimeterAlreadyInMap && titre.geojsonMultiPolygon) {
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
                  populatePopup()
                  layer.openPopup()
                },
                mouseout(_e) {
                  layer.closePopup()
                },
              })
            },
          }

          const geojson = leafletGeojsonBuild(titre.geojsonMultiPolygon, geojsonOptions)

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
