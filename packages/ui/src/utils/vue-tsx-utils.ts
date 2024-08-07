import { DeepReadonly, readonly, ref, Ref } from 'vue'

export const isEventWithTarget = (event: Event): event is FocusEvent & { target: HTMLInputElement } => 'target' in event

let seed = Math.random()
// USED Only for testing
export const setSeed = (value: number): void => {
  seed = value
}
export const random = (): number => {
  const x = Math.sin(seed++) * 10000

  return x - Math.floor(x)
}

export function useState<T>(initialState: T): [Readonly<Ref<DeepReadonly<T>>>, (value: T | DeepReadonly<T>) => void] {
  const state = ref<T>(initialState) as Ref<T>
  const setState = (newState: T | DeepReadonly<T>) => {
    state.value = newState as T
  }

  return [readonly(state), setState]
}
