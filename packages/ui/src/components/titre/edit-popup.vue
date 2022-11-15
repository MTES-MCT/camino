<template>
  <Popup :messages="messages">
    <template #header>
      <div>
        <h2 class="cap-first">Modification du titre</h2>
      </div>
    </template>

    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Nom</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input v-model="titre.nom" type="text" class="p-s" />
        </div>
      </div>
      <hr />
    </div>

    <div>
      <h3 class="mb-s">Références</h3>
      <p class="h6 italic">Optionnel</p>
      <hr />
      <div
        v-for="(reference, index) in titre.references"
        :key="index"
        class="flex full-x mb-s"
      >
        <select v-model="reference.referenceTypeId" class="p-s mr-s">
          <option
            v-for="referenceType in sortedReferencesTypes"
            :key="referenceType.id"
            :value="referenceType.id"
          >
            {{ referenceType.nom }}
          </option>
        </select>
        <input
          v-model="reference.nom"
          type="text"
          class="p-s mr-s"
          placeholder="valeur"
        />
        <div class="flex-right">
          <button class="btn py-s px-m rnd-xs" @click="referenceRemove(index)">
            <Icon name="minus" size="M" />
          </button>
        </div>
      </div>

      <button
        v-if="
          titre.references &&
          !titre.references.find(r => !r.referenceTypeId || !r.nom)
        "
        class="btn rnd-xs py-s px-m full-x mb flex h6"
        @click="referenceAdd"
      >
        <span class="mt-xxs">Ajouter une référence</span>
        <Icon name="plus" size="M" class="flex-right" />
      </button>
    </div>

    <template #footer>
      <div v-if="!loading" class="tablet-blobs">
        <div class="tablet-blob-1-3 mb tablet-mb-0">
          <button class="btn-border rnd-xs p-s full-x" @click="cancel">
            Annuler
          </button>
        </div>
        <div class="tablet-blob-2-3">
          <button
            :ref="saveRef"
            class="btn btn-primary"
            :disabled="!complete"
            :class="{ disabled: !complete }"
            @click="save"
          >
            Enregistrer
          </button>
        </div>
      </div>
      <div v-else class="p-s full-x bold">Enregistrement en cours…</div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import Popup from '../_ui/popup.vue'

import Icon from '@/components/_ui/icon.vue'
import { computed, ComputedRef, inject, onMounted, onUnmounted, ref } from 'vue'
import {
  ReferenceTypeId,
  sortedReferencesTypes
} from 'camino-common/src/static/referencesTypes'
import { useStore } from 'vuex'

export type Titre = {
  id: string
  nom: string
  references: { referenceTypeId: ReferenceTypeId | ''; nom: string }[]
}
const props = defineProps<{
  titre: Titre
}>()
const store = useStore()
const matomo = inject('matomo', null)
const saveRef = ref<any>(null)
const loading = computed(() => store.state.popup.loading)

const messages = computed(() => {
  return store.state.popup.messages
})

const user = computed(() => {
  return store.state.user.element
})

const complete = computed(() => {
  return !!props.titre.nom
})

const userIsSuper: ComputedRef<boolean> = computed(() => {
  return store.getters['user/userIsSuper']
})

const keyup = (e: KeyboardEvent) => {
  if ((e.which || e.keyCode) === 27) {
    cancel()
  } else if ((e.which || e.keyCode) === 13) {
    if (complete.value) {
      saveRef.value?.focus()
      save()
    }
  }
}

onMounted(async () => {
  document.addEventListener('keyup', keyup)
})

onUnmounted(() => {
  document.removeEventListener('keyup', keyup)
})

const save = async () => {
  if (complete.value) {
    const titre: Titre = JSON.parse(JSON.stringify(props.titre))
    titre.references = titre.references.filter(reference => {
      return reference.nom
    })

    await store.dispatch('titre/update', titre)

    eventTrack({
      categorie: 'titre-sections',
      action: 'titre-enregistrer',
      nom: titre.id
    })
  }
}

const cancel = () => {
  store.commit('popupClose')
}

const referenceAdd = () => {
  props.titre.references.push({ referenceTypeId: '', nom: '' })
}

const referenceRemove = (index: number) => {
  props.titre.references.splice(index, 1)
}

const eventTrack = (event: {
  categorie: string
  action: string
  nom: string
}) => {
  if (matomo) {
    // @ts-ignore
    matomo?.trackEvent(event.categorie, event.action, event.nom)
  }
}
</script>
