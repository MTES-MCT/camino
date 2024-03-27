import { ZodError, ZodTypeAny } from 'zod'

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

export function mapRight<A, B, D>(either: Either<A, B>, mRight: (left: B) => Either<A, D>): Either<A, D> {
  return isRight(either) ? mRight(either.value) : either
}

export type CaminoError = {
  message: string
  extra?: unknown
  zodError?: ZodError
}

export const zodParseEither = <T extends ZodTypeAny>(validator: T, item: unknown ):Either<CaminoError, T['_output']> => {
  const parsed = validator.safeParse(item)
  if (parsed.success) {
    return Right(parsed.data)
  }

  return Left({ message: 'unparseable', zodError: parsed.error })
}
