/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { CaminoDate, daysBetween } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  const { rows: clotureEtapes }: { rows: { id: EtapeId; date: CaminoDate; titre_demarche_id: DemarcheId }[] } = await knex.raw(`select * from titres_etapes where type_id = 'ppc' and archive is false`)

  const alreadyProccess = new Set()

  const errors = []

  for (const clotureEtape of clotureEtapes) {
    if (alreadyProccess.has(clotureEtape.titre_demarche_id)) {
      continue
    }
    alreadyProccess.add(clotureEtape.titre_demarche_id)

    const { rows: etapes }: { rows: { id: EtapeId; type_id: EtapeTypeId | 'ppc'; contenu: any; date: CaminoDate }[] } = await knex.raw(
      `select * from titres_etapes where (type_id = 'ppu' or type_id = 'ppc') and archive is false and titre_demarche_id = '${clotureEtape.titre_demarche_id}' order by date`
    )

    if (etapes.length === 1) {
      errors.push(`cette démarche ${clotureEtape.titre_demarche_id} n'a pas d'ouverture`)
    }

    for (let i = 0; i < etapes.length; i += 2) {
      const ouvertureEtape = etapes[i]
      const cloture = etapes[i + 1]

      if (ouvertureEtape.type_id !== 'ppu') {
        errors.push(`boom ${ouvertureEtape}`)
      }

      if (cloture === undefined) {
        continue
      }

      if (cloture.type_id !== 'ppc') {
        errors.push(`boom ppc ${cloture} ${clotureEtape.titre_demarche_id}`)
      }

      const newContenu = { ...ouvertureEtape.contenu }
      newContenu.opdp = { ...newContenu.opdp }
      newContenu.opdp.duree = daysBetween(ouvertureEtape.date, cloture.date)

      await knex.raw(`update titres_etapes set contenu = ? where id ='${ouvertureEtape.id}'`, [newContenu])

      await knex.raw(`update etapes_documents set etape_id = '${ouvertureEtape.id}' where etape_id = '${cloture.id}'`)

      await knex.raw(`delete from titres_etapes where id = '${cloture.id}'`)
    }
  }

  if (errors.length > 0) {
    errors.forEach(error => console.error(error))
    throw new Error('delete me')
  }
}

export const down = () => ({})
