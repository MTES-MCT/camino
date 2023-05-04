<template>
  <Accordion :id="etape.id" :opened="opened" class="mb-s" :slotDefault="hasSections || hasFondamentales || hasDocuments" :slotButtons="canEdit" @close="close" @toggle="toggle">
    <template #title>
      <h5>
        {{ dateFormat(etape.date) }}
        <Tag v-if="etape.incertitudes && etape.incertitudes.date" :mini="true" color="bg-info" class="ml-xs" text="Incertain" />
      </h5>

      <h3 class="cap-first mb-s">{{ etape.type.nom }}</h3>

      <div class="mb-xs flex flex-center">
        <Statut :color="etapeStatut.couleur" :nom="statutNom" />

        <HelpTooltip v-if="demandeHelp" :text="demandeHelp" class="ml-m" />
      </div>
    </template>

    <template v-if="canEdit" #buttons>
      <button v-if="etapeIsDemandeEnConstruction" class="btn btn-primary flex small rnd-0" :disabled="!etape.deposable" :class="{ disabled: !etape.deposable }" @click="etapeDepot">
        <span class="mt-xxs mb-xxs">Déposer…</span>
      </button>

      <button class="btn py-s px-m mr-px" @click="etapeEdit">
        <Icon size="M" name="pencil" />
      </button>

      <button class="btn py-s px-m mr-px" @click="removePopupOpen">
        <Icon size="M" name="delete" />
      </button>
    </template>

    <div class="px pt-m">
      <div v-if="hasFondamentales">
        <Fondamentales :etape="etape" />

        <Perimetre v-if="etape.points && etape.points.length" :etape="etape" :titreTypeId="titreTypeId" :geojsonMultiPolygon="etape.geojsonMultiPolygon" :incertitude="!!etape.incertitudes?.points" />
        <hr class="mx--" />
      </div>

      <div v-if="sections?.length">
        <UiSection v-for="s in sections" :key="s.id" :section="s" :contenu="etape.contenu ? etape.contenu[s.id] : {}" :date="etape.date" @file-download="fileDownload($event)" />

        <hr class="mx--" />
      </div>

      <div v-if="etape.documents?.length">
        <h4>Documents</h4>
        <Documents
          :boutonSuppression="false"
          :boutonModification="false"
          :documents="etape.documents"
          :etiquette="canEdit"
          :parentId="etape.id"
          :parentTypeId="etape.type.id"
          repertoire="demarches"
          :title="documentPopupTitle"
        />

        <hr class="mx--" />
      </div>

      <div v-if="etape.justificatifs?.length">
        <h4>Justificatifs</h4>
        <Documents
          :boutonDissociation="false"
          :boutonModification="false"
          :boutonSuppression="false"
          :documents="etape.justificatifs"
          :etiquette="canEdit"
          :parentId="etape.id"
          :parentTypeId="etape.type.id"
          repertoire="'entreprises'"
          :title="documentPopupTitle"
        />

        <hr class="mx--" />
      </div>

      <div v-if="etape.decisionsAnnexesSections && etape.decisionsAnnexesContenu">
        <UiSection
          v-for="s in etape.decisionsAnnexesSections"
          :key="s.id"
          :section="s"
          :contenu="etape.decisionsAnnexesContenu[s.id] || {}"
          :etapeId="etape.id"
          @file-download="fileDownload($event)"
        />

        <hr class="mx--" />
      </div>

      <div v-if="canDownloadZip" class="flex">
        <span class="small bold mb-0 mt-s flex-grow text-right mr-l pt-xs"> Télécharger l'ensemble de la demande dans un fichier .zip </span>
        <button class="btn-border rnd-xs flex-right py-s px-m mb-m" @click="demandeDownload">
          <Icon size="M" name="download" />
        </button>
      </div>
    </div>
  </Accordion>
</template>

<script>
import { dateFormat, cap } from '@/utils'
import { Perimetre } from './perimetre'
import { Fondamentales } from './fondamentales'
import UiSection from '../_common/section.vue'
import Documents from '../documents/list.vue'
import Accordion from '../_ui/accordion.vue'
import { Tag } from '../_ui/tag'
import { Statut } from '../_common/statut'
import RemovePopup from './remove.vue'
import DeposePopup from './depose-popup.vue'
import { HelpTooltip } from '../_ui/help-tooltip'
import { Icon } from '@/components/_ui/icon'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { canCreateOrEditEtape } from 'camino-common/src/permissions/titres-etapes'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'

