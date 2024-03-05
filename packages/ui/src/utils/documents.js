import { getCurrent } from 'camino-common/src/date'

export const documentsRequiredAdd = (documents, documentsTypes) => {
  // supprime tous les documents temporaires
  documents = documents?.filter(d => d.id !== d.typeId)

  // supprime les documents dont le documentType n'existe pas
  const newDocuments =
    documents?.filter(d => {
      const documentsTypesIds = documentsTypes.map(({ id }) => id)
      return documentsTypesIds.includes(d.typeId)
    }) || []

  // crée les documents dont le type est obligatoires si ils n'existent pas
  documentsTypes?.forEach(documentType => {
    if (!documentType.optionnel && !newDocuments.find(d => d.typeId === documentType.id)) {
      newDocuments.push({
        id: documentType.id,
        typeId: documentType.id,
        // TODO 2024-02-29 avant on mettait ça a true si l'utilisateur était un admin, pourquoi ?
        entreprisesLecture: false,
        publicLecture: false,
        fichier: null,
        fichierNouveau: null,
        fichierTypeId: null,
        date: getCurrent(),
        suppression: false,
      })
    }
  })

  // on interdit la suppression des documents obligatoires et imcomplets
  documents?.forEach(d => {
    d.suppression = d.suppression && d.id !== d.typeId
  })

  return newDocuments
}
