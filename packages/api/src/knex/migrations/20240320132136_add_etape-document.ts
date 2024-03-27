/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { EtapeId } from 'camino-common/src/etape'
import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  // TODO 20-03-2024 rendre largeobject_id not null après la migration
  // await knex.raw('ALTER TABLE etapes_documents ALTER COLUMN largeobject_id SET NOT NULL')

  await knex.raw(
    'CREATE TABLE etapes_documents (id character varying(255) NOT NULL, etape_document_type_id character varying(3) NOT NULL, etape_id character varying(255) NOT NULL, description character varying(1024), public_lecture boolean NOT NULL, entreprises_lecture boolean NOT NULL, largeobject_id oid)'
  )
  await knex.raw('ALTER TABLE etapes_documents ADD CONSTRAINT etapes_documents_pk PRIMARY KEY (id)')
  await knex.raw('ALTER TABLE etapes_documents ADD CONSTRAINT etapes_documents_fk FOREIGN KEY (etape_id) REFERENCES titres_etapes(id);')

  await knex.raw(
    'insert into etapes_documents (id, etape_document_type_id, etape_id, description, public_lecture, entreprises_lecture) (SELECT id, type_id as etape_document_type_id, titre_etape_id, description, public_lecture, entreprises_lecture from documents where titre_etape_id is not null and fichier is not null and fichier_type_id is not null)'
  )

  const result: { rows: { titre_etape_id: EtapeId; description: string }[] } = await knex.raw(
    'SELECT titre_etape_id, description from documents where titre_etape_id is null or fichier is null or fichier_type_id is  null'
  )

  for (const document of result.rows) {
    await knex.raw(`update titres_etapes set notes = concat(notes, '${document.description.replace(/'/g, '’')}') where id = '${document.titre_etape_id}'`)
  }

  // await knex.schema.dropTable('documents')
}

export const down = () => ({})
