<template>
  <liste
    :nom="nom"
    :filtres="filtres"
    :colonnes="colonnes"
    :lignes="lignes"
    :elements="demarches"
    :metas="metas"
    :params="params"
    :total="total"
    :initialized="initialized"
    @params-update="paramsUpdate"
  >
    <template v-if="demarches.length" #downloads>
      <Downloads :formats="['csv', 'xlsx', 'ods']" :downloadRoute="downloadDemarches" :params="downloadParams" class="flex-right full-x" />
    </template>
  </liste>
</template>

<script>
import Liste from '../_common/liste.vue'
import { Downloads } from '../_common/downloads'
import paramsEventTrack from '../../utils/matomo-tracker.js'

import { demarchesColonnes, demarchesLignesBuild } from './table'
import filtres from './filtres'
import { CaminoRestRoutes } from 'camino-common/src/rest'

export default {
  name: 'Demarches',

  components: { Liste, Downloads },

  props: {
    travaux: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      colonnes: demarchesColonnes,
      filtres,
      downloadDemarches: CaminoRestRoutes.downloadDemarches,
      downloadParams: {},
    }
  },

  computed: {
    nom() {
      return this.travaux ? 'travaux' : 'demarches'
    },
    user() {
      return this.$store.state.user.element
    },

    definitions() {
      return this.$store.state.titresDemarches.definitions
    },

    demarches() {
      return this.$store.state.titresDemarches.elements
    },

    total() {
      return this.$store.state.titresDemarches.total
    },

    metas() {
      return this.$store.state.titresDemarches.metas
    },

    params() {
      return this.$store.state.titresDemarches.params
    },

    lignes() {
      return demarchesLignesBuild(this.demarches)
    },

    initialized() {
      return this.$store.state.titresDemarches.initialized
    },
  },

  watch: {
    user: 'init',

    '$route.query': {
      handler: function () {
        this.$store.dispatch('titresDemarches/routeUpdate')
      },
    },
  },

  async created() {
    await this.init()
  },

  unmounted() {
    this.$store.commit('titresDemarches/reset')
  },

  methods: {
    async init() {
      await this.$store.dispatch('titresDemarches/init', {
        travaux: this.travaux,
      })
    },

    async paramsUpdate(options) {
      options.params.travaux = this.travaux
      await this.$store.dispatch(`titresDemarches/paramsSet`, options)

      if (options.section === 'filtres') {
        this.eventTrack(options.params)
      }
    },

    eventTrack(params) {
      paramsEventTrack(params, this.definitions, this.$matomo, 'demarches', 'filtres')
    },
  },
}
</script>
