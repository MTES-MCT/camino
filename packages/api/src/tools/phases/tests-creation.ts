/* eslint-disable camelcase */
import '../../init.js'
import { writeFileSync } from 'fs'

import { knex } from '../../knex.js'
import { TitrePhasesTest } from '../../business/rules/titre-phases-find.test.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create.js'
import { TitreDemarchePhaseFind, TitreEtapePhaseFind } from '../../business/rules/titre-phases-find.js'

const writePhasesForTest = async () => {
  const demarches: {
    rows: {
      id: DemarcheId
      titre_id: string
      ordre: number
      statut_id: DemarcheStatutId
      demarche_type_id: DemarcheTypeId
      titre_type_id: TitreTypeId
      demarche_date_debut: CaminoDate | null
      demarche_date_fin: CaminoDate | null
    }[]
  } = await knex.raw(`select td.id, td.ordre, td.statut_id, td.type_id as demarche_type_id, t.type_id  as titre_type_id, t.id as titre_id, td.demarche_date_debut, td.demarche_date_fin
    from titres_demarches td
        join titres t on td.titre_id = t.id
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
    }
  }>((acc, row) => {
    if (!acc[row.titre_id]) {
      acc[row.titre_id] = {
        titreTypeId: row.titre_type_id,
        demarches: [],
      }
    }

    const fakeDemarcheId = newDemarcheId()
    const fakeTitreId = newTitreId()

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
      titreId: fakeTitreId,
      statutId: row.statut_id,
      ordre: row.ordre,
      typeId: row.demarche_type_id,
      id: fakeDemarcheId,
      demarcheDateDebut: row.demarche_date_debut,
      demarcheDateFin: row.demarche_date_fin,
      etapes,
    })

    return acc
  }, {})

  const result: TitrePhasesTest[] = Object.keys(titres).map(titreId => {
    const titre = titres[titreId]

    return [titre.titreTypeId, titre.demarches.sort((a, b) => (a.ordre ?? Infinity) - (b.ordre ?? Infinity))]
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
