import { Knex } from 'knex'
import emailRegex from 'email-regex'
import { IUtilisateur } from '../types.js'

// TODO 2022-06-23 fixme
export const userAdd = async (
  knex: Knex,
  user: Omit<IUtilisateur, 'administrationId'>
): Promise<void> => {
  const errors = []

  if (!user.email) {
    errors.push('email manquant')
  } else if (!emailRegex({ exact: true }).test(user.email)) {
    errors.push('adresse email invalide')
  }

  if (!errors.length) {
    await knex('utilisateurs').insert(user)

    console.info('Utilisateur créé')
  } else {
    console.info('Aucun user créé:', errors.join(', '))
  }
}
