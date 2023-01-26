import type {
  IContenu,
  ISection,
  ITitre,
  ITitreEtape,
  IUtilisateur
} from '../../types.js'
import { titreGet } from '../../database/queries/titres.js'
import { NotNullableKeys } from 'camino-common/src/typescript-tools.js'

export const titreContenuFormat = ({
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
  demarches: {
    etapes?: Pick<ITitreEtape, 'id' | 'contenu' | 'type'>[] | undefined | null
  }[]
  contenusTitreEtapesIds: NonNullable<
    Required<ITitre['contenusTitreEtapesIds']>
  >
}): ISection[] => {
  const sections: ISection[] = []

  Object.keys(contenusTitreEtapesIds).some(sectionId => {
    if (!contenusTitreEtapesIds[sectionId]) return false

    Object.keys(contenusTitreEtapesIds[sectionId]).some(elementId => {
      const etapeId = contenusTitreEtapesIds[sectionId][elementId]

      if (!etapeId) return false

      demarches.some(d => {
        if (!d.etapes) return false

        const etape = d.etapes.find(e => e.id === etapeId)

        if (!etape) return false

        // sinon, si l'étape correspond à l'id de `contenusTitreEtapesIds`
        // et que l'étape n'a ni contenu ni section ni l'élément qui nous intéresse
        // on ne cherche pas plus loin
        if (
          !etape.contenu ||
          !etape.contenu[sectionId] ||
          etape.contenu[sectionId][elementId] === undefined ||
          !etape.type?.sections
        ) {
          return false
        }

        const etapeSection = etape.type.sections.find(s => s.id === sectionId)

        if (!etapeSection || !etapeSection.elements) return false

        const etapeElement = etapeSection.elements.find(e => e.id === elementId)

        if (!etapeElement) return false

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
        const titreElement = titreTypeSection.elements.find(
          e => e.id === elementId
        )

        if (!titreElement) {
          titreTypeSection.elements.push(etapeElement)
        }

        // continue l'itération
        return false
      })

      return false
    })

    return false
  })

  return sections
}

export const titreSectionsAndContenuGet = async (
  titreId: string,
  user: IUtilisateur | null | undefined
): Promise<{ contenu: IContenu; sections: ISection[] } | null> => {
  const titre = await titreGet(
    titreId,
    {
      fields: {
        contenusTitreEtapesIds: { id: {} },
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

  const has = <
    T extends Record<string | symbol | number, any>,
    K extends keyof T
  >(
    key: K,
    x: T
  ): x is Required<NotNullableKeys<Pick<T, K>>> & T => key in x

  if (
    !titre ||
    !has('contenusTitreEtapesIds', titre) ||
    !has('demarches', titre) ||
    !titre.demarches.length
  ) {
    return null
  }

  return {
    contenu: titreContenuFormat(titre),
    sections: titreSectionsGet(titre)
  }
}
