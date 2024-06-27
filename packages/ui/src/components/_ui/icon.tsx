import type { DsfrIcon as DsfrIconType } from './dsfrIconSpriteType'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import type { JSX } from 'vue/jsx-runtime'

type DsfrIconProps = {
  name: DsfrIconType
  size?: 'sm' | 'md' | 'lg'
  color?: 'text-title-blue-france' | 'text-title-white-france'
} & Pick<HTMLAttributes, 'class'> &
  ({ 'aria-hidden': 'true' } | { role: 'img'; 'aria-label': string })

export const DsfrIcon: FunctionalComponent<DsfrIconProps> = (props): JSX.Element => {
  const iconClass = props.size ? `fr-icon--${props.size}` : null

  let additionnalAttributes: { 'aria-hidden': 'true' } | { role: 'img'; 'aria-label': string }
  if ('aria-hidden' in props) {
    additionnalAttributes = { 'aria-hidden': props['aria-hidden'] }
  } else {
    additionnalAttributes = { role: props.role, 'aria-label': props['aria-label'] }
  }

  return <span class={[props.name, iconClass]} style={{ color: isNotNullNorUndefined(props.color) ? `var(--${props.color})` : '' }} {...additionnalAttributes} />
}
