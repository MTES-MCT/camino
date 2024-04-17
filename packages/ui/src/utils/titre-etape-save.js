export const etapeSaveFormat = etape => {
  etape = JSON.parse(JSON.stringify(etape))

  delete etape.slug

  if (!etape.contenu || !Object.keys(etape.contenu).length) {
    delete etape.contenu
  }

  const props = ['date', 'dateDebut', 'dateFin', 'duree']

  props.forEach(prop => {
    if (etape[prop] === '') {
      etape[prop] = null
    }
  })

  delete etape.demarche
  delete etape.surface
  delete etape.geojson4326Forages

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
