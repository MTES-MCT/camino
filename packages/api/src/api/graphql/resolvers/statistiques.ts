import { formatUser, ITitre } from '../../../types.js'

import { titreEtapePropFind } from '../../../business/rules/titre-etape-prop-find.js'
import { titreValideCheck } from '../../../business/utils/titre-valide-check.js'
import { titresActivitesGet } from '../../../database/queries/titres-activites.js'
import { userSuper } from '../../../database/user-super.js'
import { matomoData } from '../../../tools/api-matomo/index.js'
import { Statistiques, StatistiquesUtilisateurs } from 'camino-common/src/statistiques.js'
import Utilisateurs from '../../../database/models/utilisateurs.js'
import { isAdministration, isEntrepriseOrBureauDetudeRole } from 'camino-common/src/roles.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'
import { getAnnee, toCaminoAnnee, toCaminoDate } from 'camino-common/src/date.js'

const ACTIVITE_ANNEE_DEBUT = 2018

export const statistiquesGlobales = async (): Promise<Statistiques> => {
  try {
    const titresActivites = await titresActivitesGet({}, {}, userSuper)

    const titresActivitesDepose = titresActivites.filter(titreActivite => titreActivite.annee >= ACTIVITE_ANNEE_DEBUT && titreActivite.activiteStatutId === ACTIVITES_STATUTS_IDS.DEPOSE).length

    const titresActivitesBeneficesEntreprise = Math.round((titresActivitesDepose * 2) / 7)

    const titresActivitesBeneficesAdministration = Math.round((titresActivitesDepose * 1) / 7)

    const { recherches, titresModifies, actions, sessionDuree, telechargements, signalements, reutilisations } = await matomoData()

    const demarches = titresActivites.filter(titreActivite => {
      const dateSaisie = titreActivite.dateSaisie

      return dateSaisie && dateSaisie.slice(0, 4) === new Date().getFullYear().toString()
    }).length
    // TODO 2022-05-11 serait plus performant avec plusieurs petites requêtes sql ?
    const utilisateursInDb = await Utilisateurs.query().whereNot('role', 'super').whereNotNull('email').withGraphFetched({
      entreprises: {},
    })

    const utilisateurs: StatistiquesUtilisateurs = utilisateursInDb.map(formatUser).reduce<StatistiquesUtilisateurs>(
      (previousValue, user) => {
        if (user.email) {
          if (isAdministration(user)) {
            previousValue.rattachesAUnTypeDAdministration[Administrations[user.administrationId].typeId]++
          } else if (isEntrepriseOrBureauDetudeRole(user.role)) {
            previousValue.rattachesAUneEntreprise++
          } else {
            previousValue.visiteursAuthentifies++
          }
        }

        return previousValue
      },
      {
        rattachesAUnTypeDAdministration: {
          aut: 0,
          dea: 0,
          dre: 0,
          min: 0,
          ope: 0,
          pre: 0,
        },
        rattachesAUneEntreprise: 0,
        visiteursAuthentifies: 0,
      }
    )

    return {
      utilisateurs,
      titresActivitesBeneficesEntreprise,
      titresActivitesBeneficesAdministration,
      recherches,
      titresModifies,
      actions,
      sessionDuree,
      telechargements,
      demarches,
      signalements,
      reutilisations,
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
        surface: surface ? surface * 100 : 0, // conversion 1 km² = 100 ha
      })

      return acc
    },
    []
  )

export const concessionsValidesBuild = (titres: ITitre[], annee: number) => {
  return titres
    .filter(titre => titre.typeId === 'cxw' && titreValideCheck(titre.demarches!, toCaminoDate(`${annee}-01-01`), toCaminoDate(`${annee}-12-31`), titre.typeId))
    .reduce(
      (acc: { quantite: number; surface: number }, concession) => {
        acc.quantite++
        acc.surface += concession.surfaceEtape?.surface ? concession.surfaceEtape.surface * 100 : 0

        return acc
      },
      { quantite: 0, surface: 0 }
    )
}
