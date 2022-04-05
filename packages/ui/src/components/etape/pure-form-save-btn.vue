<template>
  <div class="flex flex-direction-column full-x">
    <ul
      v-if="alertes && alertes.length"
      class="bg-warning color-bg list-none p-s bold"
    >
      <li v-for="alerte in alertes" :key="alerte" class="flex">
        {{ alerte.message }}
        <a v-if="alerte.url" :href="alerte.url" target="_blank" class="ml-s">
          <i class="icon-24 icon-window-link" />
        </a>
      </li>
    </ul>
    <div class="flex flex-center">
      <button
        class="btn"
        :class="[showDepose ? 'btn-secondary' : 'btn-primary']"
        :disabled="!canSave"
        @click="emit('save')"
      >
        Enregistrer
      </button>
      <button
        v-if="showDepose"
        class="btn btn-primary"
        :disabled="!canDepose"
        @click="emit('depose')"
      >
        Enregistrer et déposer
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  alertes: { message: string; url: string }[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean
}>()

const emit = defineEmits<{
  save: () => void
  depose: () => void
}>()
</script>
