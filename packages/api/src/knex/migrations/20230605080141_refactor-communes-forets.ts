import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table communes drop column departement_id')
  await knex.raw("alter table titres_etapes add column forets jsonb DEFAULT '[]'::jsonb NOT NULL")
  await knex.raw("alter table titres_etapes add column communes jsonb DEFAULT '[]'::jsonb NOT NULL")

  const forets = await knex.select().from('titres_forets')

  const foretsByTitreEtapes = forets.reduce((acc, foret) => {
    if (!acc[foret.titreEtapeId]) {
      acc[foret.titreEtapeId] = []
    }
    acc[foret.titreEtapeId].push(foret.foretId)

    return acc
  }, {})

  for (const titreEtapeId in foretsByTitreEtapes) {
    await knex('titres_etapes')
      .update({ forets: JSON.stringify(foretsByTitreEtapes[titreEtapeId]) })
      .where('id', titreEtapeId)
  }

  const communes = await knex.select().from('titres_communes')

  const communesByTitreEtapes = communes.reduce((acc, commune) => {
    if (!acc[commune.titreEtapeId]) {
      acc[commune.titreEtapeId] = []
    }
    acc[commune.titreEtapeId].push({ id: commune.communeId, surface: commune.surface })

    return acc
  }, {})

  for (const titreEtapeId in communesByTitreEtapes) {
    await knex('titres_etapes')
      .update({ communes: JSON.stringify(communesByTitreEtapes[titreEtapeId]) })
      .where('id', titreEtapeId)
  }
  await knex.raw('drop table titres_forets')
  await knex.raw('drop table titres_communes')
  await knex.raw('drop table forets')
}

export const down = () => ({})
