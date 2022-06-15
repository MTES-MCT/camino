exports.up = knex =>
  knex('utilisateurs')
    .whereIn('id', ['40bf91', '65ed69'])
    .update({ role: 'bureau d’études' })

exports.down = () => ({})
