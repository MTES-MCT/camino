import { titresGet, titreUpdate } from '../../database/queries/titres'
import { titreDateFinFind } from '../rules/titre-date-fin-find'
import { titreDateDebutFind } from '../rules/titre-date-debut-find'
import { titreDateDemandeFind } from '../rules/titre-date-demande-find'
import { userSuper } from '../../database/user-super'
import { DBTitre } from '../../database/models/titres'

export const titresDatesUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('date de début, de fin et de demande initiale des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { phase: { id: {} }, etapes: { points: { id: {} } } }
      }
    },
    userSuper
  )

  const titresUpdated = []
  for (const titre of titres) {
    const patch: Partial<DBTitre> = {}

    const dateFin = titreDateFinFind(titre.demarches!)

    if (titre.dateFin !== dateFin) {
      patch.dateFin = dateFin
    }

    const dateDebut = titreDateDebutFind(titre.demarches!, titre.typeId)

    if (titre.dateDebut !== dateDebut) {
      patch.dateDebut = dateDebut
    }

    const dateDemande = titreDateDemandeFind(titre.demarches!)

    if (titre.dateDemande !== dateDemande) {
      patch.dateDemande = dateDemande
    }

    if (Object.keys(patch).length) {
      await titreUpdate(titre.id, patch)

      console.info(
        'titre : dates (mise à jour) ->',
        `${titre.id}: ${JSON.stringify(patch)}`
      )

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
