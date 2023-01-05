<template>
  <div class="flex">
    <button
      class="cmn-activite-btn-remplir btn small flex py-s px-m rnd-0 mr-px"
      :class="{
        'btn-primary': activite.activiteStatutId !== 'enc' && buttonText
      }"
      @click="activiteEditPopupOpen"
    >
      <div v-if="buttonText" class="my-xxs">
        {{ buttonText }}
      </div>
      <Icon v-else size="M" name="pencil" />
    </button>
    <button
      v-if="activite.activiteStatutId === 'enc'"
      class="cmn-activite-btn-depose btn btn-primary small flex rnd-0"
      :disabled="!activite.deposable"
      :class="{ disabled: !activite.deposable }"
      @click="activiteDepotPopupOpen"
    >
      <span class="mt-xxs mb-xxs">Déposer…</span>
    </button>
  </div>
</template>

<script>
import DeposePopup from './depose-popup.vue'
import { Icon } from '@/components/_ui/icon'

export default {
  components: { Icon },
  props: {
    activite: { type: Object, default: () => ({}) }
  },

  computed: {
    buttonText() {
      if (this.activite.deposable || this.activite.activiteStatutId === 'dep') {
        return null
      }
      return this.activite.activiteStatutId === 'abs'
        ? 'Remplir…'
        : 'Compléter…'
    }
  },

  methods: {
    activiteDepotPopupOpen() {
      this.$store.commit('popupOpen', {
        component: DeposePopup,
        props: {
          activite: this.activite,
          onDepotDone: () =>
            this.$store.dispatch(`titreActivite/get`, this.activite.id)
        }
      })

      this.eventTrack({
        categorie: 'titre-activite',
        action: 'titre-activite_depot',
        nom: this.$route.params.id
      })
    },

    eventTrack(event) {
      if (this.$matomo) {
        this.$matomo.trackEvent(event.categorie, event.action, event.nom)
      }
    },

    activiteEditPopupOpen() {
      this.$router.push({
        name: 'activite-edition',
        params: { id: this.activite.slug }
      })
    }
  }
}
</script>
