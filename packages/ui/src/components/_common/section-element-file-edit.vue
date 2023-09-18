<template>
  <div v-if="contenuElement" class="flex">
    <p class="mb-0 h6 bold">
      {{ contenuElement && contenuElement.name ? contenuElement.name : contenuElement.slice(5) }}
    </p>
    <div class="flex-right mt--xs">
      <ButtonIcon class="btn-border py-s px-m my--xs rnd-xs flex-right" :onClick="fileRemove" title="Supprimer le fichier" icon="delete" />
    </div>
  </div>
  <div v-else>
    <InputFile class="btn-border small p-s full-x rnd-xs mb-s" :accept="documents" :uploadFile="fileChange" />
    <p class="h5 italic">30 Mo max.</p>
  </div>
</template>

<script>
import { InputFile } from '../_ui/dsfr-input-file'
import { ButtonIcon } from '@/components/_ui/button-icon'

export default {
  components: { InputFile, ButtonIcon },

  props: {
    contenu: { type: [Object], required: true },
    elementId: { type: String, required: true },
  },
  data: function () {
    return {
      documents: ['pdf'],
    }
  },

  computed: {
    contenuElement() {
      return this.contenu[this.elementId]
    },
  },

  methods: {
    fileChange(file) {
      if (file) {
        this.contenu[this.elementId] = file
      }
    },
    fileRemove() {
      this.contenu[this.elementId] = null
    },
  },
}
</script>
