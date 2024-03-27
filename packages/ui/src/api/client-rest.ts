import { CaminoError, Either, Left, Right } from 'camino-common/src/either'
import { HTTP_STATUS } from 'camino-common/src/http'
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
} from 'camino-common/src/rest'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DeepReadonly } from 'vue'
import { z } from 'zod'

type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

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

/** @deprecated use newCallFetch */
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
  if (fetched.status === HTTP_STATUS.HTTP_STATUS_UNAUTHORIZED) {
    window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
  }
  console.error(`Une erreur s'est produite lors de la récupération des données ${await fetched.text()}`)
  throw new Error(`Une erreur s'est produite lors de la récupération des données`)
}

export const getWithJson = async <T extends GetRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  searchParams: Record<string, string | string[]> = {}
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['get']['output']>> => callFetch(path, params, 'get', searchParams)

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
): Promise<Either<CaminoError, z.infer<(typeof CaminoRestRoutes)[T]['newPost']['output']>>> => {
  const url = getUiRestRoute(path, params, {})

  const defaultOptions = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
  }

  const fetched = await fetch(url, { ...defaultOptions, body: JSON.stringify(body) })
  if (fetched.ok) {
    const bodyResponse = await fetched.json()
    return Right(bodyResponse)
  }
  if (fetched.status === HTTP_STATUS.HTTP_STATUS_UNAUTHORIZED) {
    window.location.replace('/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href))
  }
  const bodyErrorResponse = await fetched.json()
  return Left(bodyErrorResponse)
}

export const putWithJson = async <T extends PutRestRoutes>(
  path: T,
  params: CaminoRestParams<T>,
  body: DeepReadonly<z.infer<(typeof CaminoRestRoutes)[T]['put']['input']>>
): Promise<z.infer<(typeof CaminoRestRoutes)[T]['put']['output']>> => callFetch(path, params, 'put', {}, body)
