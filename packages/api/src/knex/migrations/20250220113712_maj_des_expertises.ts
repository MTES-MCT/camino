import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`
    UPDATE titres_etapes SET type_id = 'exp' WHERE type_id IN ('edm', 'ede', 'esb')
  `)
  await knex.raw(`
    INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id)
    SELECT '2020-03-11-avi-124c9191', 'autreAvis', 'Favorable', 'Administrations', '47Q4HFk541pQ3aZ5mQPNqN1I', 'Avis de la DEAL sur la demande d’autorisation de recherches minières de la SAS COMPAGNIE MINIERE MAJOR', '2020-03-11', '133842' WHERE EXISTS (SELECT 1 from titres_etapes where id='47Q4HFk541pQ3aZ5mQPNqN1I')
  `)
  await knex.raw(`
      INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id)
      SELECT '2020-03-11-avi-688466bc', 'autreAvis', 'Favorable avec réserves', 'Administrations', 'EUJCYmirGHUHZGkhHx0zNbM3', 'Avis DGTM - Industries Extractives', '2020-03-11', 133998 WHERE EXISTS (SELECT 1 from titres_etapes where id='EUJCYmirGHUHZGkhHx0zNbM3')
    `)
  await knex.raw(`
    DELETE FROM etapes_documents WHERE id IN ('2020-03-11-avi-124c9191', '2020-03-11-avi-688466bc')
  `)
  await knex.raw(
    "UPDATE etapes_documents SET etape_document_type_id = 'aut', description = 'Avis\n' || description WHERE etape_document_type_id = 'avi' AND etape_id IN (SELECT id FROM titres_etapes WHERE type_id = 'exp')"
  )
}

export const down = (): void => {}
