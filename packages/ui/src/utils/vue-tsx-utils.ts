import { readonly, ref, Ref } from 'vue'

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

export function useState<T>(initialState: T): [Ref<T>, (value: T) => void] {
  const state = ref<T>(initialState) as Ref<T>
  const setState = (newState: T) => {
    state.value = newState
  }

  // TODO 2024-12-03 avant on avait le deepreadonly qu'on a viré car trop encombrant dans nos types, ça débordait de partout dans le common/api et on avait des gros conflits avec les NonEmptyArray et les structures un peu complexes.
  // On n'a pas trouvé de règle eslint pour vérifier que le state n'est jamais modifié, donc c'est dangereux :(
  return [readonly(state) as Ref<T>, setState]
}
