<template>
  <div>
    <h1 class="mt-m">Statistiques</h1>
    <div class="flex">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="mr-xs"
        :class="{ active: tabActive === tab.id }"
      >
        <router-link :to="{ name: tab.name }" class="p-m btn-tab rnd-t-s">
          {{ tab.nom }}
        </router-link>
      </div>
    </div>
    <div class="line-neutral width-full" />

    <Router-view v-if="tabActive" />
  </div>
</template>

<script>
export default {
  name: 'Statistiques',

  data() {
    return {
      tabs: [
        { id: 'globales', nom: 'Globales', name: 'statistiques-globales' },
        { id: 'guyane', nom: 'Guyane', name: 'statistiques-guyane' },
        {
          id: 'granulats-marins',
          nom: 'Granulats marins',
          name: 'statistiques-granulats-marins'
        },
        {
          id: 'mineraux-metaux-metropole',
          nom: 'Mineraux & métaux métropole',
          name: 'statistiques-mineraux-metaux-metropole'
        }
      ]
    }
  },

  computed: {
    tabActive() {
      return this.$route.name.replace(/statistiques-/, '')
    }
  },

  created() {
    if (this.$matomo) {
      // @ts-ignore
      this.$matomo.trackEvent('menu-sections', 'menu-section', 'statistiques')
    }

    if (this.$route.name === 'statistiques') {
      this.$router.replace({ name: 'statistiques-globales' })
    }
  }
}
</script>
