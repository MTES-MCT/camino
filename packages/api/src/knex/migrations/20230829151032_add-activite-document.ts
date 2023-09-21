import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw(
    'CREATE TABLE activites_documents (id character varying(255) NOT NULL, activite_document_type_id character varying(3) NOT NULL, date character varying(10) NOT NULL, activite_id character varying(255), description character varying(1024), largeobject_id oid)'
  )
  await knex.raw('ALTER TABLE activites_documents ADD CONSTRAINT activites_documents_pk PRIMARY KEY (id)')
  await knex.raw('ALTER TABLE activites_documents ADD CONSTRAINT activites_documents_fk FOREIGN KEY (activite_id) REFERENCES titres_activites(id);')

  await knex.raw(
    'insert into activites_documents (id, activite_document_type_id, date, activite_id, description) (SELECT id, type_id as activite_document_type_id, date, titre_activite_id, description from documents where titre_activite_id is not null)'
  )

  await knex.raw('delete from documents where titre_activite_id is not null')

  await knex.schema.dropTable('activites_types__documents_types')
  await knex.schema.dropTable('administrations__activites_types')

  await knex.raw('ALTER TABLE documents DROP CONSTRAINT documents_titreactiviteid_foreign')

  await knex.raw('ALTER TABLE documents DROP COLUMN titre_activite_id')

  await knex.raw('ALTER TABLE entreprises_documents ALTER COLUMN largeobject_id SET NOT NULL')

  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN sections SET NOT NULL')
  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN slug SET NOT NULL')
  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN periode_id SET NOT NULL')

  await knex.raw('UPDATE titres_activites set suppression = false where suppression is null')
  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN suppression SET DEFAULT false')
  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN suppression SET NOT NULL')
}

export const down = () => ({})
