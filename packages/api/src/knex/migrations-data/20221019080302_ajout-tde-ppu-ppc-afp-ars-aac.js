exports.up = async knex => {
  await knex.raw(`INSERT INTO titres_types__demarches_types__etapes_types(titre_type_id, ordre, demarche_type_id, etape_type_id) VALUES 
  ('prm', 261, 'pr2','ppu'),
  ('prm', 261, 'pr2','ppc'),
  ('prm', 261, 'pr1','ppu'),
  ('prm', 262, 'pr1','ppc'),
  ('prw', 201, 'pr1','ppu'),
  ('prw', 202, 'pr1','ppc'),
  ('prw', 201, 'pr2','ppu'),
  ('prw', 202, 'pr2','ppc'),
  ('prm', 261, 'oct','afp'),
  ('prm', 262, 'oct','ars'),
  ('prm', 263, 'oct','aac');
  `)
}

exports.down = () => ({})
