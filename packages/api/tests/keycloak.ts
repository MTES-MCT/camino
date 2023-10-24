import { createServer, Server } from 'node:http'
import { KeycloakAccessTokenResponse } from '../src/api/rest/utilisateurs'

export type KeycloakFakeServer = {
  server: Server
}

export const idUserKeycloakRecognised = 'iduser-keycloak'
export const setupKeycloak = async (): Promise<KeycloakFakeServer> => {
  process.env.KEYCLOAK_API_CLIENT_ID = 'anything'
  process.env.KEYCLOAK_API_CLIENT_SECRET = 'anything-secret'
  process.env.KEYCLOAK_URL = 'http://localhost:12345'

  return new Promise<KeycloakFakeServer>(resolve => {
    const server = createServer((req, res) => {
      if (req.url === '/realms/Camino/protocol/openid-connect/token') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const token: KeycloakAccessTokenResponse = { access_token: 'a forged token' }
        res.write(JSON.stringify(token))
        res.end()
      } else if (req.url === `/admin/realms/Camino/users/${idUserKeycloakRecognised}`) {
        res.writeHead(204)
        res.end()
      } else {
        console.error('unknown route called', req.url)
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({ route: req.url, error: 'unknown route' }))
        res.end()
      }
    })
    server.listen(12345, () => {
      console.info('fake keycloak up and running')
      resolve({ server })
    })
  })
}

export const teardownKeycloak = async (keycloak: KeycloakFakeServer): Promise<void> => {
  return new Promise<void>((resolve, reject) =>
    keycloak.server.close(error => {
      if (error === undefined) {
        resolve()
      } else {
        reject(error)
      }
    })
  )
}
