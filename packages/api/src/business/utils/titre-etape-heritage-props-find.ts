import { ITitreEtape, IEntreprise, ITitrePoint, ITitreEntreprise } from '../../types.js'
import { objectClone } from '../../tools/index.js'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { MultiPolygon } from 'camino-common/src/perimetre.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

export const titreEtapePropsIds = ['points', 'titulaires', 'amodiataires', 'substances', 'surface', 'dateFin', 'dateDebut', 'duree'] as const satisfies Readonly<((keyof ITitreEtape) | 'points')[]>


const equalGeojson = (geo1: MultiPolygon, geo2: MultiPolygon): boolean => {
  for(let indexLevel1 = 0; indexLevel1 < geo1.coordinates.length; indexLevel1++){
    for(let indexLevel2 = 0; indexLevel2 < geo1.coordinates[indexLevel1].length; indexLevel2++){
      for(let indexLevel3 = 0; indexLevel3 < geo1.coordinates[indexLevel1][indexLevel2].length; indexLevel3++){

        if(geo1.coordinates[indexLevel1][indexLevel2][indexLevel3][0] !== geo2.coordinates[indexLevel1][indexLevel2][indexLevel3][0] || 
          geo1.coordinates[indexLevel1][indexLevel2][indexLevel3][1] !== geo2.coordinates[indexLevel1][indexLevel2][indexLevel3][1]
          ){
          return false
        }
      }
    }
  }
  

  return true
}  

const propertyArrayCheck = (newValue: IPropValueArray, prevValue: IPropValueArray, propId: string) => {
  if (prevValue?.length !== newValue?.length) {
    return false
  }

  if (prevValue?.length && newValue?.length) {
    if (propId === 'substances') {
      return newValue.toString() === prevValue.toString()
    } else if (['titulaires', 'amodiataires'].includes(propId)) {
      const comparator = (propValueArray: ITitreEntreprise) => propValueArray.id + propValueArray.operateur

      return (newValue as ITitreEntreprise[]).map(comparator).sort().toString() === (prevValue as ITitreEntreprise[]).map(comparator).sort().toString()
    }
  }

  return true
}

type IPropValueArray = undefined | null | IEntreprise[] | ITitrePoint[] | SubstanceLegaleId[]

type IPropValue = number | string | IPropValueArray | MultiPolygon

const titreEtapePropCheck = (propId: string, oldValue?: IPropValue | null, newValue?: IPropValue | null) => {
  if (['titulaires', 'amodiataires', 'substances'].includes(propId)) {
    return propertyArrayCheck(oldValue as IPropValueArray, newValue as IPropValueArray, propId)
  }

  
  if (propId === 'points' && isNotNullNorUndefined(oldValue) && isNotNullNorUndefined(newValue)) {
    return equalGeojson(newValue as MultiPolygon, oldValue as MultiPolygon) && equalGeojson(oldValue as MultiPolygon, newValue as MultiPolygon)
  } 

  return oldValue === newValue
}

export const titreEtapeHeritagePropsFind = (titreEtape: ITitreEtape, prevTitreEtape?: ITitreEtape | null) => {
  let hasChanged = false

  let newTitreEtape = titreEtape

  if (!titreEtape.heritageProps) {
    newTitreEtape = objectClone(newTitreEtape)
    newTitreEtape.heritageProps = {}
    hasChanged = true
  }

  titreEtapePropsIds.forEach(propId => {
    const heritage = newTitreEtape.heritageProps![propId]

    if (!heritage) {
      newTitreEtape = objectClone(newTitreEtape)
      hasChanged = true
      newTitreEtape.heritageProps![propId] = { actif: false, etapeId: null }
    }

    const prevHeritage = prevTitreEtape?.heritageProps ? prevTitreEtape?.heritageProps[propId] : null

    const etapeId = prevHeritage?.etapeId && prevHeritage?.actif ? prevHeritage.etapeId : prevTitreEtape?.id

    if (heritage?.actif) {
      if (prevTitreEtape) {
        const oldValue = (propId === 'points' ? titreEtape.geojson4326Perimetre : titreEtape[propId]) as IPropValue | undefined | null
        const newValue = (propId === 'points' ? prevTitreEtape.geojson4326Perimetre :prevTitreEtape[propId]) as IPropValue | undefined | null

        if (!titreEtapePropCheck(propId, oldValue, newValue)) {
          hasChanged = true
          newTitreEtape = objectClone(newTitreEtape)

          if (propId === 'points') {
            newTitreEtape.geojson4326Perimetre = prevTitreEtape.geojson4326Perimetre 
            newTitreEtape.geojson4326Points = prevTitreEtape.geojson4326Points 
          } else if (propId === 'amodiataires' || propId === 'titulaires') {
            newTitreEtape[propId] = newValue as IEntreprise[]
          } else if (propId === 'substances') {
            newTitreEtape[propId] = newValue as SubstanceLegaleId[]
          } else if (propId === 'dateDebut' || propId === 'dateFin') {
            newTitreEtape[propId] = newValue as CaminoDate
          } else if (propId === 'duree' || propId === 'surface') {
            newTitreEtape[propId] = newValue as number
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
