<template>
  <div class="flex flex-direction-column rnd-s border bg-bg">
    <div
      v-if="slotButtons"
      class="accordion-header flex"
      :class="{
        'rnd-t-s': opened || slotSub,
        'rnd-s': !opened && !slotSub,
        'border-b-s': opened || slotSub,
      }"
    >
      <div class="py-s px-m">
        <slot name="title" />
      </div>

      <div class="overflow-hidden flex flex-end flex-right">
        <slot name="buttons" />
        <ButtonIcon
          v-if="slotDefault"
          class="btn-alt py-s px-m"
          :class="{ 'rnd-br-s': !opened }"
          :onClick="toggle"
          :icon="opened ? 'chevron-haut' : 'chevron-bas'"
          :title="opened ? 'Replier l’accordéon' : 'Déplier l’accordéon'"
        />
        <div v-else class="py-s" style="width: calc(2.5 * var(--unit))" />
      </div>
    </div>

    <button
      v-else-if="slotDefault && !slotButtons"
      :class="{
        'rnd-t-s': opened || slotSub,
        'rnd-s': !opened && !slotSub,
        'border-b-s': opened || slotSub,
      }"
      class="accordion-header flex btn-alt py-s px-s"
      :title="opened ? 'Replier l’accordéon' : 'Déplier l’accordéon'"
      :aria-label="opened ? 'Replier l’accordéon' : 'Déplier l’accordéon'"
      @click="toggle"
    >
      <div>
        <slot name="title" />
      </div>
      <div class="flex flex-right flex-end">
        <Icon size="M" :name="opened ? 'chevron-haut' : 'chevron-bas'" aria-hidden="true" />
      </div>
    </button>

    <div v-else class="py-s px-m">
      <slot name="title" />
    </div>

    <slot v-if="slotSub" name="sub" :class="{ 'border-b-s': opened }" />

    <div v-if="slotDefault" :class="{ 'overflow-hidden': isOverflowHidden }">
      <Transition name="slide">
        <div v-show="opened">
          <slot />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
export default {
  name: 'UiSytemAccordion',
  components: { Icon, ButtonIcon },
  props: {
    opened: { type: Boolean, default: false },

    slotSub: { type: Boolean, default: false },

    slotButtons: { type: Boolean, default: false },

    slotDefault: { type: Boolean, default: false },
  },

  emits: ['toggle'],

  data() {
    return {
      isOverflowHidden: true,
      animationTimeout: null,
    }
  },

  watch: {
    opened: {
      handler: function (isOpened) {
        // Overflow "hidden" est nécessaire pour l'animation d'ouverture/fermeture,
        // mais est retiré pour éviter un bug visuel avec les infobulles.
        // Le timeout est nécessaire pour ajuster l'overflow dans l'état requis,
        // tout en permettant à l'animation d'ouverture de se jouer correctement.
        if (!isOpened) {
          clearTimeout(this.animationTimeout)
          this.isOverflowHidden = true
        } else {
          this.animationTimeout = setTimeout(() => (this.isOverflowHidden = false), 1000)
        }
      },
      immediate: true,
    },
  },

  methods: {
    toggle() {
      this.$emit('toggle')
    },
  },
}
</script>
