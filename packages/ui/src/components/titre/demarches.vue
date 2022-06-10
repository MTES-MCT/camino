<template>
  <div>
    <div
      v-if="
        tabId === 'travaux' ? titre.travauxCreation : titre.demarchesCreation
      "
    >
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
      :domaineId="titre.domaine.id"
      :titreType="titre.type"
      :titreNom="titre.nom"
      :titreId="titre.id"
      :tabId="tabId"
      @event-track="eventTrack"
    />
  </div>
</template>

<script>
import TitreDemarche from './demarche.vue'
import EditPopup from './demarche-edit-popup.vue'
import Icon from '@/components/_ui/icon.vue'

export default {
  components: {
    Icon,
    TitreDemarche
  },

  props: {
    demarches: { type: Array, default: () => [] },
    tabId: { type: String, required: true }
  },

  emits: ['event-track'],

  computed: {
    titre() {
      return this.$store.state.titre.element
    }
  },

  methods: {
    demarcheAddPopupOpen() {
      const demarche = {
        typeId: null,
        titreId: this.titre.id
      }

      this.$store.commit('popupOpen', {
        component: EditPopup,
        props: {
          demarche,
          titreTypeNom: this.titre.type.type.nom,
          titreNom: this.titre.nom,
          creation: true,
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
