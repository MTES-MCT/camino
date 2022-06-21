import { Knex } from 'knex'
import emailRegex from 'email-regex'
import bcrypt from 'bcryptjs'
import { IUtilisateur } from '../types'
import { idGenerate } from '../database/models/_format/id-create'

export const userAdd = async (
  knex: Knex,
  user: Omit<IUtilisateur, 'administrationId'>
): Promise<void> => {
  const password = idGenerate()
  const errors = []

  if (!user.email) {
    errors.push('email manquant')
  } else if (!emailRegex({ exact: true }).test(user.email)) {
    errors.push('adresse email invalide')
  }

  if (!errors.length) {
    user.motDePasse = bcrypt.hashSync(password, 10)

    await knex('utilisateurs').insert(user)

    console.info('Utilisateur créé')
    console.log(`utilisateur crée avec le mot de passe ${password}`)
  } else {
    console.info('Aucun user créé:', errors.join(', '))
  }
}
