import '../../init'
import Utilisateurs from '../../database/models/utilisateurs'
import { writeFileSync } from 'fs'

const main = async () => {
  const utilisateurs = await Utilisateurs.query().whereNotNull('email')

  const kcUsers = utilisateurs.map(u => ({
    username: u.email,
    enabled: true,
    totp: false,
    emailVerified: true,
    firstName: u.nom,
    lastName: u.prenom,
    email: u.email,
    clientRoles: {
      account: ['manage-account', 'manage-account-links', 'view-profile']
    }
  }))

  writeFileSync(
    'keycloak.json',
    JSON.stringify({ realm: 'camino', users: kcUsers }, null, 2)
  )

  process.exit(0)
}

main()
