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

// VisibleForTesting
export const getUiRestRoute = (route: CaminoRestRoute): UiRestRoute => {
  const uiRoute = `${baseRoute}${route}`
  if (!isUiRestRoute(uiRoute)) {
    throw new Error(`la route ${route} n'est pas une route connue`)
  } else {
    return uiRoute
  }
}

type ParseUrlParams<url> = url extends `${infer path}(${infer optionalPath})`
  ? ParseUrlParams<path> & Partial<ParseUrlParams<optionalPath>>
  : url extends `${infer start}/${infer rest}`
  ? ParseUrlParams<start> & ParseUrlParams<rest>
  : url extends `:${infer param}`
  ? { [k in param]: string }
  : {}

export const fetchWithJson = async <U, T extends CaminoRestRoute>(
  path: T,
  params: ParseUrlParams<T>,
  method: 'post' | 'get' | 'put' | 'delete' = 'get'
): Promise<any> => {
  const uiPath = getUiRestRoute(path)
  let url = Object.entries<string>(params).reduce<string>(
    (uiPath, [key, value]) => uiPath.replace(`:${key}`, value),
    uiPath
  )
  // clean url
  url = url.replace(/(\(|\)|\/?:[^/]+)/g, '')
  const fetched = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' }
  })
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
