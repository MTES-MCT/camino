import { DefineComponent, defineComponent, RenderFunction, SetupContext } from 'vue'

// TODO 2023-03-08: supprimer ça le jour où https://github.com/vuejs/rfcs/discussions/282 est implémenté
export function caminoDefineComponent<T>(props: (keyof T)[], setup: (props: Readonly<T>, ctx: SetupContext) => RenderFunction): DefineComponent<T> {
  const r = defineComponent(setup)
  r.props = props
  return r
}

export const isEventWithTarget = (event: any): event is FocusEvent & { target: HTMLInputElement } => event.target
