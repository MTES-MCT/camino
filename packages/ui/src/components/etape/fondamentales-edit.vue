<template>
  <div>
    <div v-if="canEditDuree(titreTypeId, demarcheTypeId)" class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5 class="mb-0">Durée (années / mois)</h5>
        <p v-if="dureeOptionalCheck" class="h6 italic mb-0">Optionnel</p>
      </div>

      <HeritageEdit
        v-model:prop="etape.heritageProps.duree"
        class="tablet-blob-2-3"
        propId="duree"
      >
        <template #write>
          <div class="blobs-mini">
            <div class="blob-mini-1-2">
              <InputNumber
                v-model="ans"
                :integer="true"
                placeholder="années"
                class="py-s mb-s"
                @blur="updateDuree"
              />
            </div>
            <div class="blob-mini-1-2">
              <InputNumber
                v-model="mois"
                :integer="true"
                placeholder="mois"
                class="p-s"
                @blur="updateDuree"
              />
            </div>
          </div>
          <div v-if="ans || mois" class="h6">
            <label>
              <input
                v-model="etape.incertitudes.duree"
                type="checkbox"
                class="mr-xs"
              />
              Incertain
            </label>
          </div>
        </template>
        <template #read="{ heritagePropEtape }">
          <div class="border p-s mb-s bold">
            <PropDuree :duree="heritagePropEtape.duree" />
          </div>
        </template>
      </HeritageEdit>

      <hr />
    </div>

    <template
      v-if="canEditDates(titreTypeId, demarcheTypeId, etape.type.id, user)"
    >
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5 class="mb-0">Date de début</h5>
          <p class="h6 italic mb-0">Optionnel</p>
        </div>
        <HeritageEdit
          v-model:prop="etape.heritageProps.dateDebut"
          class="tablet-blob-2-3"
          propId="dateDebut"
        >
          <template #write>
            <InputDate v-model="etape.dateDebut" class="mb-s" />
            <div v-if="etape.dateDebut" class="h6">
              <label>
                <input
                  v-model="etape.incertitudes.dateDebut"
                  type="checkbox"
                  class="mr-xs"
                />
                Incertain
              </label>
            </div>
          </template>
          <template #read="{ heritagePropEtape }">
            <div class="border p-s mb-s bold">
              {{ dateFormat(heritagePropEtape.dateDebut) }}
            </div>
          </template>
        </HeritageEdit>
      </div>

      <hr />
    </template>

    <template
      v-if="canEditDates(titreTypeId, demarcheTypeId, etape.type.id, user)"
    >
      <div class="tablet-blobs">
        <hr />
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5 class="mb-0">Date d'échéance</h5>
          <p class="h6 italic mb-0">Optionnel</p>
        </div>
        <HeritageEdit
          v-model:prop="etape.heritageProps.dateFin"
          class="tablet-blob-2-3"
          propId="dateFin"
        >
          <template #write>
            <InputDate v-model="etape.dateFin" class="mb-s" />
            <div v-if="etape.dateFin" class="h6">
              <label>
                <input
                  v-model="etape.incertitudes.dateFin"
                  type="checkbox"
                  class="mr-xs"
                />
                Incertain
              </label>
            </div>
          </template>
          <template #read="{ heritagePropEtape }">
            <div class="border p-s mb-s bold">
              {{ dateFormat(heritagePropEtape.dateFin) }}
            </div>
          </template>
        </HeritageEdit>
      </div>
      <hr />
    </template>

    <template v-if="canEditTitulaires(titreTypeId, user)">
      <h3 class="mb-s">Titulaires</h3>
      <p class="h6 italic">Optionnel</p>
      <HeritageEdit
        v-model:prop="etape.heritageProps.titulaires"
        propId="titulaires"
        :isArray="true"
      >
        <template #write>
          <AutocompleteEntreprise
            :allEntities="entreprises"
            :selectedEntities="etape.titulaires"
            :nonSelectableEntities="entreprisesDisabled"
            placeholder="Sélectionner un titulaire"
            @onEntreprisesUpdate="titulairesUpdate"
          />
          <div class="h6 mt-s">
            <label v-if="titulairesLength">
              <input
                v-model="etape.incertitudes.titulaires"
                type="checkbox"
                class="mr-xs"
              />
              Incertain
            </label>
          </div>
        </template>
        <template #read="{ heritagePropEtape }">
          <ul class="list-prefix">
            <li v-for="t in heritagePropEtape.titulaires" :key="t.id">
              {{ getEntrepriseNom(t) }}
              <Tag
                v-if="t.operateur"
                :mini="true"
                color="bg-info"
                class="ml-xs"
              >
                Opérateur
              </Tag>
            </li>
          </ul>
        </template>
      </HeritageEdit>
      <hr />
    </template>

    <template v-if="canEditAmodiataires(titreTypeId, user)">
      <hr />

      <h3 class="mb-s">Amodiataires</h3>
      <p class="h6 italic">Optionnel</p>

      <HeritageEdit
        v-model:prop="etape.heritageProps.amodiataires"
        propId="amodiataires"
        :isArray="true"
      >
        <template #write>
          <AutocompleteEntreprise
            :allEntities="entreprises"
            :selectedEntities="etape.amodiataires"
            :nonSelectableEntities="entreprisesDisabled"
            placeholder="Sélectionner un amodiataire"
            @onEntreprisesUpdate="amodiatairesUpdate"
          />
          <div class="h6 mt-s">
            <label v-if="amodiatairesLength">
              <input
                v-model="etape.incertitudes.amodiataires"
                type="checkbox"
                class="mr-xs"
              />
              Incertain
            </label>
          </div>
        </template>
        <template #read="{ heritagePropEtape }">
          <ul class="list-prefix">
            <li v-for="t in heritagePropEtape.amodiataires" :key="t.id">
              {{ getEntrepriseNom(t) }}
              <Tag
                v-if="t.operateur"
                :mini="true"
                color="bg-info"
                class="ml-xs"
              >
                Opérateur
              </Tag>
            </li>
          </ul>
        </template>
      </HeritageEdit>

      <hr />
    </template>

    <SubstancesEdit
      :substances="etape.substances"
      :heritageProps="etape.heritageProps"
      :incertitudes="etape.incertitudes"
      :domaineId="domaineId"
    />

    <hr />
  </div>
