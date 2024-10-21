import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ITitreEtape, IPropId } from '../../types'

// TODO 2024-09-23 type return correctly
export const propValueFind = (
  titreEtape: Pick<ITitreEtape, 'geojson4326Perimetre' | 'titulaireIds' | 'amodiataireIds' | 'surface' | 'substances' | 'administrationsLocales' | 'communes' | 'forets'>,
  propId: IPropId
) => {
  if (propId === 'points') {
    return titreEtape.geojson4326Perimetre
  }

  if (propId === 'titulaires') {
    return isNotNullNorUndefinedNorEmpty(titreEtape.titulaireIds) ? titreEtape.titulaireIds : null
  }

  if (propId === 'amodiataires') {
    return isNotNullNorUndefinedNorEmpty(titreEtape.amodiataireIds) ? titreEtape.amodiataireIds : null
  }

  const value = titreEtape[propId]
  if ((Array.isArray(value) && value.length) || (!Array.isArray(value) && (value || value === 0))) {
    return value
  }

  return null
}
