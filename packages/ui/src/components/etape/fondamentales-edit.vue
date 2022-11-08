<template>
  <div>
    <div v-if="!isArm || userIsAdmin" class="tablet-blobs">
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
              <inputNumber
                v-model="etape.duree.ans"
                :integer="true"
                placeholder="années"
                class="py-s mb-s"
              />
            </div>
            <div class="blob-mini-1-2">
              <inputNumber
                v-model="etape.duree.mois"
                :integer="true"
                placeholder="mois"
                class="p-s"
              />
            </div>
          </div>
          <div v-if="etape.duree.ans || etape.duree.mois" class="h6">
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
        <template #read>
          <div class="border p-s mb-s bold">
            <PropDuree :duree="etape.heritageProps.duree.etape.duree" />
          </div>
        </template>
      </HeritageEdit>

      <hr />
    </div>

    <div v-if="(!isArm && !isAxm) || userIsAdmin">
      <div v-if="canSeeAllDates" class="tablet-blobs">
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
          <template #read>
            <div class="border p-s mb-s bold">
              {{ dateFormat(etape.heritageProps.dateDebut.etape.dateDebut) }}
            </div>
          </template>
        </HeritageEdit>
      </div>

      <div v-if="canSeeAllDates" class="tablet-blobs">
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
          <template #read>
            <div class="border p-s mb-s bold">
              {{ dateFormat(etape.heritageProps.dateFin.etape.dateFin) }}
            </div>
          </template>
        </HeritageEdit>
      </div>
      <hr />

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
        <template #read>
          <ul class="list-prefix">
            <li
              v-for="t in etape.heritageProps.titulaires.etape.titulaires"
              :key="t.id"
            >
              {{ etablissementNameFind(t.etablissements, etape.date) || t.nom }}
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

      <template v-if="canAddAmodiataires">
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
          <template #read>
            <ul class="list-prefix">
              <li
                v-for="t in etape.heritageProps.amodiataires.etape.amodiataires"
                :key="t.id"
              >
                {{
                  etablissementNameFind(t.etablissements, etape.date) || t.nom
                }}
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
      </template>

      <hr />
    </div>

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
import { dureeOptionalCheck as titreEtapesDureeOptionalCheck } from 'camino-common/src/permissions/titres-etapes'

import { EtapeEntreprise, Etape } from 'camino-common/src/etape'
import { DomaineId, DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { toTitreTypeId } from 'camino-common/src/static/titresTypes'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import {
  TITRES_TYPES_TYPES_IDS,
  TitreTypeTypeId
} from 'camino-common/src/static/titresTypesTypes'
import { etape } from '@/api/titres-etapes'
import { useStore } from 'vuex'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { watch, computed } from 'vue'
import { AutoCompleteEntreprise } from './autocomplete-entreprise.type'

const store = useStore()

const props = defineProps<{
  etape: Etape
  domaineId: DomaineId
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeTypeId
  userIsAdmin: boolean
  userIsSuper: boolean
  substances: SubstanceLegaleId[]
}>()

const emits = defineEmits<{
  (e: 'complete-update', complete: boolean): void
}>()

const entreprisesDisabled = computed<EtapeEntreprise[]>(() => {
  return entreprises.value.filter(entr => {
    return (
      props.etape.amodiataires.find(a => a.id === entr.id) ||
      props.etape.titulaires.find(t => t.id === entr.id)
    )
  })
})

const isArm = computed<boolean>(() => {
  return (
    props.domaineId === DOMAINES_IDS.METAUX &&
    props.titreTypeId === TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE
  )
})

const isAxm = computed<boolean>(() => {
  return (
    props.domaineId === DOMAINES_IDS.METAUX &&
    props.titreTypeId === TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION
  )
})

const entreprises = computed<AutoCompleteEntreprise[]>(() => {
  return store.state.titreEtapeEdition.metas.entreprises
})

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
    toTitreTypeId(props.titreTypeId, props.domaineId)
  )
})

const canSeeAllDates = computed<boolean>(() => {
  if (props.userIsSuper) {
    return true
  }

  if (props.etape.type?.id === 'mfr' && (isArm.value || isAxm.value)) {
    return false
  }

  return true
})

const canAddAmodiataires = computed<boolean>(() => {
  return !isArm.value && !isAxm.value
})

const complete = computed<boolean>(() => {
  return (
    props.etape.type.id !== ETAPES_TYPES.demande ||
    (props.etape.substances?.filter(substanceId => !!substanceId)?.length > 0 &&
      (dureeOptionalCheck.value ||
        !!props.etape.duree.ans ||
        !!props.etape.duree.mois))
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

const titulairesUpdate = (titulaires: AutoCompleteEntreprise[]) => {
  const newTitulaires = titulaires.map(titulaire => ({
    id: titulaire.id,
    operateur: titulaire.operateur,
    // FIXME 2022-11-08 utiliser un autre type
    nom: '',
    etablissements: []
  }))
  props.etape.titulaires.splice(
    0,
    props.etape.titulaires.length,
    ...newTitulaires
  )
}

const amodiatairesUpdate = (amodiataires: AutoCompleteEntreprise[]) => {
  const newAmodiataires = amodiataires.map(amodiataire => ({
    id: amodiataire.id,
    operateur: amodiataire.operateur,
    // FIXME 2022-11-08 utiliser un autre type
    nom: '',
    etablissements: []
  }))
  props.etape.amodiataires.splice(
    0,
    props.etape.amodiataires.length,
    ...newAmodiataires
  )
}

const completeUpdate = () => {
  emits('complete-update', complete.value)
}

completeUpdate()
</script>
