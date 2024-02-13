<template>
  <div v-if="loaded">
    <p>
      <router-link :to="{ name: 'titre', params: { id: titre.slug } }" class="cap-first">
        {{ titre.nom }}
      </router-link>
      <span class="color-neutral"> | </span>
      <span class="cap-first"> {{ demarcheType.nom }} {{ demarcheDescription }} </span>
    </p>
    <h1 style="margin: 0">Étape</h1>

    <div v-if="helpVisible" class="p-s bg-info color-bg mb">
      Besoin d'aide pour déposer votre demande ?
      <a target="_blank" class="p-s bg-info color-bg mb" href="https://camino.gitbook.io/guide-dutilisation/a-propos/contact" rel="noopener noreferrer" title="Page contact - site externe"
        >Contactez-nous</a
      >
    </div>

    <div v-if="dateIsVisible" class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Date</h5>
      </div>
      <div class="tablet-blob-2-3">
        <InputDate :initialValue="newDate" :dateChanged="dateChanged" class="mb" />
      </div>
    </div>

    <Edit
      v-else
      :etape="editedEtape"
      :demarcheTypeId="demarcheType.id"
      :user="user"
      :etapeIsDemandeEnConstruction="etapeIsDemandeEnConstruction"
      :titreTypeId="titre.typeId"
      :titreSlug="titre.slug"
      :documentPopupTitle="documentPopupTitle"
      :etapeType="etapeType"
      @complete-update="completeUpdate"
      @type-complete-update="typeCompleteUpdate"
      @change="editChange"
      @alertes-update="alertesUpdate"
    />

    <div v-if="loading" class="tablet-blobs">
      <div class="tablet-blob-1-3" />
      <div class="tablet-blob-2-3">
        <div class="p-s bold mb">Enregistrement en cours…</div>
      </div>
    </div>

    <div v-else-if="dateIsVisible" class="tablet-blobs mb">
      <div class="tablet-blob-1-3" />
      <div class="tablet-blob-2-3">
        <button ref="date-button" class="btn btn-primary" :disabled="!newDate" :class="{ disabled: !newDate }" @click="dateUpdate">Valider</button>
      </div>
    </div>

    <div v-else ref="save-btn-container" class="tablet-blobs pb-m pt-m bg-bg b-0 sticky" style="z-index: 100000">
      <div class="tablet-blob-1-3" />
      <FormSaveBtn ref="save-btn" :alertes="alertes" :canSave="isFormComplete" :canDepose="complete" :showDepose="etapeIsDemandeEnConstruction" @save="save" @depose="depose" />
    </div>
  </div>
</template>

<script>
import { cap, dateFormat } from '@/utils'
import { InputDate } from './_ui/input-date'
import Edit from './etape/edit.vue'
import { getCurrent } from 'camino-common/src/date'
import FormSaveBtn from './etape/pure-form-save-btn.vue'
import DeposePopup from './etape/depose-popup.vue'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { SDOMZoneIds, SDOMZones } from 'camino-common/src/static/sdom'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TitresStatutIds, TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { documentTypeIdsBySdomZonesGet } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sdom'
import { apiClient } from '../api/api-client'

