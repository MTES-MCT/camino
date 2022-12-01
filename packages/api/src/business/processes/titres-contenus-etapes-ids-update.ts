import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { contenusTitreEtapesIdsFind } from '../utils/props-titre-etapes-ids-find.js'
import { objectsDiffer } from '../../tools/index.js'
import { userSuper } from '../../database/user-super.js'

export const titresContenusEtapesIdsUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info(`contenus des titres (liens vers les contenus d'étapes)…`)

  const titres = await titresGet(
    { ids: titresIds },
    { fields: { type: { id: {} }, demarches: { etapes: { id: {} } } } },
    userSuper
  )

  const titresUpdated = []

  for (const titre of titres) {
    const contenusTitreEtapesIds = contenusTitreEtapesIdsFind(
      titre.titreStatutId!,
      titre.demarches!,
      titre.type!.contenuIds
    )

    // si une prop du titre est mise à jour
    const hasChanged =
      (!titre.contenusTitreEtapesIds && contenusTitreEtapesIds) ||
      (titre.contenusTitreEtapesIds && !contenusTitreEtapesIds) ||
      (titre.contenusTitreEtapesIds &&
        contenusTitreEtapesIds &&
        objectsDiffer(titre.contenusTitreEtapesIds, contenusTitreEtapesIds))

    if (hasChanged) {
      await titreUpdate(titre.id, { contenusTitreEtapesIds })

      console.info(
        'titre : props-contenu-etape (mise à jour) ->',
        `${titre.id} : ${JSON.stringify(contenusTitreEtapesIds)}`
      )

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
