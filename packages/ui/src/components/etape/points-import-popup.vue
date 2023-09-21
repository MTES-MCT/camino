<template>
  <Popup :messages="messages">
    <template #header>
      <h2>Import d'un périmètre</h2>
    </template>

    <div class="tablet-blobs mb-m">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5 class="mb-0">Système géographique</h5>
      </div>
      <div class="tablet-blob-2-3">
        <select v-model="geoSystemeId" class="p-s">
          <option v-for="geoSysteme in geoSystemes" :key="geoSysteme.id" :value="geoSysteme.id">{{ geoSysteme.nom }} ({{ geoSysteme.id }})</option>
        </select>
      </div>
    </div>

    <div v-if="geoSystemeId" class="dsfr">
      <InputFile class="btn-border small bg-alt p-s full-x rnd-xs mb-s" :accept="documents" :uploadFile="fileChange" />
    </div>
    <template #footer>
      <div v-if="!loading" class="tablet-blobs">
        <div class="tablet-blob-1-3 mb tablet-mb-0 flex-right">
          <button class="btn-border rnd-xs p-s full-x" @click="cancel">Annuler</button>
        </div>
      </div>
      <div v-else class="p-s full-x bold">Dépôt en cours…</div>
    </template>
  </Popup>
</template>

<script>
import { InputFile } from '../_ui/dsfr-input-file'
import Popup from '../_ui/popup.vue'
import { sortedGeoSystemes } from 'camino-common/src/static/geoSystemes'

export default {
  components: {
    Popup,
    InputFile,
  },

  data: function () {
    return {
      geoSystemeId: null,
      documents: ['geojson', 'shp'],
    }
  },

  computed: {
    loading() {
      return this.$store.state.popup.loading
    },

    messages() {
      return this.$store.state.popup.messages
    },

    geoSystemes() {
      return sortedGeoSystemes
    },
  },

  created() {
    document.addEventListener('keyup', this.keyup)
  },

  beforeUnmount() {
    document.removeEventListener('keyup', this.keyup)
  },

  methods: {
    async fileChange(file) {
      await this.$store.dispatch('titreEtapeEdition/pointsImport', {
        file,
        geoSystemeId: this.geoSystemeId,
      })
    },

    cancel() {
      this.$store.commit('popupMessagesRemove')
      this.$store.commit('popupClose')
    },

    keyup(e) {
      if ((e.which || e.keyCode) === 27) {
        this.cancel()
      }
    },
  },
}
</script>
