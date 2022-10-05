import { ITitreDemarche, ITitreTypeTitreStatut } from '../../types'
import { demarchesTypesOctroi } from 'camino-common/src/permissions/titres-etapes'

const titrePublicFind = (
  titreStatutId: string,
  titresTypesTitresStatuts: ITitreTypeTitreStatut[],
  titreDemarches: ITitreDemarche[]
) => {
  const entreprisesLecture = true
  let publicLecture = false

  const titreTypeTitreStatut = titresTypesTitresStatuts.find(
    a => a.titreStatutId === titreStatutId
  )

  // si une jointure existe
  // et la démarche d'octroi (virtuelle ou non) est publique
  // alors le titre est public
  if (titreTypeTitreStatut?.publicLecture) {
    const titreDemarcheOctroi = titreDemarches.find(
      d => demarchesTypesOctroi.includes(d.typeId) && d.publicLecture
    )

    if (titreDemarcheOctroi) {
      publicLecture = true
    }
  }

  return { publicLecture, entreprisesLecture }
}

export default titrePublicFind
