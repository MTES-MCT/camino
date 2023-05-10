import { CaminoRestRoute, getRestRoute, ParseUrlParams } from 'camino-common/src/rest'

type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

type UiRestRoute = string & { __camino: 'RestRoute' }

const baseRoute = '/apiUrl'

export const getUiRestRoute = <T extends CaminoRestRoute>(route: T, params: ParseUrlParams<T>, searchParams: Record<string, string> = {}): UiRestRoute => {
  const urlParams = new URLSearchParams()
  Object.keys(searchParams).forEach(key => {
    urlParams.append(key, searchParams[key])
  })
  return `${baseRoute}${getRestRoute(route, params)}?${urlParams}` as UiRestRoute
}

export const fetchWithJson = async <T extends CaminoRestRoute>(
  path: T,
  params: ParseUrlParams<T>,
  method: 'post' | 'get' | 'put' | 'delete' = 'get',
  searchParams: Record<string, string> = {}
): Promise<any> => {
  const url = getUiRestRoute(path, params, searchParams)

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

export const postWithJson = async <U, T extends CaminoRestRoute>(path: T, params: ParseUrlParams<T>, body: unknown, method: 'post' | 'put' = 'post'): Promise<any> => {
  const url = getUiRestRoute(path, params)

  const fetched = await fetch(url, {
    method,
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
