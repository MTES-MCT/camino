export type NotNullableKeys<T> = { [K in keyof T]: NonNullable<T[K]> }

export type Nullable<T> = { [P in keyof T]: T[P] | null }
export function isNotNullNorUndefined<T>(value: T | null | undefined): value is T {
  return !isNullOrUndefined(value)
}

export const isNotNullNorUndefinedNorEmpty = <U>(value: U[] | null | undefined): value is NonEmptyArray<U> => {
  if (!isNullOrUndefined(value)) {
    return isNonEmptyArray(value)
  }

  return false
}

export const isNullOrUndefinedOrEmpty = <U>(value: U[] | null | undefined): value is null | undefined => {
  if (isNullOrUndefined(value)) {
    return true
  }

  return Array.isArray(value) && value.length === 0
}

export const isNullOrUndefined = <T>(value: T | null | undefined): value is null | undefined => {
  return value === null || value === undefined
}

export const onlyUnique = <T>(value: T, index: number, self: T[]): boolean => {
  return self.indexOf(value) === index
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

export const getValues = <T>(o: { [s: string]: T } | ArrayLike<T>): T extends unknown ? T[] : never => {
  // @ts-ignore
  return Object.values(o)
}

export const getKeys = <T extends object>(object: T, filter: (key: string) => key is Extract<keyof T, string>): Array<Extract<keyof T, string>> => Object.keys(object).filter(filter)
export const getEntries = <T extends string, U>(object: Record<T, U>, filter: (key: string) => key is T): [T, U][] =>
  Object.entries<U>(object).filter((key: [string, U]): key is [T, U] => filter(key[0]))

// @ts-ignore use with caution
export const getEntriesHardcore = <T extends string, U>(object: Record<T, U>): [T, U][] => Object.entries<U>(object)

export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>
}

export const exhaustiveCheck = (param: never): never => {
  throw new Error(`Unreachable case: ${JSON.stringify(param)}`)
}
export type NonEmptyArray<T> = [T, ...T[]]
export const isNonEmptyArray = <T>(arr: T[]): arr is NonEmptyArray<T> => {
  return arr.length > 0
}

export const isTrue = <T extends true>(_t: T) => {}
export const isFalse = <T extends false>(_t: T) => {}

export type Expect<T, E> = T extends E ? (E extends T ? true : false) : false

// from https://stackoverflow.com/questions/72789915/typescript-omit-seems-to-transform-an-union-into-an-intersection/72790170#72790170
export type OmitDistributive<T, K extends string> = T extends unknown ? Omit<T, K> : never

export type SimplePromiseFn<T> = () => Promise<T>
export type Memoized<T> = SimplePromiseFn<T> & { _type: 'MEMOIZED' }
export const memoize = <T>(fn: SimplePromiseFn<T>): Memoized<T> => {
  let cache: T | null = null

  return (async () => {
    if (cache === null) {
      cache = await fn()
    }

    return cache
  }) as Memoized<T>
}
