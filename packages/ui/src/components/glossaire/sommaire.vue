<template>
  <div>
    <ul class="list-sans mb-l">
      <li v-for="definition in mesDefinitions" id="==" :key="definition.id">
        <router-link
          :to="{ name: 'definition', params: { slug: definition.slug } }"
          class="btn-menu text-decoration-none bold"
        >
          {{ definition.nom }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// TODO 2022-03-25: storybook?
import { definitions } from './definitions'
const mesDefinitions = [...definitions].sort(
  (definition1, definition2) => definition1.ordre - definition2.ordre
)
</script>
