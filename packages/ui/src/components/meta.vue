<template>
  <Loader v-if="!loaded" />
  <div v-else>
    <router-link :to="{ name: 'metas' }">
      <h5>Métas</h5>
    </router-link>
    <h1>
      <span class="cap-first">{{ definition.nom }}</span>
    </h1>

    <div class="line-neutral width-full" />

    <div class="mb-xxl width-full-p">
      <div>
        <div class="overflow-scroll-x mb">
          <table>
            <tr>
              <th v-for="colonne in definition.colonnes" :key="colonne.id" class="min-width-5" :class="colonne.class">
                {{ colonne.nom }}
              </th>
            </tr>

            <tr v-for="element in elements" :key="elementKeyFind(element)">
              <td v-for="colonne in definition.colonnes" :key="colonne.id">
                <div>{{ element[colonne.id] }}</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from './_ui/loader.vue'
import metasIndex from '../store/metas-definitions'
import { canReadMetas } from 'camino-common/src/permissions/metas'

export default {
  components: {
    Loader,
  },

  data() {
    return {
      elementNew: {},
    }
  },

  computed: {
    id() {
      return this.$route.params.id
    },

    elements() {
      return this.$store.getters['meta/elements'](this.id)
    },

    definition() {
      return metasIndex[this.id]
    },

    entities() {
      return this.$store.state.meta.elementsIndex
    },

    user() {
      return this.$store.state.user.element
    },

    loaded() {
      return !!this.elements
    },

    elementNewComplete() {
      return this.definition.colonnes.every(c => !!this.elementNew[c.id] || c.optional)
    },
  },

  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'meta' && id) {
        this.get()
      }
    },

    user: 'get',
  },

  created() {
    this.get()
  },

  beforeUnmount() {
    this.$store.commit('meta/reset')
  },

  methods: {
    async get() {
      if (!canReadMetas(this.user)) {
        await this.$store.dispatch('pageError')
      } else {
        await this.$store.dispatch('meta/get', this.id)
      }
    },

    elementKeyFind(element) {
      if (!this.definition.ids) return element.id

      return this.definition.ids.map(id => element[id]).join('-')
    },
  },
}
</script>
