<template>
  <div>
    <div v-if="canCreate">
      <button
        class="btn small rnd-xs py-s px-m full-x flex mb"
        @click="demarcheAddPopupOpen"
      >
        <span class="mt-xxs"
          >Ajouter une démarche
          {{ tabId === 'travaux' ? 'de travaux' : '' }}</span
        >
        <Icon name="plus" size="M" class="flex-right" />
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
      :tabId="tabId"
      @event-track="eventTrack"
    />
  </div>
</template>

<script>
import TitreDemarche from './demarche.vue'
import { DemarcheEditPopup } from './demarche-edit-popup'
import { Icon } from '@/components/_ui/icon'
import {
  canCreateDemarche,
  canCreateTravaux
} from 'camino-common/src/permissions/titres-demarches'

export default {
  components: {
    Icon,
    TitreDemarche
  },

  props: {
    demarches: { type: Array, default: () => [] },
    tabId: { type: String, required: true },
    user: { type: Object, required: true }
  },

  emits: ['event-track'],

  computed: {
    titre() {
      return this.$store.state.titre.element
    },
    canCreate() {
      if (this.titre) {
        if (this.tabId === 'travaux') {
          return canCreateTravaux(
            this.user,
            this.titre.typeId,
            this.titre.administrations
          )
        } else {
          return canCreateDemarche(
            this.user,
            this.titre.typeId,
            this.titre.titreStatutId,
            this.titre.administrations
          )
        }
      }
      return false
    }
  },

  methods: {
    demarcheAddPopupOpen() {
      const demarche = {
        titreId: this.titre.id
      }

      this.$store.commit('popupOpen', {
        component: DemarcheEditPopup,
        props: {
          demarche,
          titreTypeId: this.titre.typeId,
          titreNom: this.titre.nom,
          tabId: this.tabId
        }
      })

      this.eventTrack({
        categorie: 'titre-sections',
        action: `titre-${this.tabId}_ajouter`,
        nom: this.$route.params.id
      })
    },

    eventTrack(event) {
      this.$emit('event-track', event)
    }
  }
}
</script>
