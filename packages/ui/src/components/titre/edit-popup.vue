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

    <TitreTypeSelect
      v-model:element="titre"
      :domaines="domaines"
      :user="user"
    />

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

    <div v-if="userIsSuper">
      <h3 class="mb-s">Administrations</h3>
      <p class="h6 italic">Administrations ajoutées manuellement au titre</p>
      <hr />
      <div
        v-for="(administration, index) in titre.titresAdministrations"
        :key="index"
        class="flex full-x mb-s"
      >
        <select v-model="administration.id" class="p-s mr-s">
          <option v-for="a in sortedAdministrations" :key="a.id" :value="a.id">
            {{ a.abreviation }}
          </option>
        </select>
        <div class="flex-right">
          <button
            class="btn py-s px-m rnd-xs"
            @click="administrationRemove(index)"
          >
            <Icon name="minus" size="M" />
          </button>
        </div>
      </div>

      <button
        v-if="
          titre.titresAdministrations &&
          !titre.titresAdministrations.find(r => !r.id)
        "
        class="btn rnd-xs py-s px-m full-x mb flex h6"
        @click="administrationAdd"
      >
        <span class="mt-xxs">Ajouter une administration</span>
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

import TitreTypeSelect from '../_common/titre-type-select.vue'
import {
  AdministrationId,
  sortedAdministrations
} from 'camino-common/src/static/administrations'
import Icon from '@/components/_ui/icon.vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed, ComputedRef, inject, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import { DomaineId } from 'camino-common/src/static/domaines'
import {
  ReferenceTypeId,
  sortedReferencesTypes
} from 'camino-common/src/static/referencesTypes'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
type Titre = {
  id: string
  nom: string
  domaineId: DomaineId
  typeId: TitreTypeId
  references: { referenceTypeId: ReferenceTypeId | ''; nom: string }[]
  titresAdministrations: { id: AdministrationId | '' }[]
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

const domaines = computed(() => {
  return store.state.user.metas.domaines.filter((d: any) =>
    d.titresTypes.some((dtt: { id: TitreTypeId }) =>
      canCreateTitre(store.state.user.element, dtt.id)
    )
  )
})

const user = computed(() => {
  return store.state.user.element
})

const complete = computed(() => {
  return !!props.titre.nom && !!props.titre.typeId && !!props.titre.domaineId
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
  errorsRemove()
  store.commit('popupClose')
}

const errorsRemove = () => {
  // this.$store.commit('utilisateur/loginMessagesRemove')
}

const referenceAdd = () => {
  props.titre.references.push({ referenceTypeId: '', nom: '' })
}

const referenceRemove = (index: number) => {
  props.titre.references.splice(index, 1)
}

const administrationAdd = () => {
  props.titre.titresAdministrations.push({ id: '' })
}

const administrationRemove = (index: number) => {
  props.titre.titresAdministrations.splice(index, 1)
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
