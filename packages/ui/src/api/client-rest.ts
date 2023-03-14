import { CaminoRestRoute, ALL_CAMINO_REST_ROUTES, getRestRoute, ParseUrlParams } from 'camino-common/src/rest'

type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

type UiRestRoute = string & { __camino: 'RestRoute' }

const baseRoute = '/apiUrl'

const getUiRestRoute = <T extends CaminoRestRoute>(route: T, params: ParseUrlParams<T>): UiRestRoute => {
  return `${baseRoute}${getRestRoute(route, params)}` as UiRestRoute
}

export const fetchWithJson = async <T extends CaminoRestRoute>(path: T, params: ParseUrlParams<T>, method: 'post' | 'get' | 'put' | 'delete' = 'get'): Promise<any> => {
  const url = getUiRestRoute(path, params)
  const fetched = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
  })
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

export const postWithJson = async <U, T extends CaminoRestRoute>(path: T, params: ParseUrlParams<T>, body: unknown): Promise<any> => {
  const url = getUiRestRoute(path, params)

  const fetched = await fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
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
