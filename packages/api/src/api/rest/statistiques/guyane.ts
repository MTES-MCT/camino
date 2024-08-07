import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes'
import { StatistiquesGuyaneData } from 'camino-common/src/statistiques'
import { evolutionTitres } from './evolution-titres'
import { ITitre, ITitreActivite } from '../../../types'

import { titresGet } from '../../../database/queries/titres'
import { titresActivitesGet } from '../../../database/queries/titres-activites'
import { userSuper } from '../../../database/user-super'
import { titresSurfaceIndexBuild } from '../../graphql/resolvers/statistiques'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { CaminoAnnee, caminoAnneeToNumber, intervalleAnnees, toCaminoAnnee } from 'camino-common/src/date'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import type { Pool } from 'pg'
import { capitalize } from 'camino-common/src/strings'
import { isTitreValide } from 'camino-common/src/static/titresStatuts'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

const statistiquesGuyaneActivitesBuild = (sectionId: string, titresActivites: ITitreActivite[], init: { [key: string]: number }) =>
  titresActivites.reduce((acc: { [key: string]: number }, ta) => {
    acc.rapportProductionOrCount++

    if (ta.activiteStatutId === ACTIVITES_STATUTS_IDS.DEPOSE) {
      acc.activitesDeposesQuantiteCount++
    }

    Object.keys(acc).forEach(prop => {
      if (isNotNullNorUndefined(ta.contenu?.[sectionId]?.[prop]) && (prop !== 'effectifs' || ta.titre!.typeId === 'axm' || ta.titre!.typeId === 'pxm' || ta.titre!.typeId === 'cxm')) {
        const value = ta.contenu![sectionId][prop]

        acc[prop] += Number(value)
      }
    })

    return acc
  }, init)

const statsGuyaneTitresTypes = ['arm', 'prm', 'axm', 'cxm'] as const satisfies readonly TitreTypeId[]
type IStatsGuyaneTitresTypes = `titres${Capitalize<(typeof statsGuyaneTitresTypes)[number]>}`
const isStatsGuyaneTitreType = (titreTypeId: TitreTypeId): titreTypeId is (typeof statsGuyaneTitresTypes)[number] => {
  return statsGuyaneTitresTypes.includes(titreTypeId)
}
const statistiquesGuyaneTitresBuild = (titres: { id: string; typeId: TitreTypeId; surface: number }[]): Record<IStatsGuyaneTitresTypes, { quantite: number; surface: number }> =>
  titres.reduce(
    (acc, titre) => {
      if (isStatsGuyaneTitreType(titre.typeId)) {
        const id = `titres${capitalize(titre.typeId)}` as const

        acc[id].quantite++
        acc[id].surface += titre.surface
      }

      return acc
    },
    {
      titresArm: { quantite: 0, surface: 0 },
      titresPrm: { quantite: 0, surface: 0 },
      titresAxm: { quantite: 0, surface: 0 },
      titresCxm: { quantite: 0, surface: 0 },
    }
  )

const statistiquesGuyaneInstantBuild = (titres: ITitre[]): Record<IStatsGuyaneTitresTypes, number> & { surfaceExploration: number; surfaceExploitation: number } => {
  const statsInstant = titres.reduce(
    (acc, titre) => {
      if (isTitreValide(titre.titreStatutId)) {
        if (['arm', 'prm'].includes(titre.typeId)) {
          acc.surfaceExploration += titre.pointsEtape?.surface ?? 0
        } else {
          acc.surfaceExploitation += titre.pointsEtape?.surface ?? 0
        }

        const titreId = titre.typeId
        if (isStatsGuyaneTitreType(titreId)) {
          const id = `titres${capitalize(titreId)}` as const

          acc[id]++
        }
      }

      return acc
    },
    {
      surfaceExploration: 0,
      surfaceExploitation: 0,
      titresArm: 0,
      titresPrm: 0,
      titresAxm: 0,
      titresCxm: 0,
    }
  )

  statsInstant.surfaceExploration = Math.floor(statsInstant.surfaceExploration * 100) // conversion 1 km² = 100 ha
  statsInstant.surfaceExploitation = Math.floor(statsInstant.surfaceExploitation * 100) // conversion 1 km² = 100 ha

  return statsInstant
}

