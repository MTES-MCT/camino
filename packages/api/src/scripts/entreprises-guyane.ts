import '../init'
import { subscribeUsersToGuyaneExploitants } from '../business/entreprises-guyane.js'

// Retourne tous les utilisateurs 'entreprise' et 'bureau d'études' associés à des entreprises de Guyane
subscribeUsersToGuyaneExploitants()
  .then(users => {
    console.info(
      users
        .map(
          user =>
            `${user.email},${user.nomUtilisateur},${user.prenom},${
              user.role
            },${user.entreprises.join(';')}`
        )
        .join('\n')
    )
    process.exit(0)
  })
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
