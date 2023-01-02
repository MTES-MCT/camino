<template>
  <div class="relative flex flex-direction-column dropdown">
    <div class="absolute border rnd-s bg-bg full-x overflow-hidden">
      <button
        :class="{
          'rnd-t-s': opened,
          'border-b-s': opened
        }"
        class="accordion-header flex btn-alt py-s px-s full-x"
        @click="openToggle"
      >
        <div>
          <slot name="title" />
        </div>
        <div class="flex flex-right flex-end">
          <Icon size="M" :name="opened ? 'chevron-haut' : 'chevron-bas'" />
        </div>
      </button>

      <div class="overflow-hidden">
        <div :class="{ 'overflow-hidden': !opened, opened: opened }">
          <Transition name="slide">
            <slot v-if="opened" />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '@/components/_ui/icon'
export default {
  name: 'UiSytemDropdown',
  components: { Icon },
  props: {
    opened: { type: Boolean, default: false }
  },

  emits: ['toggle'],

  methods: {
    openToggle() {
      this.$emit('toggle', this.opened)
    }
  }
}
</script>
