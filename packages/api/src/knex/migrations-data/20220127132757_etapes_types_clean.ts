import { Knex } from 'knex'
import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import TitresEtapes from '../../database/models/titres-etapes.js'
import { deleteJournalCreate } from '../../database/queries/journaux.js'

export const up = async (knex: Knex) => {
  // Supprime l’étape DSL « Demande de l’accord du propriétaire du sol »
  await knex('titres_types__demarches_types__etapes_types')
    .where('etape_type_id', 'dsl')
    .delete()

  const etapesDsl: any[] = await titresEtapesGet(
    { etapesTypesIds: ['dsl'] },
    { fields: { demarche: {} } },
    userSuper
  )
  for (const etapeDsl of etapesDsl) {
    await deleteJournalCreate(
      etapeDsl.id,
      TitresEtapes,
      userSuper.id,
      etapeDsl.demarche.titreId
    )
    await TitresEtapes.query().delete().where('id', etapeDsl.id)
  }

  await knex('administrations__titres_types__etapes_types')
    .where('etape_type_id', 'dsl')
    .delete()

  await knex('etapes_types__etapes_statuts')
    .where('etape_type_id', 'dsl')
    .delete()

  await knex('etapes_types').where('id', 'dsl').delete()

  // supprime l’eof « Expertise de l’ONF » des AXM et son cycle d’informations
  await knex('titres_types__demarches_types__etapes_types')
    .whereIn('etape_type_id', ['eof', 'rio', 'mio'])
    .where('demarche_type_id', 'oct')
    .where('titre_type_id', 'axm')
    .delete()

  // Supprime l’étape QAE « Demande d’examen au cas par cas »
  await knex('titres_types__demarches_types__etapes_types')
    .where('etape_type_id', 'qae')
    .delete()

  const etapesQae: any[] = await titresEtapesGet(
    { etapesTypesIds: ['qae'] },
    { fields: { demarche: {} } },
    userSuper
  )
  for (const etapeQae of etapesQae) {
    await deleteJournalCreate(
      etapeQae.id,
      TitresEtapes,
      userSuper.id,
      etapeQae.demarche.titreId
    )
    await TitresEtapes.query().delete().where('id', etapeQae.id)
  }

  await knex('administrations__titres_types__etapes_types')
    .where('etape_type_id', 'qae')
    .delete()

  await knex('etapes_types__etapes_statuts')
    .where('etape_type_id', 'qae')
    .delete()

  await knex('etapes_types').where('id', 'qae').delete()
}
export const down = () => ({})
