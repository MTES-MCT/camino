import { ITitre } from '../../../types'

import { titreEtapePropFind } from '../../../business/rules/titre-etape-prop-find'
import { titreValideCheck } from '../../../business/utils/titre-valide-check'
import { debug } from '../../../config'
import { titresActivitesGet } from '../../../database/queries/titres-activites'
import { userSuper } from '../../../database/user-super'
import { matomoData } from '../../../tools/api-matomo'
import {
  Statistiques,
  StatistiquesUtilisateurs
} from 'camino-common/src/statistiques'
import Utilisateurs from '../../../database/models/utilisateurs'
import { isAdministration } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/administrations'

const ACTIVITE_ANNEE_DEBUT = 2018

const statistiquesGlobales = async (): Promise<Statistiques> => {
  try {
    const titresActivites = await titresActivitesGet({}, {}, userSuper)

    const titresActivitesDepose = titresActivites.filter(
      titreActivite =>
        titreActivite.annee >= ACTIVITE_ANNEE_DEBUT &&
        titreActivite.statutId === 'dep'
    ).length

    const titresActivitesBeneficesEntreprise = Math.round(
      (titresActivitesDepose * 2) / 7
    )

    const titresActivitesBeneficesAdministration = Math.round(
      (titresActivitesDepose * 1) / 7
    )

    const {
      recherches,
      titresModifies,
      actions,
      sessionDuree,
      telechargements,
      signalements,
      reutilisations
    } = await matomoData()

    const demarches = titresActivites.filter(titreActivite => {
      const dateSaisie = titreActivite.dateSaisie

      return (
        dateSaisie &&
        dateSaisie.slice(0, 4) === new Date().getFullYear().toString()
      )
    }).length
    // TODO 2022-05-11 serait plus performant avec plusieurs petites requêtes sql ?
    const utilisateursInDb = await Utilisateurs.query().withGraphFetched({
      entreprises: {}
    })

    const utilisateurs: StatistiquesUtilisateurs =
      utilisateursInDb.reduce<StatistiquesUtilisateurs>(
        (previousValue, user) => {
          if (user.email) {
            // TODO 2022-05-16: restreindre le fait qu'un utilisateur ayant une administration ne PEUT PAS avoir d'entreprise
            if (isAdministration(user)) {
              previousValue.rattachesAUnTypeDAdministration[
                Administrations[user.administrationId].typeId
              ]++
            } else if (user.entreprises?.length) {
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
            pre: 0
          },
          rattachesAUneEntreprise: 0,
          visiteursAuthentifies: 0
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
      reutilisations
    }
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

/**
 * titres créés dans l'année et leur surface lors de l'octroi
 * @param titres -
 * @param annee
 */

const titresSurfaceIndexBuild = (titres: ITitre[], annee: number) =>
  titres.reduce(
    (
      acc: {
        id: string
        typeId: string
        surface: number
      }[],
      titre
    ) => {
      // titres dont le dernier octroi valide avec une phase valide débute cette année
      const titreDemarcheOctroiValide = titre.demarches?.find(
        demarche =>
          demarche.typeId === 'oct' &&
          demarche.phase &&
          demarche.phase.dateDebut &&
          demarche.phase.dateDebut.substr(0, 4) === annee.toString()
      )

      if (!titreDemarcheOctroiValide) return acc

      const surface = titreEtapePropFind(
        'surface',
        titreDemarcheOctroiValide.phase!.dateDebut,
        [titreDemarcheOctroiValide],
        titre.typeId
      ) as number | null

      acc.push({
        id: titre.id,
        typeId: titre.typeId,
        surface: surface ? surface * 100 : 0 // conversion 1 km² = 100 ha
      })

      return acc
    },
    []
  )

const concessionsValidesBuild = (titres: ITitre[], annee: number) => {
  return titres
    .filter(
      titre =>
        titre.typeId === 'cxw' &&
        titreValideCheck(
          titre.demarches!,
          `${annee}-01-01`,
          `${annee}-12-31`,
          titre.typeId
        )
    )
    .reduce(
      (acc: { quantite: number; surface: number }, concession) => {
        acc.quantite++
        acc.surface += concession.surfaceEtape?.surface
          ? concession.surfaceEtape.surface * 100
          : 0

        return acc
      },
      { quantite: 0, surface: 0 }
    )
}

export {
  statistiquesGlobales,
  titresSurfaceIndexBuild,
  concessionsValidesBuild
}
