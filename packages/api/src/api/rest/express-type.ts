import express from 'express'

type MyResponse<T, U = express.Response> = (body?: T) => U

export interface CustomResponse<T> extends express.Response {
  json: MyResponse<T, this>
}