// TODO 2023-06-14 Revoir comment est gérer le droit de déposer l’étape
export default {
  components: { Edit, InputDate, FormSaveBtn },

  beforeRouteLeave(_, __, next) {
    if (this.isFormDirty && !confirm(this.promptMsg)) {
      next(false)
    } else {
      next()
    }
  },

  data() {
    return {
      complete: false,
      isFormDirty: false,
      typeComplete: false,
      promptMsg: 'Quitter le formulaire sans enregistrer les changements ?',
      newDate: getCurrent(),
      sdomZoneIds: [],
      superposition_alertes: [],
    }
  },

  computed: {
    loaded() {
      return this.$store.state.titreEtapeEdition.loaded
    },

    user() {
      return this.$store.state.user.element
    },

    etapeId() {
      return this.$route.params.id
    },

    editedEtape() {
      return this.$store.state.titreEtapeEdition.element
    },

    etapeType() {
      return this.$store.getters['titreEtapeEdition/etapeType']
    },

    demarche() {
      return this.$store.state.titreEtapeEdition.metas.demarche
    },

    demarcheDescription() {
      return this.demarche?.description ? `(${this.demarche.description})` : ''
    },

    alertes() {
      const alertes = []
      if (this.superposition_alertes.length > 0) {
        alertes.push(
          ...this.superposition_alertes.map(t => ({
            message: `Le titre ${t.nom} au statut « ${isNotNullNorUndefined(t.titre_statut_id) ? TitresStatuts[t.titre_statut_id].nom : ''} » est superposé à ce titre`,
            url: `/titres/${t.slug}`,
          }))
        )
      }

      // si c’est une demande d’AXM, on doit afficher une alerte si on est en zone 0 ou 1 du Sdom
      if (['mfr', 'mcr'].includes(this.etapeType?.id) && this.titre.typeId === 'axm') {
        const zoneId = this.sdomZoneIds.find(id => [SDOMZoneIds.Zone0, SDOMZoneIds.Zone0Potentielle, SDOMZoneIds.Zone1].includes(id))
        if (zoneId) {
          alertes.push({ message: `Le périmètre renseigné est dans une zone du Sdom interdite à l’exploitation minière : ${SDOMZones[zoneId].nom}` })
        }
      }

      return alertes
    },

    demarcheType() {
      return DemarchesTypes[this.demarche.typeId]
    },

    titre() {
      return this.demarche.titre
    },

    dateIsVisible() {
      return !this.editedEtape?.date
    },

    loading() {
      return this.$store.state.loading.includes('titreEtapeUpdate') || this.$store.state.loading.includes('titreEtapeMetasGet') || this.$store.state.loading.includes('titreEtapeGet')
    },

    etapeIsDemandeEnConstruction() {
      return this.etapeType?.id === 'mfr' && this.editedEtape?.statutId === 'aco'
    },

    isPopupOpen() {
      return !!this.$store.state.popup.component
    },

    isFormComplete() {
      return (this.etapeIsDemandeEnConstruction && this.typeComplete) || this.complete
    },

    documentPopupTitle() {
      return `${cap(this.titre.nom)} | ${cap(this.demarcheType.nom)} | ${this.etapeType ? cap(this.etapeType.nom) : ''}`
    },

    userIsAdmin() {
      return this.$store.getters['user/userIsAdmin']
    },

    helpVisible() {
      return !this.userIsAdmin && ['axm', 'arm'].includes(this.titre.typeId) && this.etapeType?.id === 'mfr'
    },
  },

  watch: {
    user: 'init',
  },

  async created() {
    await this.init()

    document.addEventListener('keyup', this.keyUp)
    window.addEventListener('beforeunload', this.beforeWindowUnload)
  },

  beforeUnmount() {
    document.removeEventListener('keyup', this.keyUp)
    window.removeEventListener('beforeunload', this.beforeWindowUnload)
  },

  unmounted() {
    this.$store.commit('titreEtapeEdition/reset')
  },

  methods: {
    dateChanged(date) {
      this.newDate = date
    },
    async init() {
      const titreDemarcheId = this.$route.query['demarche-id']
      await this.$store.dispatch('titreEtapeEdition/init', {
        titreDemarcheId,
        id: this.etapeId,
        date: this.newDate,
      })

      let perimetreInfos = null
      if (isNotNullNorUndefined(this.etapeId)) {
        perimetreInfos = await apiClient.getPerimetreInfosByEtapeId(this.etapeId)
      } else {
        perimetreInfos = await apiClient.getPerimetreInfosByDemarcheId(titreDemarcheId)
      }
      this.alertesUpdate(perimetreInfos)
    },

    beforeWindowUnload(e) {
      if (!this.isFormDirty) return true
      e.returnValue = this.promptMsg
      return this.promptMsg
    },

    async reroute(titreEtapeId) {
      // TODO 2023-09-21 il faut automatiquement déplier l'étape et aller sur l'ancre
      await this.$router.push({
        name: 'titre',
        params: { id: this.titre.id },
        query: { demarcheSlug: this.demarche.slug },
        hash: `#${titreEtapeId}`,
      })
    },

    async save(reroute = true) {
      this.isFormDirty = false

      if (this.isFormComplete) {
        const titreEtapeId = await this.$store.dispatch('titreEtapeEdition/upsert', {
          etape: this.editedEtape,
        })

        if (titreEtapeId) {
          if (reroute) {
            await this.reroute(titreEtapeId)
          }

          this.eventTrack({
            categorie: 'titre-etape',
            action: 'titre-etape-enregistrer',
            nom: titreEtapeId,
          })
        }
        return titreEtapeId
      }

      return undefined
    },

    async depose() {
      if (this.complete) {
        const etapeId = await this.save(false)

        if (etapeId) {
          this.$store.commit('popupOpen', {
            component: DeposePopup,
            props: {
              etapeId,
              onDepotDone: async () => {
                await this.reroute(etapeId)
                this.eventTrack({
                  categorie: 'titre-etape',
                  action: 'titre-etape_depot',
                  nom: this.$route.params.id,
                })
              },
            },
          })
        }
      }
    },

    eventTrack(event) {
      if (this.$matomo) {
        this.$matomo.trackEvent(event.categorie, event.action, event.nom)
      }
    },

    keyUp(e) {
      if ((e.which || e.keyCode) === 13 && this.complete && !this.isPopupOpen) {
        if (this.dateIsVisible && this.newDate) {
          this.$refs['date-button'].focus()
          this.dateUpdate()
        } else if (!this.dateIsVisible && !this.loading && this.isFormComplete) {
          this.$refs['save-btn'].focusBtn()
          this.save()
        }
      }
    },

    completeUpdate(complete) {
      this.complete = complete
    },

    typeCompleteUpdate(complete) {
      this.typeComplete = complete
    },

    alertesUpdate(infos) {
      this.superposition_alertes = infos.superposition_alertes
      this.sdomZoneIds = infos.sdomZoneIds

      if (isNotNullNorUndefined(this.etapeType)) {
        const documentTypeIds = documentTypeIdsBySdomZonesGet(infos.sdomZoneIds, this.titre.typeId, this.demarche.typeId, this.etapeType.id)

        this.$store.commit('titreEtapeEdition/metasSet', {
          sdomZonesDocumentTypeIds: documentTypeIds,
        })
        this.$store.dispatch('titreEtapeEdition/documentInit', this.editedEtape.documents)
      }
    },

    editChange() {
      if (!this.loaded) return
      this.isFormDirty = true
    },

    async dateUpdate() {
      await this.$store.dispatch('titreEtapeEdition/dateUpdate', {
        date: this.newDate,
      })
    },

    dateFormat(date) {
      return dateFormat(date)
    },
  },
}
</script>
