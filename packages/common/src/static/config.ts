import { z } from 'zod'

export const caminoConfigValidator = z.object({
  CAMINO_STAGE: z.enum(['prod', 'preprod', 'dev']).optional(),
  API_MATOMO_URL: z.string(),
  API_MATOMO_ID: z.string(),
})

export type CaminoConfig = z.infer<typeof caminoConfigValidator>
