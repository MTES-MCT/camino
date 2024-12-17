declare module 'graphql-react/fetchOptionsGraphQL.mjs'
declare module 'graphql-react/fetchGraphQL.mjs'
declare module 'graphql-react/Cache.mjs' {
  class GraphqlReactCache {}
  export default GraphqlReactCache
}
declare module 'graphql-react/Loading.mjs' {
  class Loading {
    public store: Record<string, { abortController: AbortController }[]>
  }
  export default Loading
}
declare module 'graphql-react/LoadingCacheValue.mjs' {
  class LoadingCacheValue {
    public promise: Promise<{ errors: { extensions: { client: any }; message: string }[]; data: any }>
    // eslint-disable-next-line
    constructor(loading: Loading, cache: GraphqlReactCache, cacheKey: string, req: any, abortController: AbortController)
  }
  export default LoadingCacheValue
}
