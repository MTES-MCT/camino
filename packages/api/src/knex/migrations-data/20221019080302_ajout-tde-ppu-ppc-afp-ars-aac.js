exports.up = async knex => {
  await knex.raw(`INSERT INTO titres_types__demarches_types__etapes_types(titre_type_id, ordre, demarche_type_id, etape_type_id) VALUES 
  ('prm', 1200, 'pr2','ppu'),
  ('prm', 1201, 'pr2','ppc'),
  ('prm', 1202, 'pr1','ppu'),
  ('prm', 1203, 'pr1','ppc'),
  ('prw', 1204, 'pr1','ppu'),
  ('prw', 1205, 'pr1','ppc'),
  ('prw', 1206, 'pr2','ppu'),
  ('prw', 1207, 'pr2','ppc'),
  ('prm', 1208, 'oct','afp'),
  ('prm', 1209, 'oct','ars'),
  ('prm', 1210, 'oct','aac');
  `)
}

exports.down = () => ({})
