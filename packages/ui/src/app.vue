<template>
  <div class="page relative">
    <Transition name="slide" mode="out-in">
      <component :is="menu.component" v-if="menu.component" />
    </Transition>

    <header class="header">
      <div class="container">
        <PageHeader :loaded="loaded" />
      </div>
    </header>

    <main class="main">
      <div class="container">
        <Error v-if="error" :message="error" />
        <RouterView v-else-if="loaded" />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <PageFooter />
      </div>
    </footer>

    <div class="messages">
      <Messages id="cmn-app-messages" :messages="messages" />
    </div>

    <Transition name="fade">
      <div
        v-if="!!popup.component"
        class="absolute full bg-inverse-alpha z-2"
      />
    </Transition>

    <Transition name="slide-top">
      <component
        :is="popup.component"
        v-bind="popup.props"
        v-if="popup.component"
      />
    </Transition>

    <Transition name="fade">
      <template v-if="loading || fileLoading.total">
        <div class="loaders fixed p">
          <div v-if="loading" class="loader" />
          <div v-if="fileLoading.total">
            <div class="relative loader-file">
              <div
                class="loader-file-bar"
                :style="{
                  right: `${
                    100 - 100 * (fileLoading.loaded / fileLoading.total)
                  }%`
                }"
              />
            </div>
          </div>
        </div>
      </template>
    </Transition>
  </div>
</template>

<script>
import Messages from './components/_ui/messages.vue'
import PageHeader from './components/page/header.vue'
import PageFooter from './components/page/footer.vue'
import Error from './components/error.vue'

export default {
  name: 'App',

  components: {
    Messages,
    PageHeader,
    PageFooter,
    Error
  },

  computed: {
    user() {
      return this.$store.state.user.element
    },

    loaded() {
      return this.$store.state.user.loaded
    },

    error() {
      return this.$store.state.error
    },

    messages() {
      return this.$store.state.messages
    },

    popup() {
      return this.$store.state.popup
    },

    menu() {
      return this.$store.state.menu
    },

    loading() {
      return this.$store.state.loading.length > 0
    },

    fileLoading() {
      return this.$store.state.fileLoading
    }
  },

  async created() {
    this.viewTrack()
  },

  methods: {
    viewTrack() {
      if (this.$matomo) {
        this.$matomo.customVariableVisitUser(this.user)
        this.$matomo.trackPageView()
      }
    }
  }
}
</script>
