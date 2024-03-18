<template>
  <Popup :messages="messages">
    <template #header>
      <div>
        <h6>
          <span class="cap-first">
            {{ title }}
          </span>
        </h6>
        <h2 class="cap-first">{{ document.id ? 'Modification du' : "Ajout d'un" }} document</h2>
      </div>
    </template>

    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Type</h5>
      </div>
      <div class="mb tablet-blob-2-3">
        <select v-if="!document.id" v-model="document.typeId" class="p-s">
          <option v-for="dt in types" :key="dt.id" :value="dt.id" :disabled="document.typeId === dt.id">
            {{ dt.nom }}
          </option>
        </select>
        <div v-else-if="documentType" class="p-s">
          {{ documentType.nom }}
        </div>
      </div>
    </div>

    <hr />

    <SectionsEdit :document="document" :user="user" @update:document="newValue => emits('update:document', newValue)" />

    <template #footer>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 mb tablet-mb-0">
          <button v-if="!loading" class="btn-border rnd-xs p-s full-x" @click="cancel">Annuler</button>
        </div>
        <div class="tablet-blob-2-3">
          <button v-if="!loading" ref="save-button" class="btn btn-primary" :disabled="!complete" @click="save">Enregistrer</button>

          <div v-else class="p-s full-x bold">Enregistrement en cours…</div>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script>
import Popup from '../_ui/popup.vue'
import SectionsEdit from './sections-edit.vue'

export default {
  name: 'CaminoDocumentEditPopup',

  components: {
    Popup,
    SectionsEdit,
  },

  props: {
    title: { type: String, required: true },
    route: { type: Object, default: null },
    action: { type: Object, default: null },
    document: { type: Object, required: true },
    documentsTypes: { type: Array, required: true },
    user: { type: Object, required: true },
  },

  emits: ['update:document'],

  computed: {
    loading() {
      return this.$store.state.popup.loading
    },

    complete() {
      return this.document.typeId && this.document.date && (this.document.fichier || this.document.fichierNouveau)
    },

    messages() {
      console.log('this.$store.state.popup.messages', this.$store.state.popup.messages)
      return this.$store.state.popup.messages
    },

    types() {
      return this.documentsTypes
    },

    documentType() {
      return this.types && this.types.find(d => d.id === this.document.typeId)
    },
  },

  async created() {
    document.addEventListener('keyup', this.keyUp)
  },

  beforeUnmount() {
    document.removeEventListener('keyup', this.keyUp)
  },

  methods: {
    async save() {
      await this.$store.dispatch('document/upsert', {
        document: this.document,
        route: this.route,
        action: this.action,
      })
    },

    cancel() {
      this.errorsRemove()
      this.$store.commit('popupClose')
    },

    keyUp(e) {
      if (!this.loading) {
        if ((e.which || e.keyCode) === 27) {
          this.cancel()
        } else if ((e.which || e.keyCode) === 13 && this.complete) {
          this.$refs['save-button'].focus()
          this.save()
        }
      }
    },

    errorsRemove() {},
  },
}
</script>
