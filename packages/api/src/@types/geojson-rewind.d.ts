declare module 'geojson-rewind' {
  function rewind<T>(gj: T, outer?: boolean): T
  namespace rewind {}
  export = rewind
}
