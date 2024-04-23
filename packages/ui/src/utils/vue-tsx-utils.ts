import { DeepReadonly, DefineComponent, defineComponent, readonly, ref, Ref, RenderFunction, SetupContext } from 'vue'

type PushFront<TailT extends any[], HeadT> = ((head: HeadT, ...tail: TailT) => void) extends (...arr: infer ArrT) => void ? ArrT : never

type CalculatePermutations<U extends string | number | symbol, ResultT extends any[] = []> = {
  [k in U]: [Exclude<U, k>] extends [never] ? PushFront<ResultT, k> : CalculatePermutations<Exclude<U, k>, PushFront<ResultT, k>>
}[U]

/**
 * @deprecated use defineComponent
 */
export function caminoDefineComponent<T>(props: CalculatePermutations<keyof T>, setup: (props: Readonly<T>, ctx: SetupContext) => RenderFunction): DefineComponent<T> {
  const r = defineComponent(setup)
  // @ts-ignore
  r.props = props
  // @ts-ignore
  return r
}

export const isEventWithTarget = (event: any): event is FocusEvent & { target: HTMLInputElement } => event.target

export const updateFromEvent = (e: Event, myRef: Ref<string | null>) => {
  if (isEventWithTarget(e)) {
    myRef.value = e.target.value
  }
}

let seed = Math.random()
// USED Only for testing
export const setSeed = (value: number): void => {
  seed = value
}
export const random = () => {
  const x = Math.sin(seed++) * 10000

  return x - Math.floor(x)
}

export function useState<T>(initialState: T): [Readonly<Ref<DeepReadonly<T>>>, (value: T) => void] {
  const state = ref<T>(initialState) as Ref<T>
  const setState = (newState: T) => {
    state.value = newState
  }

  return [readonly(state), setState]
}
