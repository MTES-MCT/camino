import {
  ComponentInjectOptions,
  ComponentOptionsMixin,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithoutProps,
  ComponentPropsOptions,
  ComputedOptions,
  DefineComponent,
  defineComponent,
  EmitsOptions,
  MethodOptions,
  Prop
} from 'vue'

export function caminoDefineComponent<
  Props = {},
  E extends EmitsOptions = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string
>(
  options: ComponentOptionsWithoutProps<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE,
    I,
    II
  >
): DefineComponent<Props, RawBindings, D, C, M, Mixin, Extends, E, EE> {
  return defineComponent(options)
}
