<template>
  <Accordion :opened="opened" sub="true" :slotDefault="true" :slotButtons="true" @close="close" @toggle="toggle">
    <template #title>
      <h5>
        <span class="cap-first"
          ><span v-if="activite.periodeId && activite.type.frequenceId">{{ getPeriode(activite.type.frequenceId, activite.periodeId) }}</span> {{ activite.annee }}</span
        >
      </h5>
      <div class="flex">
        <h3 class="mb-s">
          <span class="cap-first">{{ activite.type.nom }}</span>
        </h3>
        <HelpTooltip v-if="shouldDisplayHelp" text="Si votre déclaration est complète, cliquez sur déposer. Cliquez sur le crayon pour modifier." class="ml-m" />
      </div>
      <Statut :color="activiteStatut.couleur" :nom="statutNom" class="mb-xs" />
    </template>
    <template #buttons>
      <button v-if="activite.suppression" class="cmn-activite-btn-supprimer btn small py-s px-m flex mr-px" title="supprimer l'activité'" @click="activiteRemovePopupOpen">
        <Icon size="M" name="delete" />
      </button>
      <ActiviteButton v-if="activite.modification" :activite="activite" />
    </template>

    <div>
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="activite.type.description" class="border-b-s px-m pt-m">
        <div class="h6" v-html="activite.type.description" />
      </div>
      <div v-if="activite.dateSaisie" class="border-b-s px-m pt-m">
        <h5>
          Date de
          {{ activite.activiteStatutId === 'dep' ? 'dépôt' : 'modification' }}
        </h5>
        <p>{{ dateFormat(activite.dateSaisie) }}</p>
      </div>

      <UiSection v-for="s in activite.sections" :key="s.id" class="border-b-s px-m pt-m" :section="s" :contenu="activite.contenu ? activite.contenu[s.id] : {}" :date="activite.date" />

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

<script setup lang="ts">
import ActiviteButton from './button.vue'
import Accordion from '../_ui/accordion.vue'
import { HelpTooltip } from '../_ui/help-tooltip'
import UiSection from '../_common/section.vue'
import { Statut } from '../_common/statut'

import Documents from '../documents/list.vue'
import { dateFormat } from '@/utils'
import RemovePopup from './remove-popup.vue'
import { Icon } from '@/components/_ui/icon'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { Activite } from './preview.types'
import { ActivitesStatut, ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'

const props = withDefaults(defineProps<{ activite: Activite; route: unknown; initialOpened: boolean }>(), { initialOpened: false })

const store = useStore()
const opened = ref<boolean>(props.initialOpened)
const activiteStatut = computed<ActivitesStatut>(() => ActivitesStatuts[props.activite.activiteStatutId])

const documentPopupTitle = computed<string>(() => {
  return `${props.activite.type.nom} | ${getPeriode(props.activite.type.frequenceId, props.activite.periodeId)} ${props.activite.annee}`
})

const isEnConstruction = computed<boolean>(() => {
  return props.activite.activiteStatutId === 'enc'
})

const isActiviteDeposable = computed<boolean>(() => {
  return props.activite.deposable === true
})

const statutNom = computed<string>(() => {
  return isEnConstruction.value && !isActiviteDeposable.value ? `${activiteStatut.value.nom} (incomplet)` : activiteStatut.value.nom
})

const shouldDisplayHelp = computed<boolean>(() => {
  return isEnConstruction.value && isActiviteDeposable.value && ['grp', 'gra'].includes(props.activite.type.id)
})

const close = () => {
  opened.value = false
}

const toggle = () => {
  opened.value = !opened.value
}

const activiteRemovePopupOpen = () => {
  store.commit('popupOpen', {
    component: RemovePopup,
    props: {
      activiteId: props.activite.id,
      typeNom: props.activite.type.nom,
      annee: props.activite.annee,
      periodeNom: getPeriode(props.activite.type.frequenceId, props.activite.periodeId),
      route: props.route,
    },
  })
}
</script>
