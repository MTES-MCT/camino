<template>
  <div class="tablet-blobs">
    <div v-if="element.nom" class="tablet-blob-1-4">
      <h5>{{ element.nom }}</h5>
    </div>

    <div
      :class="{ 'tablet-blob-3-4': element.nom, 'tablet-blob-1': !element.nom }"
    >
      <div v-if="element.type === 'file'" class="flex h6 pb-xs">
        <span class="mt-xs flex bold">
          <Icon size="S" name="file" class="mr-xs" />
          {{
            contenu[element.id] ? contenu[element.id].slice(5) : 'Aucun fichier'
          }}
        </span>

        <button
          v-if="contenu[element.id]"
          class="btn-border py-xs px-s rnd-xs flex-right mt--xs"
          @click="fileDownload(contenu[element.id])"
        >
          <Icon size="M" name="download" />
        </button>
      </div>

      <SectionElementMultiple
        v-else-if="element.type === 'multiple'"
        :contenu="contenu[element.id]"
        :element="element"
        @file-download="fileDownload"
      />

      <p v-else class="cap-first" :class="{ 'mb-s': element.description }">
        {{ valeur }}
        <span
          v-if="element.id === 'volumeGranulatsExtrait' && contenu[element.id]"
        >
          m3. Soit l’équivalent de {{ masseGranulatsExtraitValeur }} tonnes.
        </span>
      </p>
      <!-- eslint-disable vue/no-v-html -->
      <p v-if="element.description" class="h6">
        <span v-html="element.description" />
      </p>
    </div>
  </div>
</template>

<script>
import { valeurFind } from '../../utils/contenu'
import SectionElementMultiple from './section-element-multiple.vue'
import numberFormat from '@/utils/number-format'
import Icon from '@/components/_ui/icon.vue'

export default {
  name: 'SectionElement',
  components: { Icon, SectionElementMultiple },
  props: {
    element: { type: Object, required: true },
    contenu: { type: Object, required: true }
  },
  emits: ['file-download'],

  computed: {
    valeur() {
      return valeurFind(this.element, this.contenu)
    },

    masseGranulatsExtraitValeur() {
      return numberFormat(this.contenu[this.element.id] * 1.5)
    }
  },

  methods: {
    fileDownload(fichier) {
      this.$emit('file-download', fichier)
    }
  }
}
</script>
