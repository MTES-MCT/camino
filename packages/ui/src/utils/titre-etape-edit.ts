import { cloneAndClean } from './index'
import { CaminoDocument, Etape } from 'camino-common/src/etape'

type CaminoDocumentEdit = CaminoDocument & {
  fichierNouveau: null
}

type EtapeEdit = Omit<Etape, 'administrations' | 'documents'> & { documents: CaminoDocument[] }
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

  if (!newEtapePointEnhanced.documents) {
    newEtapePointEnhanced.documents = []
  } else {
    newEtapePointEnhanced.documents = newEtapePointEnhanced.documents.map(documentEtapeFormat)
  }

  // @ts-ignore
  return newEtapePointEnhanced
}

export const documentEtapeFormat = (document: CaminoDocument): CaminoDocumentEdit => {
  return { ...document, fichierNouveau: null }
}
