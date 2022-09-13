import { titresGet } from '../../database/queries/titres'
import { titreDemarcheUpdate } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { titreDemarcheStatutIdFind } from '../rules/titre-demarche-statut-id-find'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'

// met à jour le statut des démarches d'un titre
export const titresDemarchesStatutIdUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('statut des démarches…')

  const titres = await titresGet(
    { ids: titresIds },
    { fields: { demarches: { etapes: { id: {} } } } },
    userSuper
  )

  // TODO: forcer la présence des démarches sur le titre
  // https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist/49725198#49725198
  const titresDemarchesUpdated = [] as string[]

  for (const titre of titres) {
    for (const titreDemarche of titre.demarches!) {
      const titreDemarcheEtapes = titreEtapesSortAscByOrdre(
        titreDemarche.etapes ?? []
      )

      const statutId = titreDemarcheStatutIdFind(
        titreDemarche.typeId,
        titreDemarcheEtapes,
        titre.typeId,
        titreDemarche.id
      )

      if (titreDemarche.statutId !== statutId) {
        await titreDemarcheUpdate(titreDemarche.id, { statutId })

        console.info(
          'titre / démarche : statut (mise à jour) ->',
          `${titreDemarche.id}: ${statutId}`
        )

        titresDemarchesUpdated.push(titreDemarche.id)
      }
    }
  }

  return titresDemarchesUpdated
}
