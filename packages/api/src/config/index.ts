import dotenv from 'dotenv'
import { resolve } from 'node:path'
import { caminoAnneeValidator, getCurrentAnnee } from 'camino-common/src/date.js'
import { caminoConfigValidator } from 'camino-common/src/static/config.js'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { z } from 'zod'

dotenv.config({ path: resolve(process.cwd(), '../../.env') })

const JWT_ALGORITHMS = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512', 'none'] as const

const configValidator = caminoConfigValidator.extend({
  API_HOST: z.string(),
  KEYCLOAK_API_CLIENT_ID: z.string(),
  KEYCLOAK_API_CLIENT_SECRET: z.string(),
  KEYCLOAK_URL: z.string().url(),
  KEYCLOAK_RESET_PASSWORD_URL: z.string(),
  KEYCLOAK_CLIENT_ID: z.string(),
  KEYCLOAK_LOGOUT_URL: z.string(),
  OAUTH_URL: z.string().url(),
  NODE_ENV: z.string(),
  APPLICATION_VERSION: z.string(),
  API_SENTRY_URL: z.string().optional(),
  PGHOST: z.string(),
  PGPORT: z.coerce.number().default(5432),
  PGUSER: z.string(),
  PGPASSWORD: z.string(),
  PGDATABASE: z.string(),
  API_PORT: z.coerce.number(),
  ENV: z.enum(['prod', 'preprod', 'dev']).default('dev'),
  ADMIN_EMAIL: z.string().email(),
  ANNEE: caminoAnneeValidator.default(getCurrentAnnee()),
  JWT_SECRET: z.string(),
  JWT_SECRET_ALGORITHM: z.enum(JWT_ALGORITHMS).default('HS256'),
  API_INSEE_URL: z.string(),
  API_INSEE_KEY: z.string(),
  API_INSEE_SECRET: z.string(),
  API_MAILJET_EMAIL: z.string().email(),
  API_MAILJET_REPLY_TO_EMAIL: z.string().email(),
  API_ADMINISTRATION_URL: z.string().url(),
  API_MAILJET_KEY: z.string(),
  API_MAILJET_SECRET: z.string(),
  API_MAILJET_CONTACTS_LIST_ID: z.coerce.number(),
  API_MAILJET_EXPLOITANTS_GUYANE_LIST_ID: z.coerce.number(),
  API_OPENFISCA_URL: z.string().url(),
})

let cacheConfig: z.infer<typeof configValidator>
export const renewConfig = () => {
  cacheConfig = configValidator.parse(process.env)
}

export const config = (): z.infer<typeof configValidator> => {
  if (isNullOrUndefined(cacheConfig)) {
    renewConfig()
  }

  return cacheConfig
}
