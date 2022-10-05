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
            :selectedEntities="entreprisesTitulaires"
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
              :selectedEntities="entreprisesAmodiataires"
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

<script>
import { dateFormat } from '../../utils/index'
import Tag from '../_ui/tag.vue'
import InputDate from '../_ui/input-date.vue'
import InputNumber from '../_ui/input-number.vue'
import HeritageEdit from './heritage-edit.vue'
import PropDuree from './prop-duree.vue'
import AutocompleteEntreprise from './autocomplete-entreprise.vue'

import { etablissementNameFind } from '@/utils/entreprise'
import SubstancesEdit from '@/components/etape/substances-edit.vue'
import { dureeOptionalCheck } from 'camino-common/src/permissions/titres-etapes'

export default {
  components: {
    SubstancesEdit,
    InputDate,
    InputNumber,
    HeritageEdit,
    Tag,
    PropDuree,
    AutocompleteEntreprise
  },

  props: {
    etape: { type: Object, default: () => ({}) },
    domaineId: { type: String, default: '' },
    titreTypeId: { type: String, required: true },
    userIsAdmin: { type: Boolean, required: true },
    userIsSuper: { type: Boolean, required: true },
    substances: { type: Array, required: true }
  },
  emits: ['complete-update'],

  computed: {
    entreprisesDisabled() {
      return this.entreprises.filter(entr => {
        return (
          this.etape.amodiataires.find(a => a.id === entr.id) ||
          this.etape.titulaires.find(t => t.id === entr.id)
        )
      })
    },
    entreprisesTitulaires() {
      return this.etape.titulaires.map(titulaire => ({
        ...this.entreprises.find(({ id }) => id === titulaire.id),
        operateur: titulaire.operateur ?? false
      }))
    },
    entreprisesAmodiataires() {
      return this.etape.amodiataires.map(amodiataire => ({
        ...this.entreprises.find(({ id }) => id === amodiataire.id),
        operateur: amodiataire.operateur ?? false
      }))
    },

    isArm() {
      return this.domaineId === 'm' && this.titreTypeId === 'ar'
    },

    isAxm() {
      return this.domaineId === 'm' && this.titreTypeId === 'ax'
    },

    entreprises() {
      return this.$store.state.titreEtapeEdition.metas.entreprises
    },

    titulairesLength() {
      return this.etape.titulaires.filter(({ id }) => id).length
    },

    amodiatairesLength() {
      return this.etape.amodiataires?.filter(({ id }) => id).length || 0
    },

    dureeOptionalCheck() {
      return dureeOptionalCheck(
        this.etape.type.id,
        this.etape.demarche.type.id,
        this.titreTypeId + this.domaineId
      )
    },

    canSeeAllDates() {
      if (this.userIsSuper) {
        return true
      }

      if (this.etape.type?.id === 'mfr' && (this.isArm || this.isAxm)) {
        return false
      }

      return true
    },

    canAddAmodiataires() {
      return !this.isArm && !this.isAxm
    },

    complete() {
      return (
        this.etape.type.id !== 'mfr' ||
        (this.etape.substances?.filter(substanceId => !!substanceId)?.length >
          0 &&
          (this.dureeOptionalCheck ||
            !!this.etape.duree.ans ||
            !!this.etape.duree.mois))
      )
    }
  },

  watch: {
    complete: 'completeUpdate',
    etape: {
      handler: function (etape) {
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
      deep: true
    }
  },

  created() {
    this.completeUpdate()
  },

  methods: {
    titulairesUpdate(titulaires) {
      const newTitulaires = titulaires.map(titulaire => ({
        id: titulaire.id,
        operateur: titulaire.operateur
      }))
      this.etape.titulaires.splice(
        0,
        this.etape.titulaires.length,
        ...newTitulaires
      )
    },
    amodiatairesUpdate(amodiataires) {
      const newAmodiataires = amodiataires.map(amodiataire => ({
        id: amodiataire.id,
        operateur: amodiataire.operateur
      }))
      this.etape.amodiataires.splice(
        0,
        this.etape.amodiataires.length,
        ...newAmodiataires
      )
    },

    etablissementNameFind() {
      return etablissementNameFind()
    },

    dateFormat(date) {
      return dateFormat(date)
    },

    completeUpdate() {
      this.$emit('complete-update', this.complete)
    }
  }
}
</script>
