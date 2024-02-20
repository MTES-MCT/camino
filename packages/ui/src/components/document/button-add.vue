<template>
  <button class="flex small mt-s" title="Ajouter un document" aria-label="Ajouter un document" @click="addPopupOpen">
    <span v-if="large" class="mt-xxs mr-s">Ajouter un document</span>
    <Icon size="M" name="file-add" class="flex-right" aria-hidden="true" />
  </button>
</template>

<script>
import DocumentEditPopup from './edit-popup.vue'
import { Icon } from '@/components/_ui/icon'

export default {
  components: { Icon },
  props: {
    route: { type: Object, default: null },
    action: { type: Object, default: null },
    document: { type: Object, required: true },
    title: { type: String, required: true },
    large: { type: Boolean, default: false },
    documentsTypes: { type: Array, required: true },
  },

  methods: {
    addPopupOpen() {
      this.$store.commit('popupOpen', {
        component: DocumentEditPopup,
        props: {
          document: this.document,
          action: this.action,
          route: this.route,
          title: this.title,
          documentsTypes: this.documentsTypes,
        },
      })
    },
  },
}
</script>
