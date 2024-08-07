import { Context, ITitre } from '../../../types'

import { titreEtapePropFind } from '../../../business/rules/titre-etape-prop-find'
import { titreValideCheck } from '../../../business/utils/titre-valide-check'
import { titresActivitesGet } from '../../../database/queries/titres-activites'
import { userSuper } from '../../../database/user-super'
import { Statistiques } from 'camino-common/src/statistiques'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { getAnnee, toCaminoDate } from 'camino-common/src/date'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { getTitresModifiesByMonth } from '../../rest/journal.queries'

const ACTIVITE_ANNEE_DEBUT = 2018

export const statistiquesGlobales = async (_: unknown, { pool }: Context): Promise<Statistiques> => {
  try {
    const titresActivites = await titresActivitesGet({}, {}, userSuper)
    const titresActivitesDepose = titresActivites.filter(titreActivite => titreActivite.annee >= ACTIVITE_ANNEE_DEBUT && titreActivite.activiteStatutId === ACTIVITES_STATUTS_IDS.DEPOSE).length
    const titresActivitesBeneficesEntreprise = Math.round((titresActivitesDepose * 2) / 7)
    const titresActivitesBeneficesAdministration = Math.round((titresActivitesDepose * 1) / 7)
    const titresModifies = await getTitresModifiesByMonth(pool)
    const demarches = titresActivites.filter(titreActivite => {
      const dateSaisie = titreActivite.dateSaisie

      return dateSaisie && dateSaisie.slice(0, 4) === new Date().getFullYear().toString()
    }).length

    return {
      titresActivitesBeneficesEntreprise,
      titresActivitesBeneficesAdministration,
      titresModifies,
      demarches,
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

/**
 * titres créés dans l'année et leur surface lors de l'octroi
 * @param titres -
 * @param annee
 */

export const titresSurfaceIndexBuild = (titres: ITitre[], annee: number) =>
  titres.reduce(
    (
      acc: {
        id: string
        typeId: TitreTypeId
        surface: number
      }[],
      titre
    ) => {
      // titres dont le dernier octroi valide avec une phase valide débute cette année
      const titreDemarcheOctroiValide = titre.demarches?.find(
        demarche => demarche.typeId === DEMARCHES_TYPES_IDS.Octroi && demarche.demarcheDateDebut && getAnnee(demarche.demarcheDateDebut) === annee.toString()
      )

      if (!titreDemarcheOctroiValide) return acc

      const surface = titreEtapePropFind('surface', titreDemarcheOctroiValide.demarcheDateDebut!, [titreDemarcheOctroiValide], titre.typeId) as number | null

      acc.push({
        id: titre.id,
        typeId: titre.typeId,
        surface: isNotNullNorUndefined(surface) ? surface * 100 : 0, // conversion 1 km² = 100 ha
      })

      return acc
    },
    []
  )

export const concessionsValidesBuild = (titres: ITitre[], annee: number) => {
  return titres
    .filter(titre => titre.typeId === 'cxw' && titreValideCheck(titre.demarches!, toCaminoDate(`${annee}-01-01`), toCaminoDate(`${annee}-12-31`)))
    .reduce(
      (acc: { quantite: number; surface: number }, concession) => {
        acc.quantite++
        acc.surface += isNotNullNorUndefined(concession.pointsEtape) && isNotNullNorUndefined(concession.pointsEtape.surface) ? concession.pointsEtape.surface * 100 : 0

        return acc
      },
      { quantite: 0, surface: 0 }
    )
}
