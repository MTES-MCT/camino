import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`ALTER TABLE etape_avis ADD CONSTRAINT etape_avis_pkey PRIMARY KEY (id);`)
  await knex.raw(`ALTER TABLE etape_avis ADD CONSTRAINT etape_id_fk FOREIGN KEY (etape_id) REFERENCES titres_etapes(id);`)
  await knex.raw(`CREATE INDEX etape_avis_etape_index ON etape_avis USING btree (etape_id)`)

  await knex.raw(`UPDATE etape_avis set description ='Non renseigné' where id='2023-08-10-avi-4edaaa73';`)

  await knex.raw(`ALTER TABLE etape_avis ADD CONSTRAINT etape_avis_description_required CHECK (length(description) > 0 OR avis_type_id != 'autreAvis')`)
}

export const down = (): void => {}
