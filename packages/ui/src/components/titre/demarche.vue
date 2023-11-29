<template>
  <div class="mb-xxl">
    <div class="tablet-blobs mb">
      <div class="tablet-blob-1-2">
        <div class="flex mb-s flex-center">
          <h2 class="cap-first">
            <CaminoRouterLink :title="demarcheType.nom" :to="routeToDemarche">
              {{ demarcheType.nom }}
            </CaminoRouterLink>
          </h2>
          <h3 v-if="demarche.description" class="ml-s">({{ demarche.description }})</h3>
        </div>
        <div class="mb-s">
          <Statut :color="statut.couleur" :nom="statut.nom" />
        </div>
      </div>
      <div class="tablet-blob-1-2 flex">
        <div v-if="demarche.modification || demarche.suppression || canCreateEtape" class="flex-right flex">
          <button
            v-if="canCreateEtape"
            class="btn small rnd-l-xs py-s px-m flex mr-px"
            :class="{
              'rnd-r-xs': !demarche.suppression && !demarche.modification,
            }"
            @click="etapeAdd"
          >
            <span class="mt-xxs">Ajouter une étape…</span>
          </button>
          <ButtonIcon v-if="demarche.modification" class="btn py-s px-m mr-px" :class="{ 'rnd-l-xs': !canCreateEtape }" :onClick="editPopupOpen" title="Modifier la démarche" icon="pencil" />
          <ButtonIcon
            v-if="demarche.suppression"
            class="btn rnd-r-xs py-s px-m mr-px"
            :class="{
              'rnd-l-xs': !demarche.modification && !canCreateEtape,
            }"
            :onClick="removePopupOpen"
            title="Supprimer la démarche"
            icon="delete"
          />
        </div>
      </div>
    </div>

    <TitreEtape
      v-for="etape in etapes"
      :key="etape.id"
      :etape="etape"
      :demarcheTypeId="demarche.typeId"
      :titreTypeId="titreTypeId"
      :titreId="titreId"
      :titreNom="titreNom"
      :opened="etapeOpened[etape.id]"
      :titreStatutId="titreStatutId"
      :titreAdministrations="titreAdministrations"
      :user="user"
      @event-track="eventTrack"
      @toggle="etapeToggle(etape.id)"
    />

    <DemarcheEditPopup
      v-if="openEditPopup"
      :close="() => (openEditPopup = !openEditPopup)"
      :demarche="myDemarche"
      :apiClient="apiClient"
      :titreTypeId="titreTypeId"
      :titreNom="titreNom"
      :tabId="tabId"
    />
    <DemarcheRemovePopup
      v-if="openRemovePopup"
      :close="() => (openRemovePopup = !openRemovePopup)"
      :demarcheId="demarche.id"
      :apiClient="apiClient"
      :titreTypeId="titreTypeId"
      :titreNom="titreNom"
      :titreId="titreId"
      :demarcheTypeId="demarche.typeId"
    />

    <div class="line width-full my-xxl" />
  </div>
</template>

<script>
import { Statut } from '../_common/statut'
import TitreEtape from '../etape/preview.vue'
import { DemarcheEditPopup } from './demarche-edit-popup'
import { DemarcheRemovePopup } from './demarche-remove-popup'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { canCreateEtapeByDemarche } from 'camino-common/src/permissions/titres-demarches'
import { demarcheApiClient } from './demarche-api-client'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { CaminoRouterLink } from '@/router/camino-router-link'

export default {
  components: {
    ButtonIcon,
    Statut,
    TitreEtape,
    DemarcheEditPopup,
    DemarcheRemovePopup,
    CaminoRouterLink,
  },

  props: {
    demarche: { type: Object, required: true },
    titreNom: { type: String, required: true },
    titreId: { type: String, required: true },
    titreTypeId: { type: String, required: true },
    titreStatutId: { type: String, required: true },
    titreAdministrations: { type: Array, required: true },
    tabId: { type: String, required: true },
    user: { type: Object, required: true },
  },

  emits: ['titre-event-track'],

  data: () => {
    return { openEditPopup: false, openRemovePopup: false }
  },
  computed: {
    routeToDemarche() {
      return { name: 'demarche', params: { demarcheId: this.demarche.slug } }
    },
    apiClient() {
      return demarcheApiClient
    },
    demarcheType() {
      return DemarchesTypes[this.demarche.typeId]
    },

    myDemarche() {
      const demarche = {}

      demarche.description = this.demarche.description
      demarche.typeId = this.demarche.typeId
      demarche.titreId = this.titreId
      demarche.id = this.demarche.id

      return demarche
    },

    etapeOpened() {
      return this.$store.state.titre.opened.etapes
    },

    eventPrefix() {
      return this.tabId && this.tabId === 'travaux' ? 'titre-travaux' : 'titre-demarche'
    },

    etapes() {
      return this.demarche.etapes.slice().sort((a, b) => b.ordre - a.ordre)
    },

    statut() {
      return DemarchesStatuts[this.demarche.statutId]
    },

    canCreateEtape() {
      return canCreateEtapeByDemarche(this.user, this.titreTypeId, this.demarche.typeId, this.titreAdministrations, this.titreStatutId)
    },
  },

  methods: {
    editPopupOpen() {
      this.openEditPopup = !this.openEditPopup
      this.eventTrack({
        categorie: 'titre-sections',
        action: `${this.eventPrefix}_editer`,
        nom: this.$route.params.id,
      })
    },

    removePopupOpen() {
      this.openRemovePopup = !this.openRemovePopup
      this.eventTrack({
        categorie: 'titre-sections',
        action: `${this.eventPrefix}_supprimer`,
        nom: this.$route.params.id,
      })
    },

    etapeAdd() {
      this.$router.push({
        name: 'etape-creation',
        query: { 'demarche-id': this.demarche.slug },
      })

      this.eventTrack({
        categorie: 'titre-sections',
        action: 'titre-etape_ajouter',
        nom: this.$route.params.id,
      })
    },

    etapeToggle(id) {
      this.$store.commit('titre/toggle', { section: 'etapes', id })
    },

    eventTrack(event) {
      this.$emit('titre-event-track', event)
    },
  },
}
</script>
