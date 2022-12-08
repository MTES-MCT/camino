export type CaminoConfig = Readonly<{
  caminoStage?: 'dev' | 'preprod' | 'prod'
  sentryDsn?: string
  environment: string
  uiHost: string
  matomoHost?: string
  matomoSiteId?: string
}>
