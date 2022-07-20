type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

export type AsyncProcess = Loading | { status: 'LOADED' } | Error
