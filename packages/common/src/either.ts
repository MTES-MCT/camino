import { ZodError } from 'zod'

export interface Left<A> {
  value: A
  tag: 'left'
}

export interface Right<B> {
  value: B
  tag: 'right'
}

export type Either<A, B> = Left<A> | Right<B>

export function isLeft<A>(val: Right<any> | Left<A>): val is Left<A> {
  if ((val as Left<A>).tag === 'left') return true

  return false
}

export function isRight<B>(val: Right<B> | Left<any>): val is Right<B> {
  if ((val as Right<B>).tag === 'right') return true

  return false
}

export function Left<A>(val: A): Left<A> {
  return { value: val, tag: 'left' }
}

export function Right<B>(val: B): Right<B> {
  return { value: val, tag: 'right' }
}

export function fromEither<A, B, C, D>(either: Either<A, B>, flatmapLeft: (left: A) => C, flatmapRight: (right: B) => D): C | D {
  return isLeft(either) ? flatmapLeft(either.value) : flatmapRight(either.value)
}

export function map<A, B, C, D>(either: Either<A, B>, mapLeft: (left: A) => C, mapRight: (rigth: B) => D): Either<C, D> {
  return isLeft(either) ? Left(mapLeft(either.value)) : Right(mapRight(either.value))
}

export function flatmapLeft<A, B, C>(either: Either<A, B>, fmapLeft: (left: A) => C): Either<C, B> {
  return isLeft(either) ? Left(fmapLeft(either.value)) : either
}
export function flatMapRight<A, B, D>(either: Either<A, B>, fmapRight: (left: B) => D): Either<A, D> {
  return isRight(either) ? Right(fmapRight(either.value)) : either
}

export type CaminoError = {
  message: string
  extra?: unknown
  zodError?: ZodError
}
