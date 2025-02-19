/* eslint-disable sql/no-unsafe-query */
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`UPDATE etapes_documents set etape_document_type_id = 'aut' where id in (select ed.id from etapes_documents ed
  join titres_etapes te on ed.etape_id = te.id
  where te.type_id ='dim')`)
  await knex.raw("UPDATE titres_etapes set type_id = 'dex', statut_id = 'aci' WHERE type_id = 'dim' and statut_id = 'acc'")
  await knex.raw("UPDATE titres_etapes set type_id = 'dex', statut_id = 'rei' WHERE type_id = 'dim' and statut_id = 'rej'")
  // une renonciation totale avec une date de fin :scream:
  await knex.raw("UPDATE titres_etapes set date_fin = NULL where id='kCBVfifVyRfkgzeXBCQuJRrZ'")

  // rien à voir avec cette PR, mais pgassistant nous dit qu'il manque des index sur des FK, les voici
  await knex.raw('CREATE INDEX pga_idx_fk_activites_documents_activite_id ON activites_documents(activite_id)')
  await knex.raw('ANALYZE activites_documents')
  await knex.raw('CREATE INDEX pga_idx_fk_entreprises_documents_entreprise_id ON entreprises_documents(entreprise_id)')
  await knex.raw('ANALYZE entreprises_documents')
  await knex.raw('CREATE INDEX pga_idx_fk_etapes_documents_etape_id ON etapes_documents(etape_id)')
  await knex.raw('ANALYZE etapes_documents')
  await knex.raw('CREATE INDEX pga_idx_fk_logs_utilisateur_id ON logs(utilisateur_id)')
  await knex.raw('ANALYZE logs')
  await knex.raw('CREATE INDEX pga_idx_fk_titres_etapes_demarche_id_en_concurrence ON titres_etapes(demarche_id_en_concurrence)')
  await knex.raw('ANALYZE titres_etapes')
  await knex.raw('CREATE INDEX pga_idx_fk_titres_etapes_etape_fondamentale_id ON titres_etapes(etape_fondamentale_id)')
  await knex.raw('ANALYZE titres_etapes;')

  // les colonnes FK n'ont pas le même type que la colonne
  await knex.raw('ALTER TABLE etape_avis ALTER COLUMN etape_id TYPE character varying(128) USING etape_id::character varying(128)')
  await knex.raw('ALTER TABLE etapes_documents ALTER COLUMN etape_id TYPE character varying(128) USING etape_id::character varying(128)')
  await knex.raw('ALTER TABLE titres__titres ALTER COLUMN titre_from_id TYPE character varying(128) USING titre_from_id::character varying(128)')
  await knex.raw('ALTER TABLE titres__titres ALTER COLUMN titre_to_id TYPE character varying(128) USING titre_to_id::character varying(128)')
  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN utilisateur_id TYPE character varying(255) USING utilisateur_id::character varying(255)')
  await knex.raw('ALTER TABLE titres_etapes ALTER COLUMN demarche_id_en_concurrence TYPE character varying(128) USING demarche_id_en_concurrence::character varying(128)')
  await knex.raw('ALTER TABLE titres_etapes ALTER COLUMN etape_fondamentale_id TYPE character varying(128) USING etape_fondamentale_id::character varying(128)')
  await knex.raw('ALTER TABLE utilisateurs__entreprises ALTER COLUMN utilisateur_id TYPE character varying(255) USING utilisateur_id::character varying(255)')
  await knex.raw('ALTER TABLE utilisateurs__titres ALTER COLUMN titre_id TYPE character varying(128) USING titre_id::character varying(128)')

  // j'ai vu une table qui ne servait plus dans le code
  await knex.raw('DROP TABLE perimetre_reference')
}

export const down = (): void => {}
