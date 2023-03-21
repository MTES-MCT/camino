<template>
  <div class="tablet-blobs mb-xl">
    <div class="tablet-blob-1-2">
      <div v-if="titulaires.length" class="mb">
        <h5>Titulaire{{ titulaires.length > 1 ? 's' : '' }}</h5>
        <Entreprise v-for="titulaire in titulaires" :key="titulaire.id" :entreprise="titulaire" class="mb-s" @titre-event-track="eventTrack" />
      </div>
      <div v-if="amodiataires.length" class="mb">
        <h5>Amodiataire{{ amodiataires.length > 1 ? 's' : '' }}</h5>
        <Entreprise v-for="amodiataire in amodiataires" :key="amodiataire.id" :entreprise="amodiataire" class="mb-s" @titre-event-track="eventTrack" />
      </div>
    </div>

    <div class="tablet-blob-1-2">
      <div v-if="administrations.length" class="mb">
        <h5>Administrations</h5>
        <Administration v-for="administrationId in admins" :key="administrationId" :administrationId="administrationId" class="mb-s" @titre-event-track="eventTrack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Entreprise from '../titre/entreprise.vue'
import { Administration } from '../titre/administration'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { isAssociee } from 'camino-common/src/static/administrationsTitresTypes'
import { useStore } from 'vuex'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed } from 'vue'

const store = useStore()
const props = defineProps<{
  titreTypeId: TitreTypeId
  titulaires: Record<string, any>[]
  amodiataires: Record<string, any>[]
  administrations: AdministrationId[]
}>()

const emits = defineEmits<{
  (e: 'titre-event-track', event: unknown): void
}>()

const eventTrack = (event: unknown) => {
  emits('titre-event-track', event)
}

const mustFilterOutAssociee = () => {
  return !(store.getters['user/userIsAdmin'] || store.getters['user/userIsSuper'])
}

const admins = computed(() => {
  if (mustFilterOutAssociee()) {
    return props.administrations.filter(id => !isAssociee(id, props.titreTypeId))
  } else {
    return props.administrations
  }
})
</script>
