interface ReadonlyArray<T> {
  includes<U>(_x: U & (T & U extends never ? never : unknown)): boolean
}

interface Array<T> {
  includes<U>(_x: U & (T & U extends never ? never : unknown)): boolean
}
