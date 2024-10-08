import { ITitre, ITitreActivite } from '../../../types'

import { titresGet } from '../../../database/queries/titres'
import { titresActivitesGet } from '../../../database/queries/titres-activites'
import { userSuper } from '../../../database/user-super'
import { concessionsValidesBuild, titresSurfaceIndexBuild } from '../../graphql/resolvers/statistiques'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { StatistiqueGranulatsMarinsStatAnnee, StatistiquesGranulatsMarins } from 'camino-common/src/statistiques'
import { capitalize } from 'camino-common/src/strings'
import { CaminoAnnee, caminoAnneeToNumber, intervalleAnnees, toCaminoAnnee } from 'camino-common/src/date'
import { isTitreValide, TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'

const statistiquesGranulatsMarinsActivitesFind = (titresActivites: ITitreActivite[], props: string[]) =>
  titresActivites.reduce(
    (acc: { [key: string]: number }, ta) => {
      acc.rapportProductionCount++

      if (ta.activiteStatutId === ACTIVITES_STATUTS_IDS.DEPOSE) acc.activitesDeposesQuantiteCount++

      props.forEach(prop => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (ta.contenu && ta.contenu.renseignementsProduction && ta.contenu.renseignementsProduction[prop]) {
          const value = ta.contenu!.renseignementsProduction[prop]
          acc[prop] += Math.abs(Number(value))
        }
      })

      return acc
    },
    {
      rapportProductionCount: 0,
      activitesDeposesQuantiteCount: 0,
      volumeGranulatsExtrait: 0,
    }
  )

type IStatsGranulatsMarinsTitresTypesHistorique = 'titresPrw' | 'titresPxw' | 'titresCxw'

type IStatsGranulatsMarinsTitresTypesInstant = 'titresInstructionExploration' | 'titresValPrw' | 'titresInstructionExploitation' | 'titresValCxw'

const statistiquesGranulatsMarinsTitresGet = (titres: { id: string; typeId: string; surface: number }[]) =>
  titres.reduce(
    (acc, titre) => {
      const id = `titres${capitalize(titre.typeId)}` as IStatsGranulatsMarinsTitresTypesHistorique

      acc[id].quantite++
      acc[id].surface += titre.surface

      return acc
    },
    {
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
    }
  )

const statistiquesGranulatsMarinsInstantBuild = (titres: ITitre[]): Omit<StatistiquesGranulatsMarins, 'annees'> => {
  const statsInstant = titres.reduce(
    (acc, titre) => {
      const isValide = isTitreValide(titre.titreStatutId)
      const instructionEnCours = [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire].includes(titre.titreStatutId)

      if ((isValide || instructionEnCours) && titre.pointsEtape && titre.pointsEtape.surface) {
        if ([TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS, TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS].includes(titre.typeId!)) {
          acc.surfaceExploration += titre.pointsEtape.surface
          if (instructionEnCours) {
            acc.titresInstructionExploration++
          }
        } else {
          if (isValide) {
            acc.surfaceExploitation += titre.pointsEtape.surface
          }
          if (instructionEnCours) {
            acc.titresInstructionExploitation++
          }
        }
        const id = `titres${capitalize(titre.titreStatutId)}${capitalize(titre.typeId!)}` as IStatsGranulatsMarinsTitresTypesInstant

        acc[id]++
      }

      return acc
    },
    {
      surfaceExploration: 0,
      surfaceExploitation: 0,
      titresInstructionExploration: 0,
      titresValPrw: 0,
      titresInstructionExploitation: 0,
      titresValCxw: 0,
    }
  )

  statsInstant.surfaceExploration = Math.floor(statsInstant.surfaceExploration * 100) // conversion 1 km² = 100 ha
  statsInstant.surfaceExploitation = Math.floor(statsInstant.surfaceExploitation * 100) // conversion 1 km² = 100 ha

  return statsInstant
}

const statistiquesGranulatsMarinsAnneeBuild = (titres: ITitre[], titresActivites: ITitreActivite[], annee: number): StatistiqueGranulatsMarinsStatAnnee => {
  // les titres créés dans l'année et leur surface lors de l'octroi
  const titresFiltered = titresSurfaceIndexBuild(titres, annee)

  const { titresPrw, titresPxw, titresCxw } = statistiquesGranulatsMarinsTitresGet(titresFiltered)

  // les activités de l'année
  const titresActivitesAnneeFiltered = titresActivites.filter(ta => ta.annee === annee)
  const statistiquesActivites = statistiquesGranulatsMarinsActivitesFind(titresActivitesAnneeFiltered, ['volumeGranulatsExtrait'])

  const activitesDeposesRatio = statistiquesActivites.rapportProductionCount
    ? Math.round((statistiquesActivites.activitesDeposesQuantiteCount * 100) / statistiquesActivites.rapportProductionCount)
    : 0

  const concessionsValides = concessionsValidesBuild(titres, annee)

  return {
    annee,
    titresPrw,
    titresPxw,
    titresCxw,
    volume: Math.floor(statistiquesActivites.volumeGranulatsExtrait),
    masse: Math.floor(statistiquesActivites.volumeGranulatsExtrait * 1.5),
    activitesDeposesQuantite: statistiquesActivites.activitesDeposesQuantiteCount,
    activitesDeposesRatio,
    concessionsValides,
  }
}

export const statistiquesGranulatsMarins = async (annee: CaminoAnnee): Promise<StatistiquesGranulatsMarins> => {
  try {
    // un tableau avec les années depuis 2006
    const annees = intervalleAnnees(toCaminoAnnee('2006'), annee)
    const titres = await titresGet(
      {
        domainesIds: ['w'],
        typesIds: ['ar', 'ap', 'pr', 'ax', 'px', 'cx'],
      },
      {
        fields: {
          pointsEtape: { id: {} },
          demarches: {
            etapes: { id: {} },
          },
        },
      },
      userSuper
    )

    const titresActivites = await titresActivitesGet(
      { annees, typesIds: ['wrp'] },
      {
        fields: {
          titre: { id: {} },
        },
      },
      userSuper
    )

    return {
      annees: annees.map(annee => statistiquesGranulatsMarinsAnneeBuild(titres, titresActivites, caminoAnneeToNumber(annee))),
      ...statistiquesGranulatsMarinsInstantBuild(titres),
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}
