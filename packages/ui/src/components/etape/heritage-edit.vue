<template>
  <div class="mb-s">
    <slot v-if="!prop.actif" name="write" />
    <div v-else>
      <slot v-if="hasHeritage" name="read" :heritagePropEtape="prop.etape" />
      <div v-else class="border p-s mb-s">Non renseigné</div>
      <div class="mb-s">
        <Tag
          v-if="prop.etape.incertitudes && prop.etape.incertitudes[propId]"
          :mini="true"
          color="bg-info"
          >Incertain
        </Tag>
      </div>
      <p class="h6 italic mb-s">
        Hérité de :
        <span class="cap-first">{{ prop.etape.type.nom }}</span> ({{
          dateFormat(prop.etape.date)
        }})
      </p>
    </div>
    <slot />
    <button
      v-if="prop.etape"
      class="btn full-x rnd-xs py-s px-m small mb-s"
      @click="prop.actif = !prop.actif"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { hasValeurCheck } from '@/utils/contenu'
import Tag from '@/components/_ui/tag.vue'
import { dateFormat } from '@/utils'
import { computed, withDefaults } from 'vue'
import { Etape, HeritageProp } from 'camino-common/src/etape'

const props = withDefaults(
  defineProps<{
    prop: HeritageProp
    propId: keyof Etape['incertitudes']
    isArray?: boolean
    sectionId?: string
  }>(),
  { isArray: false, sectionId: undefined }
)

const buttonText = computed<string>(() =>
  props.prop.actif ? 'Modifier' : `Hériter de l'étape précédente`
)

const hasHeritage = computed<boolean>(() => {
  let contenu

  if (props.sectionId) {
    contenu =
      props.prop.etape &&
      props.prop.etape.contenu &&
      props.prop.etape.contenu[props.sectionId]
  } else {
    contenu = props.prop.etape
  }

  return hasValeurCheck(props.propId, contenu)
})
</script>
