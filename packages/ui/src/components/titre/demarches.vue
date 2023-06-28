<template>
  <div>
    <div v-if="canCreate">
      <button class="btn small rnd-xs py-s px-m full-x flex mb" :title="demarcheAddText" :aria-label="demarcheAddText" @click="demarcheAddPopupOpen">
        <span class="mt-xxs">{{ demarcheAddText }}</span>
        <Icon name="plus" size="M" class="flex-right" :aria-hidden="true" />
      </button>
      <div class="line width-full mb-xxl" />
    </div>

    <TitreDemarche
      v-for="demarche in demarches"
      :key="demarche.id"
      :demarche="demarche"
      :titreTypeId="titre.typeId"
      :titreNom="titre.nom"
      :titreId="titre.id"
      :titreStatutId="titre.titreStatutId"
      :titreAdministrations="titre.administrations"
      :tabId="tabId"
      :user="user"
      @event-track="eventTrack"
    />
    <DemarcheEditPopup v-if="open" :close="() => (open = !open)" :demarche="myDemarche" :apiClient="apiClient" :titreTypeId="titre.typeId" :titreNom="titre.nom" :tabId="tabId" />
  </div>
</template>

<script>
import TitreDemarche from './demarche.vue'
import { DemarcheEditPopup } from './demarche-edit-popup'
import { Icon } from '@/components/_ui/icon'
import { demarcheApiClient } from './demarche-api-client'

import { canCreateDemarche, canCreateTravaux } from 'camino-common/src/permissions/titres-demarches'

export default {
  components: {
    Icon,
    TitreDemarche,
    DemarcheEditPopup,
  },

  props: {
    demarches: { type: Array, default: () => [] },
    tabId: { type: String, required: true },
    user: { type: Object, required: true },
  },

  emits: ['event-track'],
  data: () => {
    return { open: false }
  },
  computed: {
    demarcheAddText() {
      return `Ajouter une démarche ${this.tabId === 'travaux' ? 'de travaux' : ''}`
    },
    titre() {
      return this.$store.state.titre.element
    },
    apiClient() {
      return demarcheApiClient
    },
    myDemarche() {
      const demarche = {}

      demarche.titreId = this.titre.id

      return demarche
    },
    canCreate() {
      if (this.titre) {
        if (this.tabId === 'travaux') {
          return canCreateTravaux(this.user, this.titre.typeId, this.titre.administrations)
        } else {
          return canCreateDemarche(this.user, this.titre.typeId, this.titre.titreStatutId, this.titre.administrations)
        }
      }
      return false
    },
  },

  methods: {
    demarcheAddPopupOpen() {
      this.open = !this.open

      this.eventTrack({
        categorie: 'titre-sections',
        action: `titre-${this.tabId}_ajouter`,
        nom: this.$route.params.id,
      })
    },

    eventTrack(event) {
      this.$emit('event-track', event)
    },
  },
}
</script>
