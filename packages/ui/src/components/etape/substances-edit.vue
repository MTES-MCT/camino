<template>
  <h3 class="mb-s">Substances</h3>
  <HeritageEdit
    v-model:prop="heritageProps.substances"
    propId="substances"
    :isArray="true"
  >
    <template #write>
      <div
        v-for="(substance, n) in substances.sort((a, b) => a.ordre - b.ordre)"
        :key="n"
      >
        <div class="flex mb-s">
          <select v-model="substances[n]" class="p-s mr-s">
            <option
              v-for="s in substancesByDomaine"
              :key="s.substanceId"
              :value="{ substanceId: s.id, ordre: substance.ordre }"
              :disabled="
                substances.find(({ substanceId }) => substanceId === s.id)
              "
            >
              {{ s.nom }}
            </option>
          </select>
          <button
            v-if="substancesLength && n + 1 < substancesLength"
            class="btn-border py-s px-m rnd-l-xs"
            @click="substanceMoveDown(n)"
          >
            <Icon size="M" name="move-down" />
          </button>
          <button
            v-if="substancesLength && n > 0 && substances[n].substanceId"
            :class="{
              'rnd-l-xs': !(substancesLength && n + 1 < substancesLength)
            }"
            class="btn-border py-s px-m"
            @click="substanceMoveUp(n)"
          >
            <Icon size="M" name="move-up" />
          </button>
          <button
            :class="{
              'rnd-l-xs': !substances[n].substanceId || substancesLength === 1
            }"
            class="btn py-s px-m rnd-r-xs"
            @click="substanceRemove(n)"
          >
            <Icon name="minus" size="M" />
          </button>
        </div>
      </div>

      <button
        v-if="!substances.some(({ substanceId }) => substanceId === '')"
        class="btn small rnd-xs py-s px-m full-x flex mb-s"
        @click="substanceAdd"
      >
        <span class="mt-xxs">Ajouter une substance</span>
        <Icon name="plus" size="M" class="flex-right" />
      </button>

      <div v-if="substancesLength" class="h6">
        <label>
          <input
            v-model="incertitudes.substances"
            type="checkbox"
            class="mr-xs"
          />
          Incertain
        </label>
      </div>
    </template>

    <template #read>
      <TagList
        class="mb-s"
        :elements="
          heritageProps.substances.etape.substances.map(
            ({ substanceId }) => SubstancesLegale[substanceId].nom
          )
        "
      />
    </template>
  </HeritageEdit>
</template>
<script setup lang="ts">
import {
  SubstancesLegales,
  SubstancesLegale
} from 'camino-common/src/static/substancesLegales'
import { computed } from 'vue'
import HeritageEdit from '@/components/etape/heritage-edit.vue'
import TagList from '@/components/_ui/tag-list.vue'
import Icon from '@/components/_ui/icon.vue'
import { DomaineId } from 'camino-common/src/static/domaines'
import { HeritageProp, Substance } from '@/components/etape/heritage-edit.types'

const props = defineProps<{
  substances: Substance[]
  heritageProps: { substances: HeritageProp }
  incertitudes: { substances: boolean }
  domaineId: DomaineId
}>()

const substancesLength = computed(
  () => props.substances.filter(({ substanceId }) => substanceId).length
)

const substancesByDomaine = computed(() =>
  SubstancesLegales.filter(({ domaineIds }) =>
    domaineIds.includes(props.domaineId)
  )
)

const substanceAdd = () => {
  props.substances.push({
    substanceId: undefined,
    ordre: props.substances.length
  })
}

const substanceRemove = (index: number) => {
  props.substances.splice(index, 1)
  props.substances.forEach((s, index) => {
    s.ordre = index
  })
}

const substanceMoveDown = (index: number) => {
  props.substances[index].ordre = props.substances[index].ordre + 1
  props.substances[index + 1].ordre = props.substances[index + 1].ordre - 1
}

const substanceMoveUp = (index: number) => {
  props.substances[index].ordre = props.substances[index].ordre - 1
  props.substances[index - 1].ordre = props.substances[index - 1].ordre + 1
}
</script>
