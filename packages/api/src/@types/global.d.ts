interface ReadonlyArray<T> {
  includes<U>(
    _x: U & (T & U extends never ? never : unknown),
    _fromIndex?: number
  ): boolean
}

interface Array<T> {
  includes<U>(
    _searchElement: U & (T & U extends never ? never : unknown),
    _fromIndex?: number
  ): boolean
}
