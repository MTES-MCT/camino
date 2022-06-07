export type AsyncData<T> =
  | { status: 'LOADING' }
  | { status: 'LOADED'; value: T }
  | { status: 'ERROR'; message: string }
