import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'

export const etapeHeritageBuild = (stateEtape, apiEtape, titreTypeId, demarcheTypeId, etapeTypeId) => {
  const newEtape = {
    id: stateEtape.id,
    date: stateEtape.date,
    typeId: apiEtape.typeId,
    type: apiEtape.type,
    statutId: '',
    incertitudes: { date: stateEtape.incertitudes.date },
    titreDemarcheId: stateEtape.titreDemarcheId,
  }

  if (stateEtape.documents) {
    const documentsTypesIds = apiEtape.type.documentsTypes?.map(({ id }) => id)
    newEtape.documents = stateEtape.documents.filter(document => documentsTypesIds?.includes(document.typeId))
  }

  if (etapeTypeId) {
    const justificatifs = getEntrepriseDocuments(titreTypeId, demarcheTypeId, etapeTypeId)
    if (justificatifs.length > 0) {
      const justificatifsTypesIds = justificatifs.map(({ id }) => id)
      // TODO 2023-08-09 : Encore utilisé dans etape/edit.vue ?
      newEtape.justificatifs = stateEtape.justificatifs?.filter(justificatif => justificatifsTypesIds?.includes(justificatif.typeId)) ?? []
    }
  }

  // si
  // - on crée une nouvelle étape fondamentale
  // - on change le type d'étape (non-fondamentale -> fondamentale)
  // alors la nouvelle étape récupère les propriété de l'API
  if (!stateEtape.heritageProps && apiEtape.heritageProps) {
    newEtape.heritageProps = apiEtape.heritageProps
    newEtape.duree = apiEtape.duree
    newEtape.dateDebut = apiEtape.dateDebut
    newEtape.dateFin = apiEtape.dateFin
    newEtape.surface = apiEtape.surface
    newEtape.titulaires = apiEtape.titulaires
    newEtape.amodiataires = apiEtape.amodiataires
    newEtape.substances = apiEtape.substances
    newEtape.groupes = apiEtape.groupes
    newEtape.geoSystemeIds = apiEtape.geoSystemeIds
    newEtape.geoSystemeOpposableId = apiEtape.geoSystemeOpposableId
  }
  // si on change le type d'étape (fondamentale -> fondamentale)
  // alors on garde les propriétés actuelles
  else if (stateEtape.heritageProps && apiEtape.heritageProps) {
    newEtape.heritageProps = stateEtape.heritageProps
    newEtape.duree = stateEtape.duree
    newEtape.dateDebut = stateEtape.dateDebut
    newEtape.dateFin = stateEtape.dateFin
    newEtape.surface = stateEtape.surface
    newEtape.titulaires = stateEtape.titulaires
    newEtape.amodiataires = stateEtape.amodiataires
    newEtape.substances = stateEtape.substances
    newEtape.groupes = stateEtape.groupes
    newEtape.geoSystemeIds = stateEtape.geoSystemeIds
    newEtape.geoSystemeOpposableId = stateEtape.geoSystemeOpposableId
  }

  if (apiEtape.heritageContenu && Object.keys(apiEtape.heritageContenu).length) {
    Object.keys(apiEtape.heritageContenu).forEach(sectionId => {
      if (Object.keys(apiEtape.heritageContenu[sectionId]).length) {
        Object.keys(apiEtape.heritageContenu[sectionId]).forEach(elementId => {
          if (!newEtape.contenu) {
            newEtape.contenu = {}
          }

          if (!newEtape.contenu[sectionId]) {
            newEtape.contenu[sectionId] = {}
          }

          if (!newEtape.heritageContenu) {
            newEtape.heritageContenu = {}
          }

          if (!newEtape.heritageContenu[sectionId]) {
            newEtape.heritageContenu[sectionId] = {}
          }

          if (stateEtape.heritageContenu && stateEtape.heritageContenu[sectionId] && stateEtape.heritageContenu[sectionId][elementId]) {
            if (stateEtape.contenu && stateEtape.contenu[sectionId] && stateEtape.contenu[sectionId][elementId]) {
              newEtape.contenu[sectionId][elementId] = stateEtape.contenu[sectionId][elementId]
            }

            newEtape.heritageContenu[sectionId][elementId] = stateEtape.heritageContenu[sectionId][elementId]
          } else {
            if (apiEtape.contenu[sectionId]) {
              newEtape.contenu[sectionId][elementId] = apiEtape.contenu[sectionId][elementId]
            }

            newEtape.heritageContenu[sectionId][elementId] = apiEtape.heritageContenu[sectionId][elementId]
          }
        })
      }
    })
  }

  return newEtape
}
