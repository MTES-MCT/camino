<template>
  <Loader v-if="!loaded" class="content" />
  <div v-else class="content">
    <PureGlobales :statistiques="statistiques" />
  </div>
</template>

<script>
import Loader from '../_ui/loader.vue'
import PureGlobales from './pure-globales.vue'

export default {
  name: 'CaminoStatistiques',

  components: { PureGlobales, Loader },

  data() {
    return {
      loaded: false
    }
  },

  computed: {
    statistiques() {
      return this.$store.state.statistiques.globales
    }
  },

  async created() {
    await this.get()
  },

  methods: {
    async get() {
      await this.$store.dispatch('statistiques/get', 'globales')

      if (!this.loaded) {
        this.loaded = true
      }
    }
  }
}
</script>
