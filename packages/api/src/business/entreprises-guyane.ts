import {
  toDepartementId,
  Departements,
  CodePostal
} from 'camino-common/src/static/departement'
import { PAYS_IDS } from 'camino-common/src/static/pays'
import { Regions } from 'camino-common/src/static/region'
import { knex } from '../knex'
import { exploitantsGuyaneSubscriberUpdate } from '../tools/api-mailjet/newsletter'

interface Result {
  id: string
  email: string
  nomUtilisateur: string
  prenom: string
  role: string
  codePostal: CodePostal | null
  nomEntreprise: string
}

type ResultAggregated = {
  entreprises: string[]
} & Omit<Result, 'id' | 'nomEntreprise' | 'codePostal'>

export const subscribeUsersToGuyaneExploitants = async (): Promise<
  ResultAggregated[]
> => {
  console.info(
    `inscription des utilisateurs d'entreprise de Guyane à la liste de diffusion`
  )

  const result: Result[] = await knex
    .select(
      'utilisateurs.id',
      'utilisateurs.email',
      { nomUtilisateur: 'utilisateurs.nom' },
      'prenom',
      'role',
      { nomEntreprise: 'entreprises.nom' },
      'codePostal'
    )
    .from('utilisateurs')
    .leftJoin(
      'utilisateurs__entreprises',
      'id',
      'utilisateurs__entreprises.utilisateur_id'
    )
    .leftJoin(
      'entreprises',
      'utilisateurs__entreprises.entreprise_id',
      'entreprises.id'
    )
    .whereIn('role', ['entreprise', 'bureau d’études'])
    .andWhereNot('utilisateurs.email', null)
  const reduced = result
    .filter(
      ({ codePostal }) =>
        codePostal !== null &&
        Regions[Departements[toDepartementId(codePostal)].regionId].paysId ===
          PAYS_IDS['Département de la Guyane']
    )
    .reduce<Record<string, ResultAggregated>>((acc, user) => {
      if (!acc[user.id]) {
        acc[user.id] = {
          email: user.email,
          entreprises: [user.nomEntreprise],
          nomUtilisateur: user.nomUtilisateur,
          prenom: user.prenom,
          role: user.role
        }
      } else {
        acc[user.id].entreprises.push(user.nomEntreprise)
      }

      return acc
    }, {})
  const users = Object.values(reduced).sort((a, b) =>
    a.email.localeCompare(b.email)
  )
  await exploitantsGuyaneSubscriberUpdate(
    users.map(user => ({
      email: user.email,
      nom: `${user.nomUtilisateur} ${user.prenom}`
    }))
  )

  return users
}
