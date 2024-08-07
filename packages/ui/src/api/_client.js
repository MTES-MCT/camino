import { print } from 'graphql/language/printer'
import fetchOptionsGraphQL from 'graphql-react/fetchOptionsGraphQL.mjs'
import fetchGraphQL from 'graphql-react/fetchGraphQL.mjs'
import Cache from 'graphql-react/Cache.mjs'
import Loading from 'graphql-react/Loading.mjs'
import LoadingCacheValue from 'graphql-react/LoadingCacheValue.mjs'
import { HTTP_STATUS } from 'camino-common/src/http'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'

const apiUrl = '/apiUrl'
const cache = new Cache()
const loading = new Loading()

const errorThrow = e => {
  if (e.message === 'aborted' || e.message === 'Fetch error.' || e.message === 'Response JSON parse error.') throw new Error('aborted')

  let message = e.message
  if (isNullOrUndefined(message)) {
    message = e.status
  }
  throw new Error(message)
}

const graphQLCall = async (url, query, variables, cacheKey = query.definitions[0].name.value) => {
  const abortController = new AbortController()
  const fetchOptions = fetchOptionsGraphQL({
    query: print(query),
    variables,
  })

  fetchOptions.signal = abortController.signal

  if (isNotNullNorUndefined(loading.store[cacheKey])) {
    loading.store[cacheKey].forEach(a => {
      a.abortController.abort()
    })
  }

  const req = fetchGraphQL(url, fetchOptions)

  const loadingCacheValue = new LoadingCacheValue(loading, cache, cacheKey, req, abortController)

  const res = await loadingCacheValue.promise

  if (isNotNullNorUndefinedNorEmpty(res.errors)) {
    res.errors.forEach(e => {
      if (isNotNullNorUndefined(e.extensions) && isNotNullNorUndefined(e.extensions.client) && e.message === 'FETCH_ERROR') throw new Error('aborted')

      throw new Error(e.message)
    })
  }

  const data = res.data

  const keys = Object.keys(data)
  const dataContent = keys.length === 1 ? data[keys[0]] : data

  return dataContent
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const apiGraphQLFetch = (query, cacheKey) => async variables => {
  try {
    return await graphQLCall(apiUrl, query, variables, cacheKey)
  } catch (e) {
    if (e.status === HTTP_STATUS.UNAUTHORIZED || e.message === `HTTP ${HTTP_STATUS.UNAUTHORIZED} status.`) {
      // si la session est expirée on doit réauthentifier l’utilisateur
      window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
    } else {
      errorThrow(e)
    }
  }
}
