import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('administrations__titres_types__titres_statuts', function (table) {
    table.dropForeign('titre_statut_id', 'administrations__titrestypes__titresstatuts_titrestatutid_forei')
  })
  await knex.schema.alterTable('titres_types__titres_statuts', function (table) {
    table.dropForeign('titre_statut_id', 'titrestypes__titresstatuts_titrestatutid_foreign')
  })
  await knex.schema.alterTable('titres', function (table) {
    table.dropForeign('statut_id', 'titres_statutid_foreign')
    table.renameColumn('statut_id', 'titre_statut_id')
  })

  await knex.schema.dropTable('titres_statuts')
}

export const down = () => ({})
