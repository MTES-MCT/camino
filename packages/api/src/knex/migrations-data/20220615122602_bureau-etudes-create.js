exports.up = knex =>
  knex('utilisateurs')
    .whereIn('id', ['c7142a', '38cbc5', '24414c', '40bf91', '95177f'])
    .update({ role: 'bureau d’études' })

exports.down = () => ({})
