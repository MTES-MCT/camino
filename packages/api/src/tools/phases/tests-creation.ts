/* eslint-disable camelcase */
import '../../init.js'
import { writeFileSync } from 'fs'

import { knex } from '../../knex.js'
import { TitrePhasesTest } from '../../business/rules/titre-phases-find.test.js'
import { CaminoDate, getCurrent } from 'camino-common/src/date.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { PhaseStatutId } from 'camino-common/src/static/phasesStatuts.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheId, ITitrePhase } from '../../types.js'
import { TitreDemarchePhaseFind, TitreEtapePhaseFind } from '../../business/rules/titre-demarche-date-fin-duree-find.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'

const writePhasesForTest = async () => {
  const demarches: {
    rows: {
      id: DemarcheId
      titre_id: string
      ordre: number
      statut_id: DemarcheStatutId
      demarche_type_id: DemarcheTypeId
      titre_type_id: TitreTypeId
      phase_statut_id: PhaseStatutId | null
      date_debut: CaminoDate | null
      date_fin: CaminoDate | null
    }[]
  } = await knex.raw(`select td.id, td.ordre, td.statut_id, td.type_id as demarche_type_id, t.type_id  as titre_type_id, t.id as titre_id, tp.phase_statut_id, tp.date_debut, tp.date_fin
    from titres_demarches td
        join titres t on td.titre_id = t.id
        left join titres_phases tp on td.id = tp.titre_demarche_id
        where td.archive is false`)

  const etapesDb: {
    rows: {
      titre_demarche_id: DemarcheId
      ordre: number
      etape_type_id: EtapeTypeId
      date_fin: CaminoDate | null
      date_debut: CaminoDate | null
      date: CaminoDate
      duree: number | null
      statut_id: EtapeStatutId
      count: number
    }[]
  } = await knex.raw(`select te.titre_demarche_id, te.ordre, te.type_id as etape_type_id, te.date_fin, te.date_debut, te.date, te.duree, te.statut_id, count(tp.id) from titres_etapes te
    left join titres_points tp on te.id = tp.titre_etape_id
    where te.archive is false
    group by te.id`)

  const titres = demarches.rows.reduce<{
    [id: string]: {
      titreTypeId: TitreTypeId
      demarches: TitreDemarchePhaseFind[]
      phases: (ITitrePhase & { ordre: number })[]
    }
  }>((acc, row) => {
    if (!acc[row.titre_id]) {
      acc[row.titre_id] = {
        titreTypeId: row.titre_type_id,
        demarches: [],
        phases: [],
      }
    }

    const fakeDemarcheId = newDemarcheId()

    const etapes: TitreEtapePhaseFind[] = etapesDb.rows
      .filter(({ titre_demarche_id }) => titre_demarche_id === row.id)
      .map(etapeDb => ({
        titreDemarcheId: fakeDemarcheId,
        ordre: etapeDb.ordre,
        typeId: etapeDb.etape_type_id,
        dateFin: etapeDb.date_fin,
        duree: etapeDb.duree,
        dateDebut: etapeDb.date_debut,
        date: etapeDb.date,
        statutId: etapeDb.statut_id,
        points: etapeDb.count > 0 ? [1, 2] : [],
      }))

    acc[row.titre_id].demarches.push({
      statutId: row.statut_id,
      ordre: row.ordre,
      typeId: row.demarche_type_id,
      id: fakeDemarcheId,
      etapes,
    })
    if (row.phase_statut_id && row.date_debut && row.date_fin) {
      acc[row.titre_id].phases.push({
        titreDemarcheId: fakeDemarcheId,
        ordre: row.ordre,
        phaseStatutId: row.phase_statut_id,
        dateDebut: row.date_debut,
        dateFin: row.date_fin,
      })
    }

    return acc
  }, {})

  const result: TitrePhasesTest[] = Object.keys(titres).map(titreId => {
    const titre = titres[titreId]

    return [
      titre.titreTypeId,
      titre.demarches.sort((a, b) => (a.ordre ?? Infinity) - (b.ordre ?? Infinity)),
      titre.phases
        .sort((a, b) => a.ordre - b.ordre)
        .map(phase => {
          const { ordre: _, ...phaseWithoutOrdre } = phase

          return phaseWithoutOrdre
        }),
      getCurrent(),
    ]
  })

  writeFileSync(`src/business/rules/titre-phases-find.cas.json`, JSON.stringify(result))
}

writePhasesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
