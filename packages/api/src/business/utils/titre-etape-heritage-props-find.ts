import { ITitreEtape, IEntreprise, ITitreEtapePerimetre } from '../../types'
import { objectClone } from '../../tools/index'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { CaminoDate } from 'camino-common/src/date'
import { FeatureMultiPolygon, equalGeojson } from 'camino-common/src/perimetre'
import { exhaustiveCheck, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ETAPE_HERITAGE_PROPS, EtapeHeritageProps } from 'camino-common/src/heritage'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { ZERO_KM2 } from 'camino-common/src/number'

const propertyArrayCheck = (newValue: string[], prevValue: string[], propId: string) => {
  if (prevValue?.length !== newValue?.length) {
    return false
  }

  if (prevValue?.length && newValue?.length) {
    if (propId === 'substances') {
      return newValue.toString() === prevValue.toString()
    } else if (['titulaires', 'amodiataires'].includes(propId)) {
      return [...newValue].sort().toString() === [...prevValue].sort().toString()
    }
  }

  return true
}

type IPropValueArray = undefined | null | IEntreprise[] | SubstanceLegaleId[]

type IPropValue = number | string | IPropValueArray | FeatureMultiPolygon

const titreEtapePropCheck = (propId: string, oldValue?: IPropValue | null, newValue?: IPropValue | null) => {
  if (['titulaires', 'amodiataires', 'substances'].includes(propId)) {
    return propertyArrayCheck(oldValue as string[], newValue as string[], propId)
  }

  if (propId === 'perimetre' && isNotNullNorUndefined(oldValue) && isNotNullNorUndefined(newValue)) {
    return equalGeojson((newValue as FeatureMultiPolygon).geometry, (oldValue as FeatureMultiPolygon).geometry)
  }

  return oldValue === newValue
}

export const titreEtapeHeritagePropsFind = (titreEtape: ITitreEtape, prevTitreEtape?: ITitreEtape | null) => {
  let hasChanged = false

  let newTitreEtape = titreEtape

  if (!titreEtape.heritageProps) {
    newTitreEtape = objectClone(newTitreEtape)
    newTitreEtape.heritageProps = {
      amodiataires: { actif: false, etapeId: null },
      dateDebut: { actif: false, etapeId: null },
      dateFin: { actif: false, etapeId: null },
      duree: { actif: false, etapeId: null },
      perimetre: { actif: false, etapeId: null },
      substances: { actif: false, etapeId: null },
      titulaires: { actif: false, etapeId: null },
    }
    hasChanged = true
  }

  ETAPE_HERITAGE_PROPS.forEach(propId => {
    const heritage = newTitreEtape.heritageProps![propId]

    if (isNullOrUndefined(heritage)) {
      newTitreEtape = objectClone(newTitreEtape)
      hasChanged = true
      newTitreEtape.heritageProps![propId] = { actif: false, etapeId: null }
    }

    const prevHeritage = prevTitreEtape?.heritageProps ? prevTitreEtape?.heritageProps[propId] : null

    const etapeId = prevHeritage?.etapeId && prevHeritage?.actif ? prevHeritage.etapeId : prevTitreEtape?.id

    const getEtapePropId = (heritagePropId: EtapeHeritageProps): keyof ITitreEtape => {
      if (heritagePropId === 'perimetre') {
        return 'geojson4326Perimetre'
      }
      if (heritagePropId === 'titulaires') {
        return 'titulaireIds'
      }
      if (heritagePropId === 'amodiataires') {
        return 'amodiataireIds'
      }

      return heritagePropId
    }

    if (heritage?.actif) {
      if (prevTitreEtape) {
        const oldValue = titreEtape[getEtapePropId(propId)] as IPropValue | undefined | null
        const newValue = prevTitreEtape[getEtapePropId(propId)] as IPropValue | undefined | null

        if (!titreEtapePropCheck(propId, oldValue, newValue)) {
          hasChanged = true
          newTitreEtape = objectClone(newTitreEtape)

          switch (propId) {
            case 'perimetre': {
              const perimetre: ITitreEtapePerimetre = {
                geojson4326Perimetre: prevTitreEtape.geojson4326Perimetre,
                geojson4326Points: prevTitreEtape.geojson4326Points,
                geojsonOrigineGeoSystemeId: prevTitreEtape.geojsonOrigineGeoSystemeId,
                geojsonOriginePoints: prevTitreEtape.geojsonOriginePoints,
                geojsonOriginePerimetre: prevTitreEtape.geojsonOriginePerimetre,
                geojsonOrigineForages: prevTitreEtape.geojsonOrigineForages,
                geojson4326Forages: prevTitreEtape.geojson4326Forages,
                surface: prevTitreEtape.surface ?? ZERO_KM2,
              }
              newTitreEtape = { ...newTitreEtape, ...perimetre }
              break
            }
            case 'amodiataires':
              newTitreEtape.amodiataireIds = newValue as EntrepriseId[]
              break
            case 'titulaires':
              newTitreEtape.titulaireIds = newValue as EntrepriseId[]
              break
            case 'substances':
              newTitreEtape[propId] = newValue as SubstanceLegaleId[]
              break
            case 'dateDebut':
            case 'dateFin':
              newTitreEtape[propId] = newValue as CaminoDate
              break
            case 'duree':
              newTitreEtape[propId] = newValue as number
              break
            default:
              exhaustiveCheck(propId)
          }
        }
      } else {
        // l’étape précédente a été supprimée, il faut donc désactiver l’héritage
        hasChanged = true
        newTitreEtape = objectClone(newTitreEtape)
        newTitreEtape.heritageProps![propId].actif = false
      }
    }

    if ((etapeId || heritage?.etapeId) && etapeId !== heritage?.etapeId) {
      hasChanged = true
      newTitreEtape = objectClone(newTitreEtape)
      newTitreEtape.heritageProps![propId].etapeId = etapeId
    }
  })

  return { hasChanged, titreEtape: newTitreEtape }
}
