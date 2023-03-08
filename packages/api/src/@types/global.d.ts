export {}

declare global {
  interface ReadonlyArray<T> {
    includes<U>(_x: U & (T & U extends never ? never : unknown), _fromIndex?: number): boolean
  }

  interface Array<T> {
    includes<U>(_searchElement: U & (T & U extends never ? never : unknown), _fromIndex?: number): boolean
  }
  namespace NodeJS {
    interface ProcessEnv {
      CAMINO_STAGE?: 'dev' | 'preprod' | 'prod'
      SENTRY_DSN?: string
      ENV: string
      UI_HOST: string
      API_MATOMO_URL: string
      API_MATOMO_ID: string
      APPLICATION_VERSION: string
    }
  }
}
