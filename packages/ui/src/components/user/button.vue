<template>
  <pure-button
    :menuActive="menuActive"
    :user="user"
    @onConnectionClicked="popupOpen"
    @onUserClicked="goToUser"
  />
</template>

<script>
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
      window.location.replace(
        '/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href)
      )
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
