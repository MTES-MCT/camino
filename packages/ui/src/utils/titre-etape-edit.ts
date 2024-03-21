import { cloneAndClean } from './index'
import { Etape } from 'camino-common/src/etape'

type EtapeEdit = Omit<Etape, 'administrations'>
export const etapeEditFormat = (etape: Etape): EtapeEdit => {
  const newEtape: Etape = cloneAndClean(etape)

  delete newEtape.administrations
  const entreprisesPropIds = ['titulaires', 'amodiataires'] as const

  entreprisesPropIds.forEach(propId => {
    if (newEtape[propId]) {
      newEtape[propId] = newEtape[propId].map(({ id, operateur }) => ({
        id,
        operateur,
      }))
    } else {
      newEtape[propId] = []
    }
  })

  if (!newEtape.substances) {
    newEtape.substances = []
  }

  const newEtapePointEnhanced: EtapeEdit = newEtape as unknown as EtapeEdit

  if (!newEtapePointEnhanced.contenu) {
    newEtapePointEnhanced.contenu = {}
  }

  // @ts-ignore
  return newEtapePointEnhanced
}
