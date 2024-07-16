/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { CaminoDate, daysBetween } from 'camino-common/src/date.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { Knex } from 'knex'

// FIXME TODELETE
const demarcheIdsToIgnore = [
  '3LErsZZBdLsL0td915Gln7Fn', // elle a une ouverture de ENQUÊTE publique et une fermeture de la PARTICIPATION du public
  'AMyAuvVJ8Y1fHknlnyhxKK3L', // pas d'ouverture
  'a8fxkB5t7VvSvAAGTA5FS9cZ', // pas d'ouverture
  'me1HK9RyOgKcbQSTYizLn1KB', // pas d'ouverture
  'tZcNoZimGRDE7AOLSk8TJVqH', // pas d'ouverture
]
export const up = async (knex: Knex) => {
  const { rows: clotureEtapes }: { rows: { id: EtapeId; date: CaminoDate; titre_demarche_id: DemarcheId }[] } = await knex.raw(`select * from titres_etapes where type_id = 'ppc' and archive is false`)

  const alreadyProccess = new Set()

  const errors = []

  for (const clotureEtape of clotureEtapes) {
    // FIXME TODELETE
    if (demarcheIdsToIgnore.includes(clotureEtape.titre_demarche_id)) {
      await knex.raw(`delete from etapes_documents where etape_id = '${clotureEtape.id}'`)

      await knex.raw(`delete from titres_etapes where id = '${clotureEtape.id}'`)

      continue
    }

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
