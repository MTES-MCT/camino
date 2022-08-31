<template>
  <div>
    <Loader v-if="!loaded" />
    <template v-else>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h4>{{ title }}</h4>
        </div>

        <div class="mb tablet-blob-2-3">
          <select
            :value="elementSelected?.id"
            class="p-s"
            @change="selectChange"
          >
            <option
              v-for="element in elements"
              :key="element.id"
              :value="element.id"
            >
              {{ labelGet(element) }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="elementSelected" class="mb-xl">
        <div
          v-if="rootComponent || definitionsTree.joinTable"
          class="rnd-s border p-m"
        >
          <div class="tablet-blobs">
            <div
              v-for="colonne of colonnesToEdit"
              :key="colonne.id"
              class="tablet-blob-1-2"
            >
              <div class="tablet-blobs mb-s">
                <div class="tablet-blob-1-3 tablet-pt-s pb-s">
                  <h5>
                    {{ colonne.nom }}
                  </h5>
                </div>
                <div class="tablet-blob-2-3">
                  {{ elementToEdit[colonne.id] || '' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-for="definitionChild of definitionsTree.definitions"
          :key="definitionChild.joinTable"
          class="pl-l"
        >
          <span class="separator" />
          <DefinitionEdit
            :definitionsTree="definitionChild"
            :foreignKeys="foreignKeysNew"
            :rootComponent="false"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import metasIndex from '@/store/metas-definitions'
import Loader from '@/components/_ui/loader.vue'

export default defineComponent({
  name: 'DefinitionEdit',
  components: {
    Loader
  },
  props: {
    definitionsTree: { type: Object, required: true },
    foreignKeys: { type: Object, default: () => ({}) },
    rootComponent: { type: Boolean, default: true }
  },
  data() {
    return {
      loaded: false
    }
  },
  computed: {
    title() {
      return (
        this.definition.colonnes.find(
          (colonne: any) => colonne.id === this.definitionsTree.foreignKey
        )?.nom || this.definition.nom
      )
    },
    elementSelected() {
      return this.$store.getters['meta/elementSelected'](
        this.definitionsTree.joinTable || this.definitionsTree.id
      )
    },
    definition() {
      return (metasIndex as any)[
        this.definitionsTree.joinTable
          ? this.definitionsTree.joinTable
          : this.definitionsTree.id
      ]
    },
    elements() {
      if (!this.definitionsTree.joinTable) {
        // si pas de table de jointure on peut directement charger les éléments
        return this.$store.getters['meta/elements'](this.definitionsTree.id)
      }
      // via une table de jointure
      const elementIdsFiltered = this.$store.getters['meta/elements'](
        this.definitionsTree.joinTable
      )
        // on garde les lignes en fonction des éléments déjà sélectionnés
        .filter((joinRow: any) =>
          Object.keys(this.foreignKeys).every(
            foreignKey => joinRow[foreignKey] === this.foreignKeys[foreignKey]
          )
        )
        .map((joinRow: any) => joinRow[this.definitionsTree.foreignKey])

      return (
        this.$store.getters['meta/elements'](this.definitionsTree.id)?.filter(
          ({ id }: any) => elementIdsFiltered.includes(id)
        ) || []
      )
    },

    colonnesToEdit() {
      return this.definition.colonnes
        .filter((colonne: any) => colonne.id !== 'id')
        .filter((colonne: any) => colonne.type !== 'entities')
    },

    elementToEdit() {
      if (!this.definitionsTree.joinTable) {
        return this.elementSelected
      }

      return this.$store.getters['meta/elements'](
        this.definitionsTree.joinTable
      ).find((joinRow: any) =>
        Object.keys(this.foreignKeysNew).every(
          foreignKey => joinRow[foreignKey] === this.foreignKeysNew[foreignKey]
        )
      )
    },

    foreignKeysNew(): Record<string, string> {
      return {
        ...this.foreignKeys,
        [this.definitionsTree.foreignKey]: this.elementSelected?.id
      }
    }
  },

  async created() {
    const promises = []
    promises.push(this.$store.dispatch('meta/get', this.definitionsTree.id))
    if (this.definitionsTree.joinTable) {
      promises.push(
        this.$store.dispatch('meta/get', this.definitionsTree.joinTable)
      )
    }
    await Promise.all(promises)
    this.loaded = true
  },

  async unmounted() {
    await this.elementSelect(null)
  },

  methods: {
    async selectChange(event: any) {
      const elementId = event.target.value
      const element = this.elements.find(
        ({ id }: { id: string }) => id === elementId
      )
      await this.elementSelect(element)
    },
    labelGet(element: any) {
      return (metasIndex as any)[this.definitionsTree.id].labelGet(element)
    },
    async elementSelect(element: any) {
      await this.$store.dispatch('meta/elementSelect', {
        id: this.definitionsTree.joinTable || this.definitionsTree.id,
        element
      })
    }
  }
})
</script>
