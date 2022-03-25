<template>
  <div>
    <h1 class="mt-m">Glossaire</h1>

    <hr class="mb-xl" />

    <div class="desktop-blobs">
      <div class="desktop-blob-1-3">
        <Sommaire />
      </div>
      <div class="desktop-blob-2-3">
        <Router-view v-if="slug" :slug="slug" :definition="definition" />
        <div v-else>
          <h3>Définitions des termes utilisés dans Camino.</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sommaire from './glossaire/sommaire.vue'
import { definitions } from './glossaire/definitions'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
const route = useRoute()

const slug = ref<string>(Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug)
console.log(JSON.stringify(route))
const getDefinition = (slug: string) => {
  return definitions.find(d => d.slug === slug)
}
const definition = ref(getDefinition(slug.value))
watch(
  () => route.params.slug,
  newSlug => {
    const definitionFound = getDefinition(Array.isArray(newSlug) ? newSlug[0] : newSlug)
    if (definitionFound) {
      slug.value = definitionFound.slug
      definition.value = definitionFound
      console.log('set definition', definition)
    }
  }
)
</script>
