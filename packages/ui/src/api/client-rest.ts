import { CaminoRestParams, CaminoRestRoute, CaminoRestRoutes, DeleteRestRoutes, DownloadRestRoutes, getRestRoute, GetRestRoutes, PostRestRoutes, PutRestRoutes } from 'camino-common/src/rest'
import { z } from 'zod'

type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

type UiRestRoute = string & { __camino: 'RestRoute' }

const baseRoute = '/apiUrl'

const getUiRestRoute = <T extends CaminoRestRoute>(route: T, params: CaminoRestParams<T>, searchParams: Record<string, string> = {}): UiRestRoute => {
  const urlParams = new URLSearchParams()
  Object.keys(searchParams).forEach(key => {
    urlParams.append(key, searchParams[key])
  })
  return `${baseRoute}${getRestRoute(route, params)}?${urlParams}` as UiRestRoute
}

// TODO 2023-05-25: move into Download component and make download component display href
export const getDownloadRestRoute = <T extends DownloadRestRoutes>(route: T, params: CaminoRestParams<T>, searchParams: Record<string, string> = {}): UiRestRoute => {
  return getUiRestRoute(route, params, searchParams)
}

const callFetch = async <T extends CaminoRestRoute>(
  path: T,
  params: CaminoRestParams<T>,
  method: 'post' | 'put' | 'get' | 'delete',
  searchParams: Record<string, string> = {},
  body?: any
): Promise<any> => {
  const url = getUiRestRoute(path, params, searchParams)

  const defaultOptions = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  const fetched = await fetch(url, body ? { ...defaultOptions, body: JSON.stringify(body) } : defaultOptions)
  if (fetched.ok) {
    if (fetched.status === 200) {
      const body = await fetched.json()
      return body
    }
    return
  }
  if (fetched.status === 403) {
    window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
  }
  console.error(`Une erreur s'est produite lors de la récupération des données ${await fetched.text()}`)
  throw new Error(`Une erreur s'est produite lors de la récupération des données`)
}

export const getWithJson = async <T extends GetRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  searchParams: Record<string, string> = {}
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['get']['output']>> => await callFetch(path, params, 'get', searchParams)

export const deleteWithJson = async <T extends DeleteRestRoutes>(path: T, params: CaminoRestParams<T>, searchParams: Record<string, string> = {}): Promise<void> =>
  await callFetch(path, params, 'delete', searchParams)

export const postWithJson = async <T extends PostRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  body: z.infer<(typeof CaminoRestRoutes)[T]['post']['input']>
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['post']['output']>> => await callFetch(path, params, 'post', {}, body)

export const putWithJson = async <T extends PutRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  body: z.infer<(typeof CaminoRestRoutes)[T]['put']['input']>
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['put']['output']>> => await callFetch(path, params, 'put', {}, body)
