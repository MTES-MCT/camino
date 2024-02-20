export const etapeSaveFormat = etape => {
  const decisionsAnnexesContenu = etape.decisionsAnnexesContenu
  etape = JSON.parse(JSON.stringify(etape))
  etape.decisionsAnnexesContenu = decisionsAnnexesContenu

  etape.documentIds = etape.documents?.filter(d => d.id !== d.typeId).map(({ id }) => id)

  delete etape.slug
  delete etape.justificatifs
  delete etape.documents

  if (!etape.contenu || !Object.keys(etape.contenu).length) {
    delete etape.contenu
  }

  if (!etape.decisionsAnnexesContenu || !Object.keys(etape.decisionsAnnexesContenu).length) {
    delete etape.decisionsAnnexesContenu
  }

  delete etape.decisionsAnnexesSections

  const props = ['date', 'dateDebut', 'dateFin', 'duree']

  props.forEach(prop => {
    if (etape[prop] === '') {
      etape[prop] = null
    }
  })

  delete etape.demarche
  delete etape.surface

  etape.substances = etape.substances?.filter(substanceId => !!substanceId)

  const propsIds = ['titulaires', 'amodiataires', 'administrations']

  // supprime les champs dont les ids sont vides
  propsIds.forEach(propId => {
    if (etape[propId]) {
      etape[propId] = etape[propId].filter(({ id }) => id)
    }
  })

  if (etape.heritageProps) {
    Object.keys(etape.heritageProps).forEach(id => {
      delete etape.heritageProps[id].etape
    })
  }

  if (etape.heritageContenu) {
    Object.keys(etape.heritageContenu).forEach(sectionId => {
      Object.keys(etape.heritageContenu[sectionId]).forEach(elementId => {
        delete etape.heritageContenu[sectionId][elementId].etape
        delete etape.heritageContenu[sectionId][elementId].etapeId
      })
    })
  }

  return etape
}
