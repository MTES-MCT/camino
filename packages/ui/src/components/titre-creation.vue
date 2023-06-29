<template>
  <div>
    <h1 class="mt-xs mb-m">Demande de titre</h1>
    <hr />

    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Entreprise</h5>
      </div>
      <div class="tablet-blob-2-3">
        <select class="p-s mb" :value="titreDemande?.entrepriseId" @change="entrepriseUpdate">
          <option v-for="e in entreprises" :key="e.id" :value="e.id" :disabled="titreDemande.entrepriseId === e.id">
            {{ e.nom }}
          </option>
        </select>
      </div>
    </div>

    <hr />

    <TitreTypeSelect v-if="titreDemande.entrepriseId" v-model:element="titreDemande" :domaineId="titreDemande.typeId ? getDomaineId(titreDemande.typeId) : undefined" :user="user" />

    <div v-if="titreDemande.typeId">
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Nom du titre</h5>
        </div>
        <div class="tablet-blob-2-3">
          <input v-model="titreDemande.nom" type="text" class="p-s mb" />
        </div>
      </div>
      <hr />
    </div>

    <div v-if="titreDemande.typeId && titreDemande.entrepriseId && !entrepriseOuBureauDEtudeCheck">
      <h3 class="mb-s">Références</h3>
      <p class="h6 italic">Optionnel</p>
      <div v-for="(reference, index) in titreDemande.references" :key="index" class="flex full-x mb-s">
        <select v-model="reference.referenceTypeId" class="p-s mr-s">
          <option v-for="referenceType in sortedReferencesTypes" :key="referenceType.id" :value="referenceType.id">
            {{ referenceType.nom }}
          </option>
        </select>
        <input v-model="reference.nom" type="text" class="p-s mr-s" placeholder="valeur" />
        <div class="flex-right">
          <ButtonIcon class="btn py-s px-m rnd-xs" :onClick="referenceRemove(index)" title="Supprimer la référence" icon="minus" />
        </div>
      </div>

      <button
        v-if="titreDemande.references && !titreDemande.references.find(r => !r.referenceTypeId || !r.nom)"
        class="btn small rnd-xs py-s px-m full-x mb flex"
        title="Ajouter une référence"
        aria-label="Ajouter une référence"
        @click="referenceAdd"
      >
        <span class="mt-xxs">Ajouter une référence</span>
        <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
      </button>

      <hr />
    </div>

    <div v-if="titreDemande.typeId && linkConfig">
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Titre {{ linkConfig.count === 'multiple' ? 's' : '' }} à l’origine de cette nouvelle demande</h5>
        </div>
        <div class="tablet-blob-2-3">
          <TitresLink :config="titreLinkConfig" :loadLinkableTitres="loadLinkableTitresByTypeId" :onSelectTitres="onSelectedTitres" :onSelectTitre="unused" />
        </div>
      </div>
      <hr />
    </div>

    <div class="tablet-blobs mb">
      <div class="tablet-blob-1-3" />
      <div class="tablet-blob-2-3">
        <button v-if="!loading" id="cmn-titre-activite-edit-popup-button-enregistrer" :ref="saveRef" :disabled="!complete" class="btn btn-primary" @click="save">Créer le titre</button>
        <div v-else class="p-s full-x bold">Enregistrement en cours…</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ReferenceTypeId, sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { TitreTypeSelect } from './_common/titre-type-select'
import { Icon } from '@/components/_ui/icon'
import { isBureauDEtudes, isEntreprise } from 'camino-common/src/roles'
import { TitresLink } from '@/components/titre/titres-link'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { apiClient } from '@/api/api-client'
import { TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'
import { entreprisesTitresCreation } from '@/api/entreprises'
import { ButtonIcon } from '@/components/_ui/button-icon'

type Entreprise = {
  id: string
  nom: string
}

const titreDemande = ref<{
  entrepriseId?: string
  typeId: TitreTypeId | undefined | null
  nom?: string
  titreFromIds?: string[]
  references: { referenceTypeId: ReferenceTypeId | ''; nom: string }[]
}>({ references: [], typeId: undefined })
const saveRef = ref<any>(null)
const store = useStore()

const titreLinkConfig = computed<TitresLinkConfig>(() => {
  if (linkConfig.value?.count === 'single') {
    return {
      type: 'single',
      selectedTitreId: null,
    }
  }

  return {
    type: 'multiple',
    selectedTitreIds: [],
  }
})

const user = computed(() => {
  return store.state.user.element
})

const entreprises = ref<Entreprise[]>([])

const entrepriseOuBureauDEtudeCheck = computed<boolean>(() => {
  return isEntreprise(user.value) || isBureauDEtudes(user.value)
})

const complete = computed(() => {
  return titreDemande.value.entrepriseId && titreDemande.value.typeId && titreDemande.value.nom
})

const loading = computed(() => {
  return store.state.loading.includes('titreCreationAdd')
})

const linkConfig = computed(() => {
  if (titreDemande.value.typeId) {
    return getLinkConfig(titreDemande.value.typeId, [])
  }
  return null
})

const loadLinkableTitresByTypeId = computed(() => {
  if (titreDemande.value.typeId) {
    return apiClient.loadLinkableTitres(titreDemande.value.typeId, [])
  } else {
    return () => Promise.resolve([])
  }
})

onMounted(async () => {
  await init()

  document.addEventListener('keyup', keyUp)
})

onBeforeUnmount(() => {
  document.removeEventListener('keyup', keyUp)
})

const onSelectedTitres = (titres: { id: string }[]) => {
  titreDemande.value.titreFromIds = titres.map(({ id }) => id)
}
const unused = () => {}
const keyUp = (e: KeyboardEvent) => {
  if ((e.which || e.keyCode) === 13 && complete.value && !loading.value) {
    saveRef.value?.focus()
    save()
  }
}

const init = async () => {
  const data = await entreprisesTitresCreation()

  if (!data.length) {
    await store.dispatch('pageError')
  }

  entreprises.value = data

  if (entreprises.value?.length === 1) {
    titreDemande.value.entrepriseId = entreprises.value[0].id
  }
}

const entrepriseUpdate = (event: Event) => {
  titreDemande.value = {
    entrepriseId: (event.target as HTMLSelectElement)?.value,
    references: [],
    typeId: undefined,
  }
}

const save = () => {
  if (linkConfig.value && !titreDemande.value.titreFromIds) {
    titreDemande.value.titreFromIds = []
  }

  store.dispatch('titreCreation/save', titreDemande.value)
}

const referenceAdd = () => {
  titreDemande.value.references.push({ referenceTypeId: '', nom: '' })
}

const referenceRemove = (index: number) => () => {
  titreDemande.value.references.splice(index, 1)
}
</script>
