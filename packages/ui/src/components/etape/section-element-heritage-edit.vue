<template>
  <div class="mb-s">
    <slot v-if="!prop.actif" name="write" />
    <div v-else>
      <slot v-if="hasHeritage" name="read" :heritagePropEtape="prop.etape" />
      <div v-else class="border p-s mb-s">Non renseigné</div>
      <p class="h6 italic mb-s">
        Hérité de :
        <span class="cap-first">{{ prop.etape.type.nom }}</span> ({{ dateFormat(prop.etape.date) }})
      </p>
    </div>
    <slot />
    <button v-if="prop.etape" class="btn full-x rnd-xs py-s px-m small mb-s" @click="prop.actif = !prop.actif">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { hasValeurCheck } from '@/utils/contenu'
import { dateFormat } from '@/utils'
import { computed } from 'vue'
import { Etape, HeritageProp } from 'camino-common/src/etape'

// TODO 2022-11-14 surement à merger avec heritage-edit.vue
const props = defineProps<{
  prop: HeritageProp<Etape>
  propId: string
  sectionId: string
}>()

const buttonText = computed<string>(() => (props.prop.actif ? 'Modifier' : `Hériter de l'étape précédente`))

const hasHeritage = computed<boolean>(() => {
  const contenu = props.prop.etape && props.prop.etape.contenu && props.prop.etape.contenu[props.sectionId]

  return hasValeurCheck(props.propId, contenu)
})
</script>
