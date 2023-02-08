import type {
  IContenu,
  ITitre,
  ITitreEtape,
  IUtilisateur
} from '../../types.js'
import { titreGet } from '../../database/queries/titres.js'
import { Section } from 'camino-common/src/titres.js'
import express from 'express'

import { CustomResponse } from './express-type.js'
import { userGet } from '../../database/queries/utilisateurs.js'

/**
 * @deprecated utiliser titreSectionsGet
 */
export const contenuFormat = ({
  demarches,
  contenusTitreEtapesIds
}: {
  demarches: {
    etapes?: Pick<ITitreEtape, 'id' | 'contenu'>[] | undefined | null
  }[]
  contenusTitreEtapesIds: NonNullable<
    Required<ITitre['contenusTitreEtapesIds']>
  >
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

      if (
        etape?.contenu &&
        etape.contenu[sectionId] &&
        etape.contenu[sectionId][propId] !== undefined
      ) {
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
  demarches,
  contenusTitreEtapesIds
}: {
  demarches?:
    | {
        etapes?:
          | Pick<
              ITitreEtape,
              'id' | 'contenu' | 'type' | 'sectionsSpecifiques'
            >[]
          | undefined
          | null
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

  demarches.forEach(demarche =>
    demarche.etapes?.forEach(etape => {
      if (!etape.type) {
        throw new Error('le type d’étape doit être chargé')
      }

      if (etape.sectionsSpecifiques) {
        const etapeTypeSections = etape.type.sections

        const aggregateSections = etape.sectionsSpecifiques
        if (etapeTypeSections?.length) {
          etapeTypeSections.forEach(s => {
            if (etape.sectionsSpecifiques?.every(({ id }) => id !== s.id)) {
              aggregateSections.push(s)
            }
          })
        }
        etape.type.sections = aggregateSections
      }
    })
  )

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
                if (
                  etape.contenu &&
                  etape.contenu[sectionId] &&
                  etape.contenu[sectionId][elementId] !== undefined &&
                  etape.type?.sections
                ) {
                  const etapeSection = etape.type.sections.find(
                    s => s.id === sectionId
                  )

                  if (etapeSection && etapeSection.elements) {
                    const etapeElement = etapeSection.elements.find(
                      e => e.id === elementId
                    )

                    if (etapeElement) {
                      // ajoute la section dans le titre si elle n'existe pas encore
                      let titreTypeSection = sections.find(
                        s => s.id === sectionId
                      )

                      if (!titreTypeSection) {
                        titreTypeSection = { ...etapeSection, elements: [] }

                        sections.push(titreTypeSection)
                      }

                      if (!titreTypeSection.elements) {
                        titreTypeSection.elements = []
                      }

                      // ajoute l'élément dans les sections du titre s'il n'existe pas encore
                      const titreElement = titreTypeSection.elements.find(
                        e => e.id === elementId
                      )
                      const value = etape.contenu[sectionId][elementId]
                      if (value !== null) {
                        if (!titreElement) {
                          titreTypeSection.elements.push({
                            ...etapeElement,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            value
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

export const getTitresSections = async (
  req: express.Request,
  res: CustomResponse<Section[]>
): Promise<void> => {
  try {
    const titreId: string | undefined = req.params.titreId
    if (!titreId) {
      throw new Error('le paramètre titreId est obligatoire')
    }
    const userId = (req.user as unknown as IUtilisateur | undefined)?.id
    const user = await userGet(userId)

    let result: Section[] = []
    const titre = await titreGet(
      titreId,
      {
        fields: {
          demarches: {
            type: { etapesTypes: { id: {} } },
            etapes: {
              type: { id: {} }
            }
          }
        }
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
