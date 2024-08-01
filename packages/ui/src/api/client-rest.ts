import { HTTP_STATUS, HttpStatus } from 'camino-common/src/http'
import {
  CaminoRestParams,
  CaminoRestRoute,
  CaminoRestRoutes,
  DeleteRestRoutes,
  DownloadRestRoutes,
  NewDownloadRestRoutes,
  getRestRoute,
  GetRestRoutes,
  PostRestRoutes,
  PutRestRoutes,
  NewPostRestRoutes,
  NewGetRestRoutes,
} from 'camino-common/src/rest'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { CaminoError } from 'camino-common/src/zod-tools'
import { DeepReadonly } from 'vue'
import { ZodType, z } from 'zod'

type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }
export class CaminoHttpError extends Error {
  public readonly statusCode: HttpStatus
  constructor(errorMessage: string, statusCode: HttpStatus) {
    super(errorMessage)

    this.statusCode = statusCode
  }
}

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

type UiRestRoute = string & { __camino: 'RestRoute' }

const baseRoute = '/apiUrl'

const getUiRestRoute = <T extends CaminoRestRoute>(route: T, params: CaminoRestParams<T>, searchParams: Record<string, string | string[]> = {}): UiRestRoute => {
  return `${baseRoute}${getRestRoute(route, params, searchParams)}` as UiRestRoute
}

// TODO 2023-05-25: move into Download component and make download component display href
export const getDownloadRestRoute = <T extends DownloadRestRoutes | NewDownloadRestRoutes>(route: T, params: CaminoRestParams<T>, searchParams: Record<string, string> = {}): UiRestRoute => {
  return getUiRestRoute(route, params, searchParams)
}

const callFetch = async <T extends CaminoRestRoute>(
  path: T,
  params: CaminoRestParams<T>,
  method: 'post' | 'put' | 'get' | 'delete',
  searchParams: Record<string, string | string[]> = {},
  body?: any
): Promise<any> => {
  const url = getUiRestRoute(path, params, searchParams)

  const defaultOptions = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  const fetched = await fetch(url, isNotNullNorUndefined(body) ? { ...defaultOptions, body: JSON.stringify(body) } : defaultOptions)
  if (fetched.ok) {
    if (fetched.status === 200) {
      const body = await fetched.json()

      return body
    }

    return
  }
  if (fetched.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
  }
  console.error(`Une erreur s'est produite lors de la récupération des données ${await fetched.text()}`)
  // TODO 2024-05-02 améliorer la gestion du status http
  throw new CaminoHttpError(`Une erreur s'est produite lors de la récupération des données`, fetched.status as HttpStatus)
}
type GetWithJsonArgs<T extends GetRestRoutes | NewGetRestRoutes, Method extends keyof (typeof CaminoRestRoutes)[T]> = (typeof CaminoRestRoutes)[T][Method] extends { searchParams: ZodType }
  ? [path: T, params: CaminoRestParams<T>, searchParams: z.infer<(typeof CaminoRestRoutes)[T][Method]['searchParams']>]
  : [path: T, params: CaminoRestParams<T>]

export const getWithJson = async <T extends GetRestRoutes>(...args: GetWithJsonArgs<T, 'get'>): Promise<z.infer<(typeof CaminoRestRoutes)[T]['get']['output']>> =>
  callFetch(args[0], args[1], 'get', args.length === 3 ? args[2] : {})

export const newGetWithJson = async <T extends NewGetRestRoutes>(...args: GetWithJsonArgs<T, 'newGet'>): Promise<z.infer<(typeof CaminoRestRoutes)[T]['newGet']['output']>> =>
  callFetch(args[0], args[1], 'get', args.length === 3 ? args[2] : {})

export const deleteWithJson = async <T extends DeleteRestRoutes>(path: T, params: CaminoRestParams<T>, searchParams: Record<string, string | string[]> = {}): Promise<void> =>
  callFetch(path, params, 'delete', searchParams)

export const postWithJson = async <T extends PostRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  body: z.infer<(typeof CaminoRestRoutes)[T]['post']['input']>
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['post']['output']>> => callFetch(path, params, 'post', {}, body)

export const newPostWithJson = async <T extends NewPostRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  body: z.infer<(typeof CaminoRestRoutes)[T]['newPost']['input']>
): Promise<CaminoError<string> | z.infer<(typeof CaminoRestRoutes)[T]['newPost']['output']>> => {
  const url = getUiRestRoute(path, params, {})

  const defaultOptions = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
  }

  const fetched = await fetch(url, { ...defaultOptions, body: JSON.stringify(body) })
  if (fetched.ok) {
    const bodyResponse = await fetched.json()
    return bodyResponse
  }
  if (fetched.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
  }
  const bodyErrorResponse = await fetched.json()
  return bodyErrorResponse
}

export const putWithJson = async <T extends PutRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  body: DeepReadonly<z.infer<(typeof CaminoRestRoutes)[T]['put']['input']>>
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['put']['output']>> => callFetch(path, params, 'put', {}, body)
