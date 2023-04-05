import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { titreDateFinFind } from '../rules/titre-date-fin-find.js'
import { titreDateDebutFind } from '../rules/titre-date-debut-find.js'
import { titreDateDemandeFind } from '../rules/titre-date-demande-find.js'
import { userSuper } from '../../database/user-super.js'
import { DBTitre } from '../../database/models/titres.js'

//TODO 2023-04-04 surement utilisé que par les exports, à faire à la volée et surement utiliser les phases pour trouver la date de début et la date de fin
export const titresDatesUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('date de début, de fin et de demande initiale des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { phase: { id: {} }, etapes: { points: { id: {} } } },
      },
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

      console.info('titre : dates (mise à jour) ->', `${titre.id}: ${JSON.stringify(patch)}`)

      titresUpdated.push(titre.id)
    }
  }

  return titresUpdated
}
