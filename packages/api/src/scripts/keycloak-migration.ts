import { getKeycloakApiToken } from '../api/rest/utilisateurs.js'
import { config } from '../config/index.js'
import '../init.js'
import { knex } from '../knex.js'

const migrate = async (): Promise<void> => {
  const token = await getKeycloakApiToken()
  const url = config().KEYCLOAK_URL

  if (!url) {
    throw new Error('variables KEYCLOAK_API_CLIENT_ID and KEYCLOAK_API_CLIENT_SECRET and KEYCLOAK_URL must be set')
  }

  const users = await fetch(`${url}/admin/realms/Camino/users?max=1000`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const fetchedUsers: { id: string; email: string }[] = await users.json()

  for (const user of fetchedUsers) {
    console.info(user.id, user.email)
    // eslint-disable-next-line sql/no-unsafe-query
    await knex.raw(`update utilisateurs set keycloak_id='${user.id}' where lower(email)=lower('${user.email}')`)
  }

  // eslint-disable-next-line sql/no-unsafe-query
  const strangeUsers: { rows: { email: string }[] } = await knex.raw(`select email from utilisateurs where keycloak_id is null and email is not null`)
  strangeUsers.rows.forEach(({ email }) => {
    console.warn(`email ${email} existant dans camino mais pas dans keycloak`)
  })
}

migrate()
  .then(() => {
    console.info('fini')
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
