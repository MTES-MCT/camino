import { ITitre } from '../../types'

import { titresGet } from '../../database/queries/titres'
import { userSuper } from '../../database/user-super'

import { titreSlugAndRelationsUpdate } from '../utils/titre-slug-and-relations-update'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

export interface TitreSlugUpdate {
  newSlug: TitreSlug
  oldSlug: TitreSlug | undefined
}
// met à jour les slugs de titre
const titreSlugsUpdate = async (titre: ITitre): Promise<TitreSlugUpdate | null> => {
  const titreOldSlug = titre.slug

  try {
    const { slug, hasChanged } = await titreSlugAndRelationsUpdate(titre)

    if (!hasChanged) return null

    console.info('titre : slug (mise à jour) ->', slug)

    return { newSlug: slug, oldSlug: titreOldSlug }
  } catch (e) {
    console.error(`erreur: titreSlugsUpdate ${titreOldSlug}`, e)

    return null
  }
}

export const titresSlugsUpdate = async (titresIds?: string[]): Promise<TitreSlugUpdate[]> => {
  console.info()
  console.info('slugs de titres, démarches, étapes et activités')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          etapes: {
            id: {},
          },
        },
        activites: { id: {} },
      },
    },
    userSuper
  )

  const titresUpdatedIndex: TitreSlugUpdate[] = []

  for (const titre of titres) {
    const titreUpdatedIndex = await titreSlugsUpdate(titre)
    if (isNotNullNorUndefined(titreUpdatedIndex)) {
      titresUpdatedIndex.push(titreUpdatedIndex)
    }
  }

  return titresUpdatedIndex
}
