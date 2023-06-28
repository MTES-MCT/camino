import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw(
    'CREATE TABLE entreprises_documents (id character varying(255) NOT NULL, entreprise_document_type_id character varying(3) NOT NULL, date character varying(10) NOT NULL, entreprise_id character varying(64), description character varying(1024))'
  )
  await knex.raw('ALTER TABLE entreprises_documents ADD CONSTRAINT entreprises_documents_pk PRIMARY KEY (id)')
  await knex.raw('ALTER TABLE entreprises_documents ADD CONSTRAINT entreprises_documents_fk FOREIGN KEY (entreprise_id) REFERENCES entreprises(id);')

  await knex.raw(
    'insert into entreprises_documents (id, entreprise_document_type_id, date, entreprise_id, description) (SELECT id, type_id as entreprise_document_type_id, date, entreprise_id, description from documents where entreprise_id is not null)'
  )

  await knex.raw('alter table titres_etapes_justificatifs drop constraint "titresetapesjustificatifs_documentid_foreign"')
  await knex.raw('ALTER TABLE titres_etapes_justificatifs RENAME TO titres_etapes_entreprises_documents')
  await knex.raw('ALTER TABLE titres_etapes_entreprises_documents RENAME COLUMN document_id TO entreprise_document_id')
  await knex.raw('ALTER TABLE titres_etapes_entreprises_documents ADD CONSTRAINT titres_etapes_entreprises_documents_fk FOREIGN KEY (entreprise_document_id) REFERENCES entreprises_documents(id);')

  await knex.raw('delete from documents where entreprise_id is not null')

  await knex.raw('ALTER TABLE documents DROP CONSTRAINT documents_entrepriseid_foreign')

  return knex.raw('ALTER TABLE documents DROP COLUMN entreprise_id')
}

export const down = () => ({})
