import { CustomResponse } from './express-type'
import express from 'express'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userGet } from '../../database/queries/utilisateurs'
import { ITitre, IUser } from '../../types'
import { constants } from 'http2'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import {
  StatistiquesDGTM,
  StatistiquesMinerauxMetauxMetropole,
  StatistiquesMinerauxMetauxMetropoleSubstances
} from 'camino-common/src/statistiques'
import {
  CaminoDate,
  getAnnee,
  daysBetween,
  getCurrentAnnee,
  CaminoAnnee,
  valideAnnee
} from 'camino-common/src/date'
import { fromUniteFiscaleToUnite } from 'camino-common/src/static/unites'
import { knex } from '../../knex'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'
import { userSuper } from '../../database/user-super'
import { titresGet } from '../../database/queries/titres'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/static/region'
import { Departements } from 'camino-common/src/static/departement'
import { SubstancesFiscale } from 'camino-common/src/static/substancesFiscales'

const anneeDepartStats = 2015

export const getDGTMStats = async (
  req: express.Request,
  res: CustomResponse<StatistiquesDGTM>
) => {
  const userId = (req.user as unknown as IUser | undefined)?.id

  const user = await userGet(userId)

  const administrationId = ADMINISTRATION_IDS['DGTM - GUYANE']

  if (user?.administrationId !== administrationId) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const result: StatistiquesDGTM = {
      depotEtInstructions: {},
      sdom: {},
      delais: {}
    }

    const phaseOctrois: {
      id: string
      dateDebut: CaminoDate
      typeId: TitreTypeId
      sdomZoneId: SDOMZoneId | null
    }[] = await knex
      .select(
        'titresPhases.dateDebut',
        'titres.typeId',
        'titres__sdom_zones.sdom_zone_id'
      )
      .distinct('titres.id')
      .from('titresPhases')
      .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .leftJoin(
        'titresAdministrationsGestionnaires',
        'titres.id',
        'titresAdministrationsGestionnaires.titreId'
      )
      .leftJoin(
        'titresAdministrations',
        'titres.id',
        'titresAdministrations.titreId'
      )
      .joinRaw(
        "left join titres_administrations_locales on titres_administrations_locales.titre_etape_id = titres.props_titre_etapes_ids ->> 'administrations'"
      )
      .joinRaw(
        "left join titres__sdom_zones on titres__sdom_zones.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'"
      )
      .where('titresDemarches.typeId', 'oct')
      .andWhere('titresPhases.dateDebut', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder =>
        builder
          .where(
            'titresAdministrationsGestionnaires.administrationId',
            administrationId
          )
          .orWhere(
            'titresAdministrationsLocales.administrationId',
            administrationId
          )
          .orWhere('titresAdministrations.administrationId', administrationId)
      )

    phaseOctrois?.forEach(phase => {
      const annee = getAnnee(phase.dateDebut)

      if (!result.depotEtInstructions[annee]) {
        result.depotEtInstructions[annee] = {
          totalAXMDeposees: 0,
          totalAXMOctroyees: 0,
          totalTitresDeposes: 0,
          totalTitresOctroyes: 0
        }
      }
      if (!result.sdom[annee]) {
        result.sdom[annee] = {
          [SDOMZoneIds.Zone0]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone0Potentielle]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone1]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone2]: { depose: 0, octroye: 0 }
        }
      }

      result.depotEtInstructions[annee].totalTitresOctroyes++
      if (phase.sdomZoneId !== null) {
        result.sdom[annee][phase.sdomZoneId].octroye++
      }
      if (phase.typeId === 'axm') {
        result.depotEtInstructions[annee].totalAXMOctroyees++
      }
    })

    const etapeDeposees: {
      date: CaminoDate
      typeId: TitreTypeId
      sdomZoneId: SDOMZoneId | null
    }[] = await knex
      .select(
        'titresEtapes.date',
        'titres.typeId',
        'titres__sdom_zones.sdom_zone_id'
      )
      .distinct('titres.id')
      .from('titresEtapes')
      .leftJoin('titresDemarches', 'titreDemarcheId', 'titresDemarches.id')
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .leftJoin(
        'titresAdministrationsGestionnaires',
        'titres.id',
        'titresAdministrationsGestionnaires.titreId'
      )
      .leftJoin(
        'titresAdministrations',
        'titres.id',
        'titresAdministrations.titreId'
      )
      .joinRaw(
        "left join titres_administrations_locales on titres_administrations_locales.titre_etape_id = titres.props_titre_etapes_ids ->> 'administrations'"
      )
      .joinRaw(
        "left join titres__sdom_zones on titres__sdom_zones.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'"
      )
      .where('titresEtapes.typeId', 'mdp')
      .andWhere('titresDemarches.typeId', 'oct')
      .andWhere('titresEtapes.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhere(builder =>
        builder
          .where(
            'titresAdministrationsGestionnaires.administrationId',
            administrationId
          )
          .orWhere(
            'titresAdministrationsLocales.administrationId',
            administrationId
          )
          .orWhere('titresAdministrations.administrationId', administrationId)
      )

    etapeDeposees?.forEach(etape => {
      const annee = getAnnee(etape.date)

      if (!result.depotEtInstructions[annee]) {
        result.depotEtInstructions[annee] = {
          totalAXMDeposees: 0,
          totalAXMOctroyees: 0,
          totalTitresDeposes: 0,
          totalTitresOctroyes: 0
        }
      }

      if (!result.sdom[annee]) {
        result.sdom[annee] = {
          [SDOMZoneIds.Zone0]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone0Potentielle]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone1]: { depose: 0, octroye: 0 },
          [SDOMZoneIds.Zone2]: { depose: 0, octroye: 0 }
        }
      }

      result.depotEtInstructions[annee].totalTitresDeposes++
      if (etape.sdomZoneId !== null) {
        result.sdom[annee][etape.sdomZoneId].depose++
      }

      if (etape.typeId === 'axm') {
        result.depotEtInstructions[annee].totalAXMDeposees++
      }
    })

    const dateInstruction: {
      id: string
      mcrdate: CaminoDate
      dexdate: CaminoDate
    }[] = await knex
      .select({
        mcrdate: 'MCR.date',
        dexdate: 'DEX.date'
      })
      .distinct('titresDemarches.id')
      .from({
        MCR: 'titresEtapes',
        DEX: 'titresEtapes',
        titresDemarches: 'titresDemarches'
      })
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .leftJoin(
        'titresAdministrationsGestionnaires',
        'titres.id',
        'titresAdministrationsGestionnaires.titreId'
      )
      .leftJoin(
        'titresAdministrations',
        'titres.id',
        'titresAdministrations.titreId'
      )
      .joinRaw(
        "left join titres_administrations_locales on titres_administrations_locales.titre_etape_id = titres.props_titre_etapes_ids ->> 'administrations'"
      )
      .joinRaw(
        "left join titres__sdom_zones on titres__sdom_zones.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'"
      )
      .where('titresDemarches.typeId', 'oct')
      .andWhereRaw('MCR.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('MCR.typeId', 'mcr')
      .andWhere('MCR.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhereRaw('DEX.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('DEX.typeId', 'dex')
      .andWhere(builder =>
        builder
          .where(
            'titresAdministrationsGestionnaires.administrationId',
            administrationId
          )
          .orWhere(
            'titresAdministrationsLocales.administrationId',
            administrationId
          )
          .orWhere('titresAdministrations.administrationId', administrationId)
      )

    dateInstruction.forEach(instruction => {
      const annee = getAnnee(instruction.mcrdate)
      if (!result.delais[annee]) {
        result.delais[annee] = {
          delaiInstructionEnJours: [],
          delaiCommissionDepartementaleEnJours: []
        }
      }
      let days = daysBetween(instruction.mcrdate, instruction.dexdate)
      if (days < 0) {
        console.warn('cette demarche a une dex AVANT la mcr', instruction.id)
        days = Math.abs(days)
      }
      result.delais[annee].delaiInstructionEnJours.push(days)
    })

    const dateCDM: {
      id: string
      mcrdate: CaminoDate
      apo: CaminoDate
    }[] = await knex
      .select({ mcrdate: 'MCR.date', apo: 'APO.date' })
      .distinct('titresDemarches.id')
      .from({
        MCR: 'titresEtapes',
        APO: 'titresEtapes',
        titresDemarches: 'titresDemarches'
      })
      .leftJoin('titres', 'titresDemarches.titreId', 'titres.id')
      .leftJoin(
        'titresAdministrationsGestionnaires',
        'titres.id',
        'titresAdministrationsGestionnaires.titreId'
      )
      .leftJoin(
        'titresAdministrations',
        'titres.id',
        'titresAdministrations.titreId'
      )
      .joinRaw(
        "left join titres_administrations_locales on titres_administrations_locales.titre_etape_id = titres.props_titre_etapes_ids ->> 'administrations'"
      )
      .joinRaw(
        "left join titres__sdom_zones on titres__sdom_zones.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'"
      )
      .where('titresDemarches.typeId', 'oct')
      .andWhereRaw('MCR.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('MCR.typeId', 'mcr')
      .andWhere('MCR.date', '>=', `${anneeDepartStats}-01-01`)
      .andWhereRaw('APO.titre_demarche_id = "titres_demarches"."id"')
      .andWhere('APO.typeId', 'apo')
      .andWhere(builder =>
        builder
          .where(
            'titresAdministrationsGestionnaires.administrationId',
            administrationId
          )
          .orWhere(
            'titresAdministrationsLocales.administrationId',
            administrationId
          )
          .orWhere('titresAdministrations.administrationId', administrationId)
      )

    dateCDM.forEach(instruction => {
      const annee = getAnnee(instruction.mcrdate)
      if (!result.delais[annee]) {
        result.delais[annee] = {
          delaiInstructionEnJours: [],
          delaiCommissionDepartementaleEnJours: []
        }
      }
      let days = daysBetween(instruction.mcrdate, instruction.apo)
      if (days < 0) {
        console.warn('cette demarche a une apo AVANT la mcr', instruction.id)
        days = Math.abs(days)
      }
      result.delais[annee].delaiCommissionDepartementaleEnJours.push(days)
    })

    res.json(result)
  }
}

const statistiquesMinerauxMetauxMetropoleInstantBuild = (
  titres: ITitre[]
): StatistiquesMinerauxMetauxMetropole => {
  const statsInstant: StatistiquesMinerauxMetauxMetropole = titres.reduce(
    (acc, titre) => {
      if (
        titre.titreStatutId &&
        ['val', 'mod', 'dmi'].includes(titre.titreStatutId)
      ) {
        if (!titre.surfaceEtape) {
          console.warn(`ce titre ${titre.slug} n'a pas de surface`)
        }
        if (['arm', 'apm', 'prm'].includes(titre.typeId!)) {
          acc.surfaceExploration += titre.surfaceEtape?.surface ?? 0
          if (['mod', 'dmi'].includes(titre.titreStatutId!)) {
            acc.titres.instructionExploration++
          }
        } else {
          if (['val', 'mod'].includes(titre.titreStatutId)) {
            acc.surfaceExploitation += titre.surfaceEtape?.surface ?? 0
          }
          if (['mod', 'dmi'].includes(titre.titreStatutId!)) {
            acc.titres.instructionExploitation++
          }
        }
        if (TitresStatutIds.Valide === titre.titreStatutId) {
          if (titre.typeId === 'prm') {
            acc.titres.valPrm++
          }
          if (titre.typeId === 'cxm') {
            acc.titres.valCxm++
          }
        }
      }

      return acc
    },
    {
      surfaceExploration: 0,
      surfaceExploitation: 0,
      titres: {
        instructionExploration: 0,
        valPrm: 0,
        instructionExploitation: 0,
        valCxm: 0
      },
      substances: { aloh: {} }
    }
  )

  statsInstant.surfaceExploration = Math.floor(
    statsInstant.surfaceExploration * 100
  ) // conversion 1 km² = 100 ha
  statsInstant.surfaceExploitation = Math.floor(
    statsInstant.surfaceExploitation * 100
  ) // conversion 1 km² = 100 ha

  return statsInstant
}

export const getMinerauxMetauxMetropolesStats = async (
  _req: express.Request,
  res: CustomResponse<StatistiquesMinerauxMetauxMetropole>
): Promise<void> => {
  const anneeDebut = 2010
  const currentYear = getCurrentAnnee()
  const annees: CaminoAnnee[] = []
  for (let year = anneeDebut; year <= parseInt(currentYear); year++) {
    annees.push(valideAnnee(year))
  }

  try {
    const titres = await titresGet(
      {
        domainesIds: ['m'],
        typesIds: ['ar', 'ap', 'pr', 'ax', 'px', 'cx']
      },
      {
        fields: {
          surfaceEtape: { id: {} },
          demarches: {
            phase: { id: {} },
            etapes: { id: {} },
            type: { id: {} }
          },
          communes: { id: {} }
        }
      },
      userSuper
    )
    const titresMetropole = titres.filter(titre => {
      if (!titre.communes) {
        throw new Error('les communes ne sont pas chargées')
      }

      return titre.communes
        .map(({ departementId }) => departementId)
        .filter(isNotNullNorUndefined)
        .some(
          departementId =>
            Regions[Departements[departementId].regionId].paysId === 'FR'
        )
    })
    const result =
      statistiquesMinerauxMetauxMetropoleInstantBuild(titresMetropole)

    for (const substance of Object.keys(
      result.substances
    ) as StatistiquesMinerauxMetauxMetropoleSubstances[]) {
      const resultSubstances: { date: CaminoDate; substance: number }[] =
        await knex
          .select(
            'date',
            knex.raw(
              "titres_activites.contenu->'substancesFiscales'-> ? as substance",
              substance
            )
          )
          .from('titres_activites')
          .whereRaw(
            "titres_activites.contenu -> 'substancesFiscales' \\? ?",
            substance
          )

      const substanceResult = resultSubstances.reduce<
        Record<CaminoAnnee, number>
      >((acc, dateSubstance) => {
        const annee = getAnnee(dateSubstance.date)
        if (!acc[annee]) {
          acc[annee] = 0
        }
        acc[annee] += fromUniteFiscaleToUnite(
          SubstancesFiscale[substance].uniteId,
          dateSubstance.substance
        )

        return acc
      }, {})

      result.substances[substance] = substanceResult
    }

    res.json(result)
  } catch (e) {
    console.error(e)

    throw e
  }
}
