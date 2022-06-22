import '../../init.js'
import Utilisateurs from '../../database/models/utilisateurs.js'
import { writeFileSync } from 'fs'

export const main = async () => {
  const utilisateurs = await Utilisateurs.query().whereNotNull('email')

  const kcUsers = utilisateurs.map(u => ({
    username: u.email,
    enabled: true,
    totp: false,
    emailVerified: true,
    credentials: [
      {
        algorithm: 'bcrypt',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        hashedSaltedValue: u.motDePasse,
        hashIterations: 10,
        type: 'password'
      }
    ],
    firstName: u.nom,
    lastName: u.prenom,
    email: u.email,
    clientRoles: {
      account: ['manage-account', 'manage-account-links', 'view-profile']
    }
  }))

  writeFileSync(
    'keycloak.json',
    JSON.stringify({ realm: 'Camino', users: kcUsers }, null, 2)
  )

  process.exit(0)
}

main()
