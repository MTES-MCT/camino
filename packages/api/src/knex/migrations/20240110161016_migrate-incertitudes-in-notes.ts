import { EtapeId } from 'camino-common/src/etape'
import { Knex } from 'knex'

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
const doIt = async (knex: Knex) => {
  const values: { rows: { id: EtapeId; incertitudes: Record<string, true> }[] } = await knex.raw('select id, incertitudes from titres_etapes where incertitudes is not null')
  for (const value of values.rows) {
    const text = `Incertitudes: ${Object.keys(value.incertitudes)
      .filter(v => !filterOutKeys.includes(v))
      .map(val => ` ${translateKeys[val]}`)
      .join(',')}.`
    await knex.raw('update titres_etapes set notes = ? where id = ?', [text, value.id])
  }
}

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres_etapes add notes text;')
  await doIt(knex)
  await knex.raw('alter table titres_etapes drop column incertitudes;')
}

export const down = () => ({})