const statistiquesGuyaneAnneeBuild = (titres: ITitre[], titresActivites: ITitreActivite[], annee: CaminoAnnee) => {
  const titresFiltered = titresSurfaceIndexBuild(titres, +annee)

  const { titresArm, titresPrm, titresAxm, titresCxm } = statistiquesGuyaneTitresBuild(titresFiltered)

  // les activités de type grp de l'année
  const titresActivitesGrpFiltered = titresActivites.filter(ta => ta.annee === +annee && ta.typeId === 'grp')
  const statistiquesActivitesGrp = statistiquesGuyaneActivitesBuild('renseignements', titresActivitesGrpFiltered, {
    carburantConventionnel: 0,
    carburantDetaxe: 0,
    mercure: 0,
    environnement: 0,
    effectifs: 0,
    activitesDeposesQuantiteCount: 0,
    rapportProductionOrCount: 0,
  })
  // les activités de type gra et grx de l'année
  const titresActivitesGraFiltered = titresActivites.filter(ta => ta.annee === +annee && (ta.typeId === 'gra' || ta.typeId === 'grx'))
  const statistiquesActivitesGra = statistiquesGuyaneActivitesBuild('substancesFiscales', titresActivitesGraFiltered, {
    auru: 0,
    activitesDeposesQuantiteCount: 0,
    rapportProductionOrCount: 0,
  })

  // Pour les années 2017 et 2018, on affiche les chiffres "DRFIP" soit : pour 2017 : 1 485 kg  et pour 2018 : 1320 kg.
  if (annee === toCaminoAnnee(2017)) {
    // les rapports annuels n'existaient pas en 2017
    statistiquesActivitesGra.auru = 1485
  } else if (annee === toCaminoAnnee(2018)) {
    // à l'époque  l'or net annuel était déclaré "à coté" de la production d'or brut du 4ème trimestre, ce qui a provoqué la confusion des opérateurs et des erreurs en cascade.
    statistiquesActivitesGra.auru = 1320
  }

  const activitesDeposesRatio =
    statistiquesActivitesGrp.rapportProductionOrCount + statistiquesActivitesGra.rapportProductionOrCount
      ? Math.round(
          ((statistiquesActivitesGrp.activitesDeposesQuantiteCount + statistiquesActivitesGra.activitesDeposesQuantiteCount) * 100) /
            (statistiquesActivitesGrp.rapportProductionOrCount + statistiquesActivitesGra.rapportProductionOrCount)
        )
      : 0

  return {
    annee,
    titresArm,
    titresPrm,
    titresAxm,
    titresCxm,
    orNet: Math.floor(statistiquesActivitesGra.auru),
    carburantConventionnel: Math.floor(statistiquesActivitesGrp.carburantConventionnel / 1000), // milliers de litres
    carburantDetaxe: Math.floor(statistiquesActivitesGrp.carburantDetaxe / 1000), // milliers de litres
    mercure: Math.floor(statistiquesActivitesGrp.mercure),
    environnementCout: Math.floor(statistiquesActivitesGrp.environnement),
    effectifs: Math.round(statistiquesActivitesGrp.effectifs / 4), // somme des effectifs sur 4 trimestre
    activitesDeposesQuantite: statistiquesActivitesGrp.activitesDeposesQuantiteCount + statistiquesActivitesGra.activitesDeposesQuantiteCount,
    activitesDeposesRatio,
  }
}

const statistiquesGuyane = async (anneeCurrent: CaminoAnnee) => {
  try {
    const anneeMoins5 = caminoAnneeToNumber(anneeCurrent) - 5
    // un tableau avec les 5 dernières années
    const annees = intervalleAnnees(toCaminoAnnee(anneeMoins5), anneeCurrent)

    const titres = await titresGet(
      {
        domainesIds: ['m'],
        typesIds: ['ar', 'pr', 'ax', 'px', 'cx'],
        departements: [DEPARTEMENT_IDS.Guyane],
      },
      {
        fields: {
          pointsEtape: { id: {} },
          demarches: { etapes: { id: {} } },
        },
      },
      userSuper
    )

    const titresActivites = await titresActivitesGet(
      {
        titresDepartements: [DEPARTEMENT_IDS.Guyane],
        annees,
        typesIds: ['grp', 'gra', 'grx'],
      },
      { fields: { titre: { id: {} } } },
      userSuper
    )

    return {
      annees: annees.map(annee => statistiquesGuyaneAnneeBuild(titres, titresActivites, annee)),
      ...statistiquesGuyaneInstantBuild(titres),
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const getGuyaneStatsInside = async (pool: Pool, anneeCurrent: CaminoAnnee): Promise<StatistiquesGuyaneData> => {
  const guyane = [DEPARTEMENT_IDS.Guyane]
  const armData = await evolutionTitres(pool, TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE, guyane, anneeCurrent)
  const prmData = await evolutionTitres(pool, TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, guyane, anneeCurrent)
  const axmData = await evolutionTitres(pool, TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION, guyane, anneeCurrent)
  const cxmData = await evolutionTitres(pool, TITRES_TYPES_TYPES_IDS.CONCESSION, guyane, anneeCurrent)

  const fromObjection = await statistiquesGuyane(anneeCurrent)

  return {
    arm: armData,
    prm: prmData,
    axm: axmData,
    cxm: cxmData,
    ...fromObjection,
  }
}
