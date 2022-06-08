export type NotNullableKeys<T> = { [K in keyof T]: NonNullable<T[K]> }
