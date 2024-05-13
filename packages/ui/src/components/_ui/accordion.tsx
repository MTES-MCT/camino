import { defineComponent, HTMLAttributes, ref, Transition, watch } from 'vue'

import { Icon } from '@/components/_ui/icon'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

type Props = {
  opened: boolean
  slotSub: boolean
  toggle: () => void
} & Pick<HTMLAttributes, 'class'>

/**
 * @deprecated
 */
export const DeprecatedAccordion = defineComponent<Props>((props, context) => {
  const isOverflowHidden = ref<boolean>(true)
  const animationTimeout = ref<NodeJS.Timeout | null>(null)

  watch(
    () => props.opened,
    () => {
      // Overflow "hidden" est nécessaire pour l'animation d'ouverture/fermeture,
      //       // mais est retiré pour éviter un bug visuel avec les infobulles.
      //       // Le timeout est nécessaire pour ajuster l'overflow dans l'état requis,
      //       // tout en permettant à l'animation d'ouverture de se jouer correctement.
      if (!props.opened) {
        if (isNotNullNorUndefined(animationTimeout.value)) {
          clearTimeout(animationTimeout.value)
        }
        isOverflowHidden.value = true
      } else {
        animationTimeout.value = setTimeout(() => (isOverflowHidden.value = false), 1000)
      }
    },
    { immediate: true }
  )

  return () => (
    <div class={props.class}>
      <div class="flex flex-direction-column rnd-s border bg-bg">
        <button
          class={{
            'rnd-t-s': props.opened || props.slotSub,
            'rnd-s': !props.opened && !props.slotSub,
            'border-b-s': props.opened || props.slotSub,
            'accordion-header': true,
            flex: true,
            'py-s': true,
            'px-s': true,
          }}
          title={props.opened ? 'Replier l’accordéon' : 'Déplier l’accordéon'}
          aria-label={props.opened ? 'Replier l’accordéon' : 'Déplier l’accordéon'}
          onClick={props.toggle}
        >
          <div>{context.slots.title?.()}</div>
          <div class="flex flex-right flex-end">
            <Icon size="M" name={props.opened ? 'chevron-haut' : 'chevron-bas'} aria-hidden="true" />
          </div>
        </button>

        <>{props.slotSub ? <>{context.slots.sub?.()}</> : null}</>

        <div class={{ 'overflow-hidden': isOverflowHidden.value }}>
          <Transition name="slide">
            <div style={{ display: props.opened ? 'block' : 'none' }}>{context.slots.default?.()}</div>
          </Transition>
        </div>
      </div>
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DeprecatedAccordion.props = ['opened', 'slotSub', 'toggle', 'class']
