import type { ITitre, ITitreEtape } from '../../types.js'
import { SectionWithValue } from 'camino-common/src/sections.js'
import { getElementValeurs, getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'

export const titreSectionsGet = ({
  typeId,
  demarches,
  contenusTitreEtapesIds,
}: {
  typeId: TitreTypeId
  demarches?:
    | {
        typeId: DemarcheTypeId
        etapes?: Pick<ITitreEtape, 'id' | 'contenu' | 'typeId'>[] | undefined | null
      }[]
    | null
    | undefined
  contenusTitreEtapesIds?: ITitre['contenusTitreEtapesIds']
}): SectionWithValue[] => {
  if (demarches === undefined) {
    throw new Error('les démarches doivent être chargées')
  }

  if (!contenusTitreEtapesIds || !demarches) {
    return []
  }

  const sections: SectionWithValue[] = []

  Object.keys(contenusTitreEtapesIds).forEach(sectionId => {
    if (contenusTitreEtapesIds[sectionId]) {
      Object.keys(contenusTitreEtapesIds[sectionId]).forEach(elementId => {
        const etapeId = contenusTitreEtapesIds[sectionId][elementId]

        if (etapeId) {
          demarches.forEach(d => {
            if (d.etapes) {
              const etape = d.etapes.find(e => e.id === etapeId)

              if (etape) {
                // sinon, si l'étape correspond à l'id de `contenusTitreEtapesIds`
                // et que l'étape n'a ni contenu ni section ni l'élément qui nous intéresse
                // on ne cherche pas plus loin
                const etapeSections = getSections(typeId, d.typeId, etape.typeId)
                if (etape.contenu && etape.contenu[sectionId] && etape.contenu[sectionId][elementId] !== undefined && etapeSections?.length) {
                  const etapeSection = etapeSections.find(s => s.id === sectionId)

                  if (etapeSection && etapeSection.elements) {
                    const etapeElement = etapeSection.elements.find(e => e.id === elementId)

                    if (etapeElement) {
                      // ajoute la section dans le titre si elle n'existe pas encore
                      let titreTypeSection = sections.find(s => s.id === sectionId)

                      if (!titreTypeSection) {
                        titreTypeSection = { ...etapeSection, elements: [] }

                        sections.push(titreTypeSection)
                      }

                      if (!titreTypeSection.elements) {
                        titreTypeSection.elements = []
                      }

                      // ajoute l'élément dans les sections du titre s'il n'existe pas encore
                      const titreElement = titreTypeSection.elements.find(e => e.id === elementId)
                      const value = etape.contenu[sectionId][elementId]
                      if (value !== null) {
                        if (!titreElement) {
                          const optionsObject: { options?: { id: string; nom: string }[] } = {}
                          if (etapeElement.type === 'select') {
                            optionsObject.options = getElementValeurs(etapeElement)
                          }

                          titreTypeSection.elements.push({
                            ...etapeElement,
                            ...optionsObject,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            value,
                          })
                        }
                      }
                    }
                  }
                }
              }
            }
          })
        }
      })
    }
  })

  return sections
}
