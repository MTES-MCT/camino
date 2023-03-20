import { Response } from 'express'
import { Request } from 'express-jwt'
import { User } from 'camino-common/src/roles'

type MyResponse<T, U = Response> = (body?: T) => U

export interface CustomResponse<T> extends Response {
  json: MyResponse<T, this>
}

export type CaminoRequest = Request<User>