</template>

<script setup lang="ts">
import { dateFormat } from '../../utils/index'
import Tag from '../_ui/tag.vue'
import InputDate from '../_ui/input-date.vue'
import InputNumber from '../_ui/input-number.vue'
import HeritageEdit from './heritage-edit.vue'
import PropDuree from './prop-duree.vue'
import AutocompleteEntreprise from './autocomplete-entreprise.vue'

import { etablissementNameFind } from '@/utils/entreprise'
import SubstancesEdit from '@/components/etape/substances-edit.vue'
import {
  dureeOptionalCheck as titreEtapesDureeOptionalCheck,
  canEditAmodiataires,
  canEditTitulaires,
  canEditDuree,
  canEditDates
} from 'camino-common/src/permissions/titres-etapes'

import { EtapeEntreprise, EtapeFondamentale } from 'camino-common/src/etape'
import { DomaineId } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import {
  TitreTypeId,
  toTitreTypeId
} from 'camino-common/src/static/titresTypes'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { watch, computed, ref } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'

const props = defineProps<{
  etape: EtapeFondamentale
  domaineId: DomaineId
  demarcheTypeId: DemarcheTypeId
  titreTypeTypeId: TitreTypeTypeId
  user: User
  entreprises: Entreprise[]
}>()

const emits = defineEmits<{
  (e: 'complete-update', complete: boolean): void
}>()

const ans = ref<number>(
  props.etape.duree ? Math.floor(props.etape.duree / 12) : 0
)
const mois = ref<number>(
  props.etape.duree ? Math.floor(props.etape.duree % 12) : 0
)

const entreprisesDisabled = computed<EntrepriseId[]>(() =>
  [...props.etape.amodiataires, ...props.etape.titulaires].map(({ id }) => id)
)

const titreTypeId = computed<TitreTypeId>(() =>
  toTitreTypeId(props.titreTypeTypeId, props.domaineId)
)

const titulairesLength = computed<number>(() => {
  return props.etape.titulaires.filter(({ id }) => id).length
})

const amodiatairesLength = computed<number>(() => {
  return props.etape.amodiataires?.filter(({ id }) => id).length || 0
})

const dureeOptionalCheck = computed<boolean>(() => {
  return titreEtapesDureeOptionalCheck(
    props.etape.type.id,
    props.demarcheTypeId,
    toTitreTypeId(props.titreTypeTypeId, props.domaineId)
  )
})

const complete = computed<boolean>(() => {
  return (
    props.etape.type.id !== ETAPES_TYPES.demande ||
    (props.etape.substances?.filter(substanceId => !!substanceId)?.length > 0 &&
      (dureeOptionalCheck.value || !!ans.value || !!mois.value))
  )
})

watch(
  () => complete,
  () => completeUpdate()
)

watch(
  () => props.etape,
  etape => {
    if (!etape.duree) {
      etape.incertitudes.duree = false
    }

    if (!etape.dateDebut) {
      etape.incertitudes.dateDebut = false
    }

    if (!etape.dateFin) {
      etape.incertitudes.dateFin = false
    }

    if (!etape.titulaires.length) {
      etape.incertitudes.titulaires = false
    }

    if (!etape.amodiataires?.length) {
      etape.incertitudes.amodiataires = false
    }

    if (!etape.substances?.length) {
      etape.incertitudes.substances = false
    }
  },
  { deep: true }
)

const titulairesUpdate = (titulaires: EtapeEntreprise[]) => {
  const newTitulaires = titulaires.map(titulaire => ({
    id: titulaire.id,
    operateur: titulaire.operateur
  }))
  props.etape.titulaires.splice(
    0,
    props.etape.titulaires.length,
    ...newTitulaires
  )
}

const amodiatairesUpdate = (amodiataires: EtapeEntreprise[]) => {
  const newAmodiataires = amodiataires.map(amodiataire => ({
    id: amodiataire.id,
    operateur: amodiataire.operateur
  }))
  props.etape.amodiataires.splice(
    0,
    props.etape.amodiataires.length,
    ...newAmodiataires
  )
}

const getEntrepriseNom = (etapeEntreprise: EtapeEntreprise): string => {
  const entreprise = props.entreprises.find(
    ({ id }) => id === etapeEntreprise.id
  )

  if (!entreprise) {
    return ''
  }

  return (
    etablissementNameFind(entreprise.etablissements, props.etape.date) ||
    entreprise.nom
  )
}

const updateDuree = (): void => {
  props.etape.duree = mois.value + ans.value * 12
}

const completeUpdate = () => {
  emits('complete-update', complete.value)
}

completeUpdate()
</script>
