<template>
  <div
    :class="{ active: menu.component && menu.component.name === 'MainMenu' }"
  >
    <button
      id="cmn-menu-button-button-menu"
      class="btn-border small pill p-s"
      alt="Url"
      @click="menuToggle"
    >
      <Icon size="M" name="menu" />
    </button>
  </div>
</template>

<script>
import MainMenu from './menu.vue'
import Icon from '@/components/_ui/icon.vue'

export default {
  components: { Icon },
  data() {
    return {
      popupVisible: false
    }
  },

  computed: {
    menu() {
      return this.$store.state.menu
    }
  },

  methods: {
    menuToggle() {
      this.eventTrack()
      this.$store.dispatch('menuToggle', MainMenu)
    },
    eventTrack() {
      if (this.$matomo) {
        this.$matomo.trackEvent('menu', 'bouton', 'sections')
      }
    }
  }
}
</script>
