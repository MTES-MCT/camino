<template>
  <div class="flex flex-direction-column full-x">
    <ul
      v-if="alertes && alertes.length"
      class="bg-warning color-bg list-none p-s bold"
    >
      <li v-for="alerte in alertes" :key="alerte" class="flex">
        {{ alerte.message }}
        <a v-if="alerte.url" :href="alerte.url" target="_blank" class="ml-s">
          <Icon name="external-link" size="M" />
        </a>
      </li>
    </ul>
    <div class="tablet-blobs mr-xxs">
      <div class="tablet-blob-1-3"></div>
      <div v-if="!showDepose" class="tablet-blob-1-3"></div>
      <div class="tablet-blob-1-3">
        <button
          class="btn"
          :class="[showDepose ? 'btn-secondary' : 'btn-primary']"
          :disabled="!canSave"
          @click="emit('save')"
        >
          Enregistrer
        </button>
      </div>
      <div class="tablet-blob-1-3">
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
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/_ui/icon.vue'

defineProps<{
  alertes: { message: string; url: string }[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'depose'): void
}>()
</script>
