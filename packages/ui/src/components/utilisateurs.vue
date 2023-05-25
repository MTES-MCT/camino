<template>
  <liste
    v-if="visible"
    nom="utilisateurs"
    :filtres="filtres"
    :colonnes="colonnes"
    :lignes="lignes"
    :elements="utilisateurs"
    :metas="metas"
    :params="params"
    :total="total"
    :initialized="initialized"
    @params-update="paramsUpdate"
  >
    <template v-if="utilisateurs.length" #downloads>
      <Downloads :formats="['csv', 'xlsx', 'ods']" downloadRoute="/utilisateurs" :params="downloadParams" class="flex-right full-x" />
    </template>
  </liste>
</template>

<script>
import Liste from './_common/liste.vue'
import { Downloads } from './_common/downloads'

import filtres from './utilisateurs/filtres'
import { utilisateursColonnes, utilisateursLignesBuild } from './utilisateurs/table'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'

export default {
  name: 'Utilisateurs',

  components: { Liste, Downloads },

  data() {
    return {
      filtres,
      colonnes: utilisateursColonnes,
      visible: false,
      downloadParams: {},
    }
  },

  computed: {
    user() {
      return this.$store.state.user.element
    },

    utilisateurs() {
      return this.$store.state.utilisateurs.elements
    },

    total() {
      return this.$store.state.utilisateurs.total
    },

    metas() {
      return {
        ...this.$store.state.utilisateurs.metas,
      }
    },

    params() {
      return this.$store.state.utilisateurs.params
    },

    lignes() {
      return utilisateursLignesBuild(this.utilisateurs)
    },

    initialized() {
      return this.$store.state.utilisateurs.initialized
    },
  },

  watch: {
    user: 'init',

    '$route.query': {
      handler: function () {
        this.$store.dispatch('utilisateurs/routeUpdate')
      },
    },
  },

  async created() {
    await this.init()
  },

  unmounted() {
    this.$store.commit('utilisateurs/reset')
  },

  methods: {
    async init() {
      if (!canReadUtilisateurs(this.user)) {
        await this.$store.dispatch('pageError')
      } else {
        this.visible = true
        await this.$store.dispatch('utilisateurs/init')
      }
    },

    async paramsUpdate(options) {
      await this.$store.dispatch(`utilisateurs/paramsSet`, options)
    },
  },
}
</script>
