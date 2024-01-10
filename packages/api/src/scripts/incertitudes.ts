import { EtapeId } from 'camino-common/src/etape.js'
import '../init.js'
import { knex } from '../knex.js'

const translateKeys: Record<string, string> = {
  date: 'Date',
  points: 'Périmètre',
  substances: 'Substances',
  dateFin: 'Date d’échéance',
  surface: 'Surface',
  titulaires: 'Titulaires',
  dateDebut: 'Date de début',
  duree: 'Durée',
}

const filterOutKeys = ['surface'] as const
const doIt = async () => {
  const values: { rows: { id: EtapeId; incertitudes: Record<string, true> }[] } = await knex.raw('select id, incertitudes from titres_etapes where incertitudes is not null')
  for (const value of values.rows) {
    const text = `Incertitudes: ${Object.keys(value.incertitudes)
      .filter(v => !filterOutKeys.includes(v))
      .map(val => ` ${translateKeys[val]}`)
      .join(',')}.`
    await knex.raw('update titres_etapes set notes = ? where id = ?', [text, value.id])
  }
}

doIt()
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
