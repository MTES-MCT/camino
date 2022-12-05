import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titresReferences', function (table) {
    table.dropForeign('type_id', 'titresreferences_typeid_foreign')
  })

  await knex.schema.alterTable('titresReferences', function (table) {
    table.renameColumn('type_id', 'reference_type_id')
  })

  await knex.schema.alterTable('titres', function (table) {
    table.jsonb('references').index()
  })
  const titresReferences = await knex('titres_references').orderBy(
    'referenceTypeId',
    'nom'
  )

  const referencesByTitre = titresReferences.reduce((acc, titreReference) => {
    if (!acc[titreReference.titreId]) {
      acc[titreReference.titreId] = []
    }
    acc[titreReference.titreId].push({
      nom: titreReference.nom,
      referenceTypeId: titreReference.referenceTypeId
    })

    return acc
  }, {})

  for (const titreId in referencesByTitre) {
    await knex('titres')
      .where('id', titreId)
      .update({
        references: JSON.stringify(referencesByTitre[titreId])
      })
  }

  await knex.schema.dropTable('titresReferences')
  await knex.schema.dropTable('referencesTypes')
  await knex.raw(
    'update titres set "references"=\'[]\'::jsonb where "references" is null'
  )
  await knex.raw(
    'alter table titres alter column "references" set default \'[]\'::jsonb'
  )
  await knex.raw('alter table titres alter column "references" set not null')
}

export const down = () => ({})
