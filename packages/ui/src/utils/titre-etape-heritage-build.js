export const etapeHeritageBuild = (date, titreDemarcheId, apiEtape) => {
  const newEtape = {
    date,
    typeId: apiEtape.typeId,
    statutId: '',
    titreDemarcheId,
  }

  // si
  // - on crée une nouvelle étape fondamentale
  // - on change le type d'étape (non-fondamentale -> fondamentale)
  // alors la nouvelle étape récupère les propriété de l'API
  if (apiEtape.heritageProps) {
    newEtape.heritageProps = apiEtape.heritageProps
    newEtape.duree = apiEtape.duree
    newEtape.dateDebut = apiEtape.dateDebut
    newEtape.dateFin = apiEtape.dateFin
    newEtape.surface = apiEtape.surface
    newEtape.titulaires = apiEtape.titulaires
    newEtape.amodiataires = apiEtape.amodiataires
    newEtape.substances = apiEtape.substances
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

          if (apiEtape.contenu[sectionId]) {
            newEtape.contenu[sectionId][elementId] = apiEtape.contenu[sectionId][elementId]
          }

          newEtape.heritageContenu[sectionId][elementId] = apiEtape.heritageContenu[sectionId][elementId]
        })
      }
    })
  }

  return newEtape
}
