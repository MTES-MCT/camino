export type NotNullableKeys<T> = { [K in keyof T]: NonNullable<T[K]> }

export const isNotNullNorUndefined = <T>(
  value: T | null | undefined
): value is T => {
  return value !== null && value !== undefined
}
