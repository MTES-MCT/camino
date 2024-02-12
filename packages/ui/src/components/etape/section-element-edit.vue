<template>
  <div>
    <div class="tablet-blobs">
      <div v-if="element.nom" class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5 class="mb-0">
          <span class="cap-first">{{ element.nom }}</span>
        </h5>
        <p v-if="element.optionnel" class="h6 italic mb-0">Optionnel</p>
      </div>

      <SectionElementHeritageEdit
        v-model:prop="heritage[element.id]"
        class="mb"
        :class="{
          'tablet-blob-2-3': element.nom,
          'tablet-blob-1': !element.nom,
        }"
        :propId="element.id"
        :sectionId="sectionId"
        :isArray="element.type === 'checkboxes'"
      >
        <template #write>
          <SectionElementEdit :contenu="contenu" class="mb-s" :element="element" @update:contenu="newValue => $emit('update:contenu', newValue)" />
        </template>
        <template #read>
          <p class="pt-s py-xs mb-0">
            {{ valeur }}
          </p>
        </template>

        <!-- eslint-disable vue/no-v-html -->
        <p v-if="element.description" class="h6" v-html="element.description" />
      </SectionElementHeritageEdit>
    </div>
  </div>
</template>

<script>
import { valeurFind, hasValeurCheck } from '@/utils/contenu'
import SectionElementEdit from '../_common/section-element-input-edit.vue'
import SectionElementHeritageEdit from './section-element-heritage-edit.vue'

export default {
  components: {
    SectionElementEdit,
    SectionElementHeritageEdit,
  },

  props: {
    contenu: { type: Object, required: true },
    element: { type: Object, required: true },
    heritage: { type: Object, required: true },
    sectionId: { type: String, required: true },
  },
  emits: ['update:contenu'],

  computed: {
    hasValeur() {
      return hasValeurCheck(this.element.id, this.contenu)
    },

    valeur() {
      return valeurFind(this.element, this.heritage[this.element.id].etape.contenu[this.sectionId])
    },
  },
}
</script>
