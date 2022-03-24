<template>
  <pure-button
    :menu-active="menuActive"
    :user="user"
    @onConnectionClicked="popupOpen"
    @onUserClicked="goToUser"
  />
</template>

<script>
import UserLoginPopup from './login-popup.vue'
import PureButton from './pure-button.vue'

export default {
  components: { PureButton },

  computed: {
    user() {
      return this.$store.state.user.element
    },
    menuActive() {
      return (this.$store.state.menu?.component?.name ?? '') === 'UserMenu'
    }
  },

  methods: {
    popupOpen() {
      this.$store.commit('popupOpen', { component: UserLoginPopup })
    },
    goToUser() {
      this.eventTrack()
      this.$router.push({ name: 'utilisateur', params: { id: this.user.id } })
    },
    eventTrack() {
      if (this.$matomo) {
        this.$matomo.trackEvent('menu', 'bouton', 'utilisateur')
      }
    }
  }
}
</script>
