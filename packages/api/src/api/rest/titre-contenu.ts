import type { IContenu, ITitre, ITitreEtape } from '../../types.js'
import { titreGet } from '../../database/queries/titres.js'
import { Section } from 'camino-common/src/titres.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { Pool } from 'pg'

/**
 * @deprecated utiliser titreSectionsGet
 */
export const contenuFormat = ({
  demarches,
  contenusTitreEtapesIds,
}: {
  demarches: {
    etapes?: Pick<ITitreEtape, 'id' | 'contenu'>[] | undefined | null
  }[]
  contenusTitreEtapesIds: NonNullable<Required<ITitre['contenusTitreEtapesIds']>>
}): IContenu => {
  if (!demarches?.length) return {}

  const etapesIndex: Record<string, Pick<ITitreEtape, 'id' | 'contenu'>> = {}

  demarches.forEach(titreDemarche => {
    if (titreDemarche.etapes) {
      titreDemarche.etapes.forEach(etape => {
        etapesIndex[etape.id] = etape
      })
    }
  })

  const contenu: IContenu = {}

  Object.keys(contenusTitreEtapesIds).forEach((sectionId: string) => {
    Object.keys(contenusTitreEtapesIds[sectionId]).forEach(propId => {
      const etapeId = contenusTitreEtapesIds[sectionId][propId]

      const etape = etapesIndex[etapeId]

      if (etape?.contenu && etape.contenu[sectionId] && etape.contenu[sectionId][propId] !== undefined) {
        if (!contenu[sectionId]) {
          contenu[sectionId] = {}
        }

        contenu[sectionId][propId] = etape.contenu[sectionId][propId]
      }
    })
  })

  return contenu
}
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
}): Section[] => {
  if (demarches === undefined) {
    throw new Error('les démarches doivent être chargées')
  }

  if (!contenusTitreEtapesIds || !demarches) {
    return []
  }

  const sections: Section[] = []

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
                          titreTypeSection.elements.push({
                            ...etapeElement,
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

export const getTitresSections =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<Section[]>): Promise<void> => {
    try {
      const titreId: string | undefined = req.params.titreId
      if (!titreId) {
        throw new Error('le paramètre titreId est obligatoire')
      }

      const user = req.auth

      let result: Section[] = []
      const titre = await titreGet(
        titreId,
        {
          fields: {
            demarches: {
              type: { etapesTypes: { id: {} } },
              etapes: {
                type: { id: {} },
              },
            },
          },
        },
        user
      )

      if (titre) {
        result = titreSectionsGet(titre)
      }

      res.json(result)
    } catch (e) {
      console.error(e)

      throw e
    }
  }
