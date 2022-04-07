<template>
  <div>
    <MapPattern
      v-if="definition.id === 'tty'"
      :domainesIds="['h']"
      :typesIds="entrees.map(t => t.id)"
    />
    <h2>{{ definition.nom }}</h2>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-if="definition.description" v-html="descriptionHtml" />
    <div v-if="entrees && entrees.length">
      <DefinitionEntree
        v-for="entree in entrees"
        :id="definition.id"
        :key="entree.id"
        :entree="entree"
      />
    </div>
  </div>
</template>

<script>
import snarkdown from 'snarkdown'
import DefinitionEntree from './definition-entree.vue'
import MapPattern from '../_map/pattern.vue'

// TODO 2022-03-25: disconnect from store
export default {
  name: 'Definition',

  components: { DefinitionEntree, MapPattern },

  props: {
    definition: { type: Object, required: true },
    slug: { type: String, required: true }
  },

  computed: {
    entrees() {
      return this.$store.state.definitions.entrees
    },

    descriptionHtml() {
      return snarkdown(this.definition.description)
    }
  },

  watch: {
    slug: 'entreesGet'
  },

  async created() {
    await this.entreesGet()
  },

  methods: {
    async entreesGet() {
      await this.$store.dispatch('definitions/entreesGet', this.slug)
    }
  }
}
</script>
