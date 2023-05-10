<template>
  <Liste nom="entreprises" :filtres="filtres" :colonnes="colonnes" :lignes="lignes" :elements="entreprises" :params="params" :total="total" :initialized="initialized" @params-update="paramsUpdate">
    <template v-if="canCreateEntreprise" #addButton>
      <button class="btn small rnd-xs py-s px-m full-x flex mb-s" @click="addPopupOpen">
        <span class="mt-xxs">Ajouter une entreprise</span>
        <Icon name="plus" size="M" class="flex-right" />
      </button>
      <EntrepriseAddPopup v-if="popupVisible" :close="close" :user="user" :apiClient="customApiClient()" />
    </template>

    <template v-if="entreprises.length" #downloads>
      <Downloads :formats="['csv', 'xlsx', 'ods']" :downloadRoute="downloadEnterprises" :params="downloadParams" class="flex-right full-x" />
    </template>
  </Liste>
</template>

<script>
import Liste from './_common/liste.vue'
import { Downloads } from './_common/downloads'
import { EntrepriseAddPopup } from './entreprise/add-popup'

import filtres from './entreprises/filtres'
import { entreprisesColonnes, entreprisesLignesBuild } from './entreprises/table'
import { Icon } from './_ui/icon'
import { entrepriseApiClient } from './entreprise/entreprise-api-client'
import { canCreateEntreprise } from 'camino-common/src/permissions/utilisateurs'
import { CaminoRestRoutes } from 'camino-common/src/rest'

export default {
  name: 'Entreprises',

  components: { Icon, Liste, Downloads, EntrepriseAddPopup },

  data() {
    return {
      filtres,
      colonnes: entreprisesColonnes,
      popupVisible: false,
      downloadEnterprises: CaminoRestRoutes.downloadEntreprises,
      downloadParams: {},
    }
  },

  computed: {
    user() {
      return this.$store.state.user.element
    },

    canCreateEntreprise() {
      return canCreateEntreprise(this.user)
    },

    entreprises() {
      return this.$store.state.entreprises.elements
    },

    total() {
      return this.$store.state.entreprises.total
    },

    params() {
      return this.$store.state.entreprises.params
    },

    lignes() {
      return entreprisesLignesBuild(this.entreprises)
    },

    initialized() {
      return this.$store.state.entreprises.initialized
    },
  },

  watch: {
    '$route.query': {
      handler: function () {
        this.$store.dispatch('entreprises/routeUpdate')
      },
    },
  },

  async created() {
    await this.init()
  },

  unmounted() {
    this.$store.commit('entreprises/reset')
  },

  methods: {
    async init() {
      await this.$store.dispatch('entreprises/init')
    },

    async paramsUpdate(options) {
      await this.$store.dispatch(`entreprises/paramsSet`, options)
    },

    addPopupOpen() {
      this.popupVisible = true
    },
    close() {
      this.popupVisible = !this.popupVisible
    },
    customApiClient() {
      return {
        creerEntreprise: async siren => {
          try {
            await entrepriseApiClient.creerEntreprise(siren)
            this.$store.dispatch('messageAdd', { value: `l'entreprise a été créée`, type: 'success' }, { root: true })
            this.$router.push({ name: 'entreprise', params: { id: `fr-${siren}` } })
          } catch (e) {
            this.$store.dispatch('messageAdd', { value: `erreur lors de la création de l'entreprise`, type: 'error' }, { root: true })
          }
        },
      }
    },
  },
}
</script>
