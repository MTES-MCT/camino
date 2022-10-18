<template>
  <div>
    <h1 class="mt-xs mb-m">Demande de titre</h1>
    <hr />

    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Entreprise</h5>
      </div>
      <div class="tablet-blob-2-3">
        <select
          class="p-s mb"
          :value="titreDemande?.entrepriseId"
          @change="entrepriseUpdate"
        >
          <option
            v-for="e in entreprises"
            :key="e.id"
            :value="e.id"
            :disabled="titreDemande.entrepriseId === e.id"
          >
            {{ e.nom }}
          </option>
        </select>
      </div>
    </div>

    <hr />

    <TitreTypeSelect
      v-if="titreDemande.entrepriseId"
      v-model:element="titreDemande"
      :domaines="domaines"
      :user="user"
    />

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

    <div
      v-if="
        titreDemande.typeId &&
        titreDemande.entrepriseId &&
        !entrepriseOuBureauDEtudeCheck
      "
    >
      <h3 class="mb-s">Références</h3>
      <p class="h6 italic">Optionnel</p>
      <div
        v-for="(reference, index) in titreDemande.references"
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
          titreDemande.references &&
          !titreDemande.references.find(r => !r.referenceTypeId || !r.nom)
        "
        class="btn small rnd-xs py-s px-m full-x mb flex"
        @click="referenceAdd"
      >
        <span class="mt-xxs">Ajouter une référence</span>
        <Icon name="plus" size="M" class="flex-right" />
      </button>

      <hr />
    </div>

    <div v-if="titreDemande.typeId && linkConfig">
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>
            Titre {{ linkConfig.count === 'multiple' ? 's' : '' }} à l’origine
            de cette nouvelle demande
          </h5>
        </div>
        <div class="tablet-blob-2-3">
          <PureTitresLink
            :config="titreLinkConfig"
            :loadLinkableTitres="loadLinkableTitresByTypeId"
            @onSelectedTitres="onSelectedTitres"
          />
        </div>
      </div>
      <hr />
    </div>

    <div class="tablet-blobs mb">
      <div class="tablet-blob-1-3" />
      <div class="tablet-blob-2-3">
        <button
          v-if="!loading"
          id="cmn-titre-activite-edit-popup-button-enregistrer"
          :ref="saveRef"
          :disabled="!complete"
          class="btn btn-primary"
          @click="save"
        >
          Créer le titre
        </button>
        <div v-else class="p-s full-x bold">Enregistrement en cours…</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ReferenceTypeId,
  sortedReferencesTypes
} from 'camino-common/src/static/referencesTypes'
import TitreTypeSelect from './_common/titre-type-select.vue'
import Icon from '@/components/_ui/icon.vue'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isBureauDEtudes,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles'
import PureTitresLink from '@/components/titre/pure-titres-link.vue'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import {
  loadLinkableTitres,
  TitresLinkConfig
} from '@/components/titre/pure-titres-link.type'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'

type TitreTypeType = { id: TitreTypeTypeId; nom: string }
type Domaine = {
  id: DomaineId
  nom: string
  titresTypes: {
    id: TitreTypeId
    type: TitreTypeType
  }[]
}
type TitreType = {
  id: TitreTypeId
  domaine: Domaine
  type: TitreTypeType
}
type Entreprise = {
  id: string
  nom: string
  type: TitreTypeType
  titresTypes: TitreType[]
}

const titreDemande = ref<{
  entrepriseId?: string
  typeId?: TitreTypeId
  nom?: string
  titreFromIds?: string[]
  references: { referenceTypeId: ReferenceTypeId | ''; nom: string }[]
}>({ references: [] })
const saveRef = ref<any>(null)
const store = useStore()

const titreLinkConfig = computed<TitresLinkConfig>(() => {
  if (linkConfig.value?.count === 'single') {
    return {
      type: 'single',
      selectedTitreId: null
    }
  }

  return {
    type: 'multiple',
    selectedTitreIds: []
  }
})

const user = computed(() => {
  return store.state.user.element
})

const entreprises = computed<Entreprise[]>(() => {
  return store.state.user.metas.entreprisesTitresCreation
})

const entreprise = computed<Entreprise | undefined>(() => {
  return entreprises.value.find(e => e.id === titreDemande.value.entrepriseId)
})

const entrepriseOuBureauDEtudeCheck = computed<boolean>(() => {
  return isEntreprise(user.value) || isBureauDEtudes(user.value)
})

const domaines = computed<Domaine[]>(() => {
  if (
    isSuper(user.value) ||
    isAdministrationAdmin(user.value) ||
    isAdministrationEditeur(user.value)
  ) {
    return store.state.user.metas.domaines
  }

  if (isEntreprise(user.value) || isBureauDEtudes(user.value)) {
    return entreprise.value?.titresTypes?.reduce(
      (domaines: Domaine[], tt: TitreType) => {
        if (!domaines.find(({ id }) => tt.domaine.id === id)) {
          tt.domaine.titresTypes = []
          domaines.push(tt.domaine)
        }

        const domaine = domaines.find(({ id }) => tt.domaine.id === id)

        domaine?.titresTypes?.push({
          id: tt.id,
          type: tt.type
        })

        return domaines
      },
      []
    )
  }

  return []
})

const complete = computed(() => {
  return (
    titreDemande.value.entrepriseId &&
    titreDemande.value.typeId &&
    titreDemande.value.nom
  )
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
    return loadLinkableTitres(titreDemande.value.typeId, [])
  } else {
    return () => Promise.resolve([])
  }
})

watch(
  () => entreprises,
  () => {
    init()
  }
)

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
const keyUp = (e: KeyboardEvent) => {
  if ((e.which || e.keyCode) === 13 && complete.value && !loading.value) {
    saveRef.value?.focus()
    save()
  }
}

const init = async () => {
  if (!entreprises.value.length) {
    await store.dispatch('pageError')
  }

  if (entreprises.value?.length === 1) {
    titreDemande.value.entrepriseId = entreprises.value[0].id
  }
}

const entrepriseUpdate = (event: Event) => {
  titreDemande.value = {
    entrepriseId: (event.target as HTMLSelectElement)?.value,
    references: []
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

const referenceRemove = (index: number) => {
  titreDemande.value.references.splice(index, 1)
}
</script>
