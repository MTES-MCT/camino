import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { computed, LinkHTMLAttributes } from 'vue'
import { LocationQueryValue, useLink, UseLinkOptions } from 'vue-router'

export const routerQueryToNumber = (value: LocationQueryValue | LocationQueryValue[], defaultValue: number): number => {
  return Number(value) ?? defaultValue
}

export type Props = {
  title: string
  class?: LinkHTMLAttributes['class']
  isDisabled?: boolean
} & UseLinkOptions
export const CaminoRouterLink = caminoDefineComponent<Props>(['to', 'title', 'class', 'replace', 'isDisabled'], (props, ctx) => {
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