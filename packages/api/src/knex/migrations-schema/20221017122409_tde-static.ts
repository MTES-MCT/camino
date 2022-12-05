import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex('activites_types__documents_types')
    .where('document_type_id', 'rwp')
    .update({ documentTypeId: 'rgr' })

  await knex('documents').where('type_id', 'rwp').update({ typeId: 'rgr' })

  await knex('documents_types').where('id', 'rwp').delete()

  await knex.schema.dropTable('etapes_types__documents_types')
  await knex.schema.dropTable(
    'titresTypes__demarchesTypes__etapesTypes__documentsTypes'
  )
}

export const down = () => ({})
