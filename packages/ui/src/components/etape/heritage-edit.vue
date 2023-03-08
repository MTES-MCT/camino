<template>
  <div class="mb-s">
    <slot v-if="!prop.actif" name="write" />
    <div v-else>
      <slot v-if="hasHeritage" name="read" :heritagePropEtape="prop.etape" />
      <div v-else class="border p-s mb-s">Non renseigné</div>
      <div class="mb-s">
        <Tag v-if="prop.etape.incertitudes && prop.etape.incertitudes[props.propId]" :mini="true" color="bg-info" text="Incertain" />
      </div>
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

<script setup lang="ts" generic="P extends EtapeHeritageProps, T extends EtapeHeritage">
// TODO 2022-11-16 normalement T devrait étendre EtapeHeritage<P>, mais il y a un bug avec vite qui empêche de lancer l'appli en mode dev
import { hasValeurCheck } from '@/utils/contenu'
import { Tag } from '@/components/_ui/tag'
import { dateFormat } from '@/utils'
import { computed } from 'vue'
import { HeritageProp } from 'camino-common/src/etape'
import { EtapeHeritageProps, EtapeHeritage } from './heritage-edit.types'

const props = defineProps<{
  prop: HeritageProp<T>
  propId: P
}>()

const buttonText = computed<string>(() => (props.prop.actif ? 'Modifier' : `Hériter de l'étape précédente`))

const hasHeritage = computed<boolean>(() => {
  return hasValeurCheck(props.propId, props.prop.etape)
})
</script>
