<template>
  <div class="mb">
    <h5>{{ filter.name }}</h5>
    <hr class="mb-s" />

    <div v-for="(value, n) in filter.value" :key="n">
      <div class="flex mb-s">
        <select v-model="filter.value[n]" class="p-s mr-s">
          <option
            v-for="element in filter.elements"
            :key="element.id"
            :value="element.id"
            :disabled="filter.value.includes(element.id)"
          >
            {{ element[filter.elementName] }}
          </option>
        </select>

        <button class="btn py-s px-m rnd-xs" @click="valueRemove(n)">
          <Icon name="minus" size="M" />
        </button>
      </div>
    </div>
    <button
      v-if="!filter.value || !filter.value.some(v => v === '')"
      class="btn small rnd-xs py-s px-m full-x flex mb-s"
      @click="valueAdd"
    >
      <span class="mt-xxs">{{ filter.buttonAdd }}</span>
      <Icon name="plus" size="M" class="flex-right" />
    </button>
  </div>
</template>

<script>
import { Icon } from '@/components/_ui/icon'
export default {
  components: { Icon },
  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    valueAdd() {
      this.filter.value.push('')
    },

    valueRemove(n) {
      this.filter.value.splice(n, 1)
    }
  }
}
</script>
