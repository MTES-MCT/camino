<template>
  <Loader v-if="!loaded" />
  <div v-else>
    <div v-if="titre.doublonTitre?.id" class="p-m bg-warning color-bg mb">
      Ce titre est un doublon. Le titre déjà existant est :
      <a class="color-bg" :href="`/titres/${titre.doublonTitre.id}`">{{ titre.doublonTitre.nom }}</a
      >.
    </div>

    <TitreHeader :titre="titre" :titreEventTrack="eventTrack" />

    <TitreInfos :titre="titre" :user="user" :apiClient="apiClient()" class="mb" />

    <Perimetre
      v-if="titre.geojsonMultiPolygon && titre.points"
      :titreId="titre.id"
      :titreTypeId="titre.typeId"
      :points="titre.points"
      :isMain="true"
      :tabId="geoTabId"
      :geojsonMultiPolygon="titre.geojsonMultiPolygon"
      :tabUpdate="geoTabUpdate"
    />

    <TitreTerritoires
      :titreId="titre.id"
      :forets="titre.forets ?? []"
      :sdomZones="titre.sdomZones ?? []"
      :surface="titre.surface ?? 0"
      :secteursMaritimes="titre.secteursMaritime ?? []"
      :apiClient="apiClient()"
    />

    <div class="line width-full mb-xl" />

    <Repertoire :user="user" :titreTypeId="titre.typeId" :titulaires="titre.titulaires" :amodiataires="titre.amodiataires" :administrations="titre.administrations" :eventTrack="eventTrack" />

    <div v-if="tabs.length > 1">
      <div class="flex">
        <div v-for="tab in tabs" :key="tab.id" class="mr-xs" :class="{ active: tabId === tab.id }">
          <button :id="`cmn-titre-tab-${tab.id}`" class="p-m btn-tab rnd-t-s" style="display: flex" @click="tabUpdate(tab.id)">
            {{ tab.nom }}
            <ActivitesPills v-if="tab.id === 'activites'" style="margin-left: 5px" :activitesAbsentes="titre.activitesAbsentes" :activitesEnConstruction="titre.activitesEnConstruction" />
          </button>
        </div>
      </div>
      <div class="line-neutral width-full mb" />
    </div>

    <TitreDemarches v-if="tabId === 'demarches'" :user="user" :demarches="demarches" :tabId="tabId" @event-track="eventTrack" />

    FIXME LES ACTIVITES NE SONT PLUS CHARGEES EN MEME TEMPS QUE LE TITRE
    <TitreActivitesList v-if="tabId === 'activites'" :activites="titre.activites" :titreId="titre.id" />

    <TitreDemarches v-if="tabId === 'travaux'" :demarches="travaux" :tabId="tabId" :user="user" @titre-event-track="eventTrack" />

    <Journaux v-if="tabId === 'journaux'" :apiClient="apiClient()" :titreId="titre.id" />
  </div>
</template>

<script>
import Loader from './_ui/loader.vue'
import { Perimetre } from './_common/perimetre'
import { ActivitesPills } from './activites/activites-pills'
import { Header as TitreHeader } from './titre/header'
import { Infos as TitreInfos } from './titre/infos'
import { Territoires as TitreTerritoires } from './titre/territoires'
import { Repertoire } from './titre/repertoire'
import TitreDemarches from './titre/demarches.vue'
import TitreActivitesList from './activites/list.vue'
import { defineAsyncComponent } from 'vue'
import { apiClient } from '@/api/api-client'

export default {
  components: {
    Loader,
    ActivitesPills,
    TitreHeader,
    TitreInfos,
    TitreTerritoires,
    Repertoire,
    TitreDemarches,
    TitreActivitesList,
    Perimetre,
    Journaux: defineAsyncComponent(async () => {
      const { Journaux } = await import('./journaux/journaux')
      return Journaux
    }),
  },

  data() {
    return {
      geoTabId: 'carte',
      show: false,
    }
  },

  computed: {
    titre() {
      return this.$store.state.titre.element
    },

    user() {
      return this.$store.state.user.element
    },

    loaded() {
      return !!this.titre
    },

    tabs() {
      return this.$store.getters['titre/tabs']
    },

    tabId() {
      return this.$store.getters['titre/tabId']
    },

    demarches() {
      return this.$store.getters['titre/demarches']
    },

    travaux() {
      return this.$store.getters['titre/travaux']
    },
  },

  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'titre' && id) {
        this.get()
      }
    },

    user: 'get',
  },

  async created() {
    await this.get()

    if (this.$route.hash) {
      const yOffset = -88
      const id = this.$route.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset

        window.scrollTo({ top: y })
      }
    }
  },

  beforeUnmount() {
    this.$store.commit('titre/reset')
  },

  methods: {
    apiClient() {
      return apiClient
    },
    async get() {
      const titreId = this.$route.params.id
      await this.$store.dispatch('titre/get', titreId)
    },

    tabUpdate(tabId) {
      this.eventTrack({
        categorie: 'titre-sections',
        action: `titre-${this.tabId}_consulter`,
        nom: this.$store.state.titre.element.id,
      })

      this.$store.commit('titre/openTab', tabId)
    },

    geoTabUpdate(tabId) {
      this.eventTrack({
        categorie: 'titre-sections',
        action: `titre-vue${this.tabId}_consulter`,
        nom: this.$store.state.titre.element.id,
      })

      this.geoTabId = tabId
    },

    eventTrack(event) {
      if (!event.nom) {
        event.nom = this.titre.id
      }

      if (this.$matomo) {
        this.$matomo.trackEvent(event.categorie, event.action, event.nom)
      }
    },
  },
}
</script>
