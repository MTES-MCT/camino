import { titreDemarcheUpdate } from '../../database/queries/titres-demarches.js'
import { titreDemarcheStatutIdFind } from '../rules/titre-demarche-statut-id-find.js'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort.js'
import { getDemarches } from './titres-etapes-heritage-contenu-update.js'

// met à jour le statut des démarches d'un titre
export const titresDemarchesStatutIdUpdate = async (titresId?: string) => {
  console.info()
  console.info('statut des démarches…')

  const titresDemarches = await getDemarches(undefined, titresId)

  // TODO: forcer la présence des démarches sur le titre
  // https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist/49725198#49725198
  const titresDemarchesUpdated: string[] = []

  for (const titreDemarche of Object.values(titresDemarches)) {
    const titreDemarcheEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes ?? [])

    const statutId = titreDemarcheStatutIdFind(titreDemarche.typeId, titreDemarcheEtapes, titreDemarche.titreTypeId, titreDemarche.id)

    if (titreDemarche.statutId !== statutId) {
      await titreDemarcheUpdate(titreDemarche.id, { statutId })

      console.info('titre / démarche : statut (mise à jour) ->', `${titreDemarche.id}: ${statutId}`)

      titresDemarchesUpdated.push(titreDemarche.id)
    }
  }

  return titresDemarchesUpdated
}
