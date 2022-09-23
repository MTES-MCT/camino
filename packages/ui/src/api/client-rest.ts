import { CaminoRestRoute, ALL_CAMINO_REST_ROUTES } from 'camino-common/src/rest'

type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

type UiRestRoute = string & { __camino: 'RestRoute' }

const baseRoute = '/apiUrl'

const isUiRestRoute = (route: string): route is UiRestRoute => {
  if (route.startsWith(baseRoute)) {
    return ALL_CAMINO_REST_ROUTES.includes(route.substring(baseRoute.length))
  }
  return false
}

export const getUiRestRoute = (route: CaminoRestRoute): UiRestRoute => {
  const uiRoute = `${baseRoute}${route}`
  if (!isUiRestRoute(uiRoute)) {
    throw new Error(`la route ${route} n'est pas une route connue`)
  } else {
    return uiRoute
  }
}

export const fetchWithJson = async <T>(
  url: UiRestRoute | CaminoRestRoute
): Promise<T> => {
  if (!isUiRestRoute(url)) {
    url = getUiRestRoute(url)
  }
  const fetched = await fetch(url)
  const body = await fetched.json()
  if (fetched.ok) {
    return body
  }
  console.error(
    `Une erreur s'est produite lors de la récupération des données ${JSON.stringify(
      body
    )}`
  )
  throw new Error(
    `Une erreur s'est produite lors de la récupération des données`
  )
}
