export type NotNullableKeys<T> = { [K in keyof T]: NonNullable<T[K]> }

export const isNotNullNorUndefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}

export const onlyUnique = <T>(value: T, index: number, self: T[]): boolean => {
  return self.indexOf(value) === index
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

export const getKeys = <T extends object>(object: T, filter: (key: string) => key is Extract<keyof T, string>): Array<Extract<keyof T, string>> => Object.keys(object).filter(filter)
export const getEntries = <T extends string, U>(object: Record<T, U>, filter: (key: string) => key is T): [T, U][] =>
  Object.entries<U>(object).filter((key: [string, U]): key is [T, U] => filter(key[0]))

export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>
}