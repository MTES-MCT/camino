import {z} from 'zod'

export const caminoConfigValidator = z.object({
  caminoStage: z.enum(['dev', 'preprod', 'prod']).optional(),
  sentryDsn: z.string().optional(),
  environment: z.string(),
  uiHost: z.string(),
  matomoHost: z.string().optional(),
  matomoSiteId: z.string().optional(),
})

export type CaminoConfig = z.infer<typeof caminoConfigValidator>
