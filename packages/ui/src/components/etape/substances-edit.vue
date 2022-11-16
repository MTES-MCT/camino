<template>
  <div>
    <h3 class="mb-s">Substances</h3>
    <HeritageEdit v-model:prop="heritageProps.substances" propId="substances">
      <template #write>
        <div v-for="(_substance, n) in substances" :key="n">
          <div class="flex mb-s">
            <select v-model="substances[n]" class="p-s mr-s">
              <option
                v-for="s in substancesByDomaine"
                :key="s.id"
                :value="s.id"
                :disabled="substances.some(substanceId => substanceId === s.id)"
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
              v-if="substancesLength && n > 0 && substances[n]"
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
                'rnd-l-xs': !substances[n] || substancesLength === 1
              }"
              class="btn py-s px-m rnd-r-xs"
              @click="substanceRemove(n)"
            >
              <Icon name="minus" size="M" />
            </button>
          </div>
        </div>

        <button
          v-if="substances?.every(substanceId => !!substanceId)"
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
        <TagList class="mb-s" :elements="substanceNoms" />
      </template>
    </HeritageEdit>
  </div>
</template>
<script setup lang="ts">
import {
  SubstancesLegales,
  SubstancesLegale,
  SubstanceLegaleId
} from 'camino-common/src/static/substancesLegales'
import { computed } from 'vue'
import HeritageEdit from '@/components/etape/heritage-edit.vue'
import TagList from '@/components/_ui/tag-list.vue'
import Icon from '@/components/_ui/icon.vue'
import { DomaineId } from 'camino-common/src/static/domaines'
import {
  EtapeFondamentale,
  EtapeWithIncertitudesAndHeritage
} from 'camino-common/src/etape'

export type Props = {
  substances: (SubstanceLegaleId | undefined)[]
  heritageProps: EtapeWithIncertitudesAndHeritage<
    Pick<EtapeFondamentale, 'substances' | 'type' | 'date'>
  >['heritageProps']
  incertitudes: { substances: boolean }
  domaineId: DomaineId
}
const props = defineProps<Props>()

const substancesLength = computed(
  () => props.substances?.filter(substanceId => substanceId).length
)

const substancesByDomaine = computed(() =>
  SubstancesLegales.filter(({ domaineIds }) =>
    domaineIds.includes(props.domaineId)
  ).sort((a, b) => a.nom.localeCompare(b.nom))
)

const substanceNoms = computed<string[]>(() => {
  return (
    props.heritageProps.substances.etape?.substances
      .filter((substanceId): substanceId is SubstanceLegaleId => !!substanceId)
      .map(substanceId => SubstancesLegale[substanceId].nom) || []
  )
})

const substanceAdd = () => {
  props.substances.push(undefined)
}

const substanceRemove = (index: number): SubstanceLegaleId | undefined => {
  return props.substances.splice(index, 1)[0]
}

const substanceMoveDown = (index: number) => {
  const substance = substanceRemove(index)
  props.substances.splice(index + 1, 0, substance)
}

const substanceMoveUp = (index: number) => {
  const substance = substanceRemove(index)
  props.substances.splice(index - 1, 0, substance)
}
</script>
