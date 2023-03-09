import { DefineComponent, defineComponent, RenderFunction, SetupContext } from 'vue'

type PushFront<TailT extends any[], HeadT> = ((head: HeadT, ...tail: TailT) => void) extends (...arr: infer ArrT) => void ? ArrT : never

type CalculatePermutations<U extends string | number | symbol, ResultT extends any[] = []> = {
  [k in U]: [Exclude<U, k>] extends [never] ? PushFront<ResultT, k> : CalculatePermutations<Exclude<U, k>, PushFront<ResultT, k>>
}[U]

// TODO 2023-03-08: supprimer ça le jour où https://github.com/vuejs/rfcs/discussions/282 est implémenté
export function caminoDefineComponent<T>(props: CalculatePermutations<keyof T>, setup: (props: Readonly<T>, ctx: SetupContext) => RenderFunction): DefineComponent<T> {
  const r = defineComponent(setup)
  // @ts-ignore
  r.props = props
  return r
}

export const isEventWithTarget = (event: any): event is FocusEvent & { target: HTMLInputElement } => event.target
