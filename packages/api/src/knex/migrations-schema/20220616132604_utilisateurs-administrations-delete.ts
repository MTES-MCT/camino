import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.table('utilisateurs', table => {
    table.string('administrationId').index().references('administrations.id')
  })

  const utilisateursAdministrations = await knex(
    'utilisateurs__administrations'
  )

  for (const {
    utilisateurId,
    administrationId
  } of utilisateursAdministrations) {
    await knex('utilisateurs')
      .where('id', utilisateurId)
      .update({ administrationId })
  }

  return knex.schema.dropTable('utilisateurs__administrations')
}

export const down = () => ({})
