declare module 'type-fest' {
  // TODO 2023-06-12 required by @tus/server, waiting for https://github.com/tus/tus-node-server/pull/443/files to be merged
  export type SetRequired<T, A extends keyof T> = Required<Pick<T, A>> & Omit<T, A>
}
