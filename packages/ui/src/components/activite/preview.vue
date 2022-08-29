<template>
  <Accordion
    :opened="opened"
    sub="true"
    :slotDefault="true"
    :slotButtons="true"
    @close="close"
    @toggle="toggle"
  >
    <template #title>
      <h5>
        <span class="cap-first"
          ><span v-if="activite.periodeId && activite.type.frequenceId">{{
            getPeriodeVue(activite.type.frequenceId, activite.periodeId)
          }}</span>
          {{ activite.annee }}</span
        >
      </h5>
      <div class="flex">
        <h3 class="mb-s">
          <span class="cap-first">{{ activite.type.nom }}</span>
        </h3>
        <HelpTooltip v-if="shouldDisplayHelp" class="ml-m">
          Si votre déclaration est complète, cliquez sur déposer. Cliquez sur le
          crayon pour modifier.
        </HelpTooltip>
      </div>
      <Statut :color="activite.statut.couleur" :nom="statutNom" class="mb-xs" />
    </template>
    <template #buttons>
      <button
        v-if="activite.suppression"
        class="cmn-activite-btn-supprimer btn small py-s px-m flex mr-px"
        title="supprimer l'activité'"
        @click="activiteRemovePopupOpen"
      >
        <Icon size="M" name="delete" />
      </button>
      <ActiviteButton
        v-if="activite.modification"
        :activite="activite"
        :route="route"
      />
    </template>

    <div>
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="activite.type.description" class="border-b-s px-m pt-m">
        <div class="h6" v-html="activite.type.description" />
      </div>
      <div v-if="activite.dateSaisie" class="border-b-s px-m pt-m">
        <h5>
          Date de {{ activite.statut.id === 'dep' ? 'dépôt' : 'modification' }}
        </h5>
        <p>{{ dateFormat(activite.dateSaisie) }}</p>
      </div>

      <UiSection
        v-for="s in activite.sections"
        :key="s.id"
        class="border-b-s px-m pt-m"
        :section="s"
        :contenu="activite.contenu ? activite.contenu[s.id] : {}"
        :date="activite.date"
      />

      <Documents
        v-if="activite.documents && activite.documents.length"
        :boutonSuppression="activite.modification"
        :boutonModification="activite.modification"
        :route="route"
        :documents="activite.documents"
        :etiquette="activite.modification"
        :parentId="activite.id"
        :parentTypeId="activite.type.id"
        :title="documentPopupTitle"
        repertoire="activites"
        class="px-m"
      />
    </div>
  </Accordion>
</template>

<script>
import ActiviteButton from './button.vue'
import Accordion from '../_ui/accordion.vue'
import HelpTooltip from '../_ui/help-tooltip.vue'
import UiSection from '../_common/section.vue'
import Statut from '../_common/statut.vue'

import Documents from '../documents/list.vue'
import { dateFormat } from '@/utils'
import RemovePopup from './remove-popup.vue'
import Icon from '@/components/_ui/icon.vue'
import { getPeriode } from 'camino-common/src/static/frequence'

export default {
  components: {
    Icon,
    ActiviteButton,
    Accordion,
    UiSection,
    Statut,
    Documents,
    HelpTooltip
  },

  props: {
    activite: { type: Object, required: true },
    route: { type: Object, required: true },
    initialOpened: { type: Boolean, default: false }
  },

  emits: ['popup'],

  data: () => ({
    opened: false
  }),

  computed: {
    documentNew() {
      return {
        titreActiviteId: this.activite.id,
        entreprisesLecture: false,
        publicLecture: false,
        fichier: null,
        fichierNouveau: null,
        fichierTypeId: null,
        typeId: ''
      }
    },

    documentPopupTitle() {
      return `${this.activite.type.nom} | ${getPeriode(
        this.activite.type.frequenceId,
        this.activite.periodeId
      )} ${this.activite.annee}`
    },

    statutNom() {
      return this.isEnConstruction && !this.isActiviteDeposable
        ? `${this.activite.statut.nom} (incomplet)`
        : this.activite.statut.nom
    },

    isEnConstruction() {
      return this.activite.statut.id === 'enc'
    },

    isActiviteDeposable() {
      return this.activite.deposable === true
    },

    shouldDisplayHelp() {
      return (
        this.isEnConstruction &&
        this.isActiviteDeposable &&
        ['grp', 'gra'].includes(this.activite.type.id)
      )
    }
  },

  created() {
    this.opened = this.initialOpened
  },

  methods: {
    getPeriodeVue(frequenceId, periodeId) {
      return getPeriode(frequenceId, periodeId)
    },
    close() {
      this.opened = false
    },

    toggle() {
      this.opened = !this.opened
    },

    activiteRemovePopupOpen() {
      this.$store.commit('popupOpen', {
        component: RemovePopup,
        props: {
          activiteId: this.activite.id,
          typeNom: this.activite.type.nom,
          annee: this.activite.annee,
          periodeNom: getPeriode(
            this.activite.type.frequenceId,
            this.activite.periodeId
          ),
          route: this.route
        }
      })
    },

    dateFormat(date) {
      return dateFormat(date)
    }
  }
}
</script>