export default {
  components: {
    Icon,
    HelpTooltip,
    Accordion,
    Tag,
    Statut,
    Perimetre,
    Fondamentales,
    UiSection,
    Documents,
  },

  props: {
    etape: { type: Object, required: true },
    demarcheTypeId: { type: String, required: true },
    titreTypeId: { type: String, required: true },
    titreNom: { type: String, required: true },
    titreId: { type: String, required: true },
    opened: { type: Boolean, default: false },
    titreStatutId: { type: String, required: true },
    titreAdministrations: { type: Array, required: true },
    user: { type: Object, required: true },
  },

  emits: ['close', 'toggle'],

  computed: {
    route() {
      return {
        name: 'titre',
        section: 'etapes',
        id: this.titreId,
      }
    },

    demarcheType() {
      return DemarchesTypes[this.demarcheTypeId]
    },

    documentPopupTitle() {
      return `${cap(this.titreNom)} | ${cap(this.demarcheType.nom)} | ${cap(this.etape.type.nom)}`
    },

    etapeIsDemandeEnConstruction() {
      return this.etape.type.id === 'mfr' && this.etapeStatut.id === 'aco'
    },

    hasFondamentales() {
      return (
        !!this.etape.duree ||
        !!this.etape.surface ||
        !!this.etape.dateDebut ||
        !!this.etape.dateFin ||
        !!(this.etape.points && this.etape.points.length) ||
        !!(this.etape.substances && this.etape.substances.length) ||
        !!(this.etape.titulaires && this.etape.titulaires.length) ||
        !!(this.etape.amodiataires && this.etape.amodiataires.length)
      )
    },

    hasSections() {
      return !!this.sections?.length
    },

    hasDocuments() {
      return this.etape.documents && !!this.etape.documents.length
    },

    hasJustificatifs() {
      return this.etape.justificatifs && !!this.etape.justificatifs.length
    },

    statutNom() {
      return this.etapeIsDemandeEnConstruction && !this.etape.deposable ? `${this.etapeStatut.nom} (incomplet)` : this.etapeStatut.nom
    },

    userIsAdmin() {
      return this.$store.getters['user/userIsAdmin']
    },

    canDownloadZip() {
      return this.etape.type.id === 'mfr' && (this.hasDocuments || this.hasJustificatifs)
    },
    etapeStatut() {
      return EtapesStatuts[this.etape.statutId]
    },
    demandeHelp() {
      if (!this.userIsAdmin && this.etape.type.id === 'mfr') {
        if (['arm', 'axm'].includes(this.titreTypeId)) {
          if (this.etapeStatut.id === 'aco') {
            return 'Si vous avez ajouté tous les documents spécifiques à la demande et justificatifs d’entreprise, et que vous considérez que votre demande est complète, vous pouvez la déposer en cliquant sur « Déposer … ». L’ONF et le PTMG seront ainsi notifiés et pourront instruire votre demande.'
          } else {
            return 'Votre demande est bien déposée. L’ONF et le PTMG instruisent votre demande.'
          }
        }
      }

      return null
    },
    canEdit() {
      return canCreateOrEditEtape(
        this.user,
        this.etape.type.id,
        this.etape.statutId,
        this.etape.titulaires,
        this.titreAdministrations,
        this.demarcheType.id,
        { typeId: this.titreTypeId, titreStatutId: this.titreStatutId },
        'modification'
      )
    },

    sections() {
      try {
        return getSections(this.titreTypeId, this.demarcheTypeId, this.etape.type.id)
      } catch (e) {
        return []
      }
    },
  },

  methods: {
    dateFormat(date) {
      return dateFormat(date)
    },

    close() {
      this.$emit('close')
    },

    toggle() {
      this.$emit('toggle')
    },

    async demandeDownload() {
      await this.$store.dispatch('download', `/etape/zip/${this.etape.id}`)
    },

    etapeEdit() {
      this.$router.push({
        name: 'etape-edition',
        params: { id: this.etape.slug },
      })

      this.eventTrack({
        categorie: 'titre-etape',
        action: 'titre-etape_editer',
        nom: this.$route.params.id,
      })
    },

    etapeDepot() {
      this.$store.commit('popupOpen', {
        component: DeposePopup,
        props: {
          etapeId: this.etape.id,
          onDepotDone: () => this.$store.dispatch(`titre/get`, this.titreId),
        },
      })

      this.eventTrack({
        categorie: 'titre-etape',
        action: 'titre-etape_depot',
        nom: this.$route.params.id,
      })
    },

    removePopupOpen() {
      this.$store.commit('popupOpen', {
        component: RemovePopup,
        props: {
          etapeTypeNom: this.etape.type.nom,
          etapeId: this.etape.id,
          demarcheTypeNom: this.demarcheType.nom,
          titreNom: this.titreNom,
          titreTypeNom: TitresTypesTypes[getTitreTypeType(this.titreTypeId)].nom,
        },
      })

      this.eventTrack({
        categorie: 'titre-etape',
        action: 'supprimer une étape',
        nom: this.$route.params.id,
      })
    },

    eventTrack(event) {
      if (this.$matomo) {
        this.$matomo.trackEvent(event.categorie, event.action, event.nom)
      }
    },

    fileDownload(fileName) {
      this.$store.dispatch('download', `/etape/${this.etape.id}/${fileName}`)
    },
  },
}
</script>
