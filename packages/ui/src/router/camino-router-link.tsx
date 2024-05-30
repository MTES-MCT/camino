import { computed, LinkHTMLAttributes, AnchorHTMLAttributes, defineComponent, SetupContext } from 'vue'
import { LocationQueryValueRaw, useLink } from 'vue-router'
import { CaminoRouteNames, CaminoVueRoute } from './routes'

export const routerQueryToNumber = (value: LocationQueryValueRaw | LocationQueryValueRaw[] | undefined, defaultValue: number): number => {
  return value !== undefined ? Number(value) : defaultValue
}
export const routerQueryToNumberArray = (value: LocationQueryValueRaw | LocationQueryValueRaw[] | undefined, defaultValue: number[]): number[] => {
  if (value === undefined) {
    return defaultValue
  }

  return Array.isArray(value) ? value.map(value => Number(value)) : [Number(value)]
}

export const routerQueryToString = (value: LocationQueryValueRaw | LocationQueryValueRaw[] | undefined, defaultValue: string): string => {
  return value !== undefined ? String(value) : defaultValue
}

export const routerQueryToStringArray = (value: LocationQueryValueRaw | LocationQueryValueRaw[] | undefined): string[] => {
  if (value === undefined) {
    return []
  }

  // le split est pour supporter les deux formats de liste, `typesIds=ar,ax,pr` ou `typesIds=ar&typesIds=ax`, le premier ayant été utilisé par le passé, il faut garder la rétro-compatibilité
  return Array.isArray(value) ? value.map(value => String(value)) : String(value).split(',')
}

type Props<T extends CaminoRouteNames> = {
  title: string
  class?: LinkHTMLAttributes['class']
  anchorHTMLAttributes?: AnchorHTMLAttributes
} & ({ isDisabled: true; to: '' } | { isDisabled: false; to: CaminoVueRoute<T> })
export const CaminoRouterLink = defineComponent(<T extends CaminoRouteNames>(props: Props<T>, ctx: SetupContext) => {
  const { href, navigate } = useLink(props)
  const formatedProps = computed<LinkHTMLAttributes>(() => {
    if (props.isDisabled ?? false) {
      return { 'aria-disabled': true, role: 'link' }
    } else {
      return { href: href.value, onClick: navigate }
    }
  })

  return () => (
    <a {...props.anchorHTMLAttributes} {...formatedProps.value} title={props.title} class={props.class} aria-label={props.title}>
      {ctx.slots.default ? ctx.slots.default() : null}
    </a>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
CaminoRouterLink.props = ['to', 'title', 'class', 'isDisabled', 'anchorHTMLAttributes']
