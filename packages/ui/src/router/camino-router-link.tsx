import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { computed, LinkHTMLAttributes } from 'vue'
import { LocationQueryValue, useLink, UseLinkOptions } from 'vue-router'

export const routerQueryToNumber = (value: LocationQueryValue | LocationQueryValue[], defaultValue: number): number => {
  return value !== undefined ? Number(value) : defaultValue
}
export const routerQueryToNumberArray = (value: LocationQueryValue | LocationQueryValue[], defaultValue: number[]): number[] => {
  if (value === undefined) {
    return defaultValue
  }
  return Array.isArray(value) ? value.map(value => Number(value)) : [Number(value)]
}

export const routerQueryToString = (value: LocationQueryValue | LocationQueryValue[], defaultValue: string): string => {
  return value !== undefined ? String(value) : defaultValue
}

export const routerQueryToStringArray = (value: LocationQueryValue | LocationQueryValue[]): string[] => {
  if (value === undefined) {
    return []
  }
  // le split est pour supporter les deux formats de liste, `typesIds=ar,ax,pr` ou `typesIds=ar&typesIds=ax`, le premier ayant été utilisé par le passé, il faut garder la rétro-compatibilité
  return Array.isArray(value) ? value.map(value => String(value)) : String(value).split(',')
}

export type Props = {
  title: string
  class?: LinkHTMLAttributes['class']
} & ({ isDisabled: true; to: '' } | ({ isDisabled?: false } & Omit<UseLinkOptions, 'replace'>))
export const CaminoRouterLink = caminoDefineComponent<Props>(['to', 'title', 'class', 'isDisabled'], (props, ctx) => {
  const { href, navigate } = useLink(props)
  const formatedProps = computed<LinkHTMLAttributes>(() => {
    if (props.isDisabled ?? false) {
      return { 'aria-disabled': true, role: 'link' }
    } else {
      return { href: href.value, onClick: navigate }
    }
  })

  return () => (
    <a {...formatedProps.value} title={props.title} class={props.class} aria-label={props.title}>
      {ctx.slots.default ? ctx.slots.default() : null}
    </a>
  )
})
