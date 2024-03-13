<template>
  <div class="mb">
    <Bloc v-if="stepType" id="step-type" :step="stepType" :complete="typeComplete">
      <DateEdit v-if="userIsAdmin" :date="etape.date" :onDateChanged="onDateChanged" />

      <TypeEdit :etape="etape" :etapeDate="etape.date" :demarcheId="etape.titreDemarcheId" :apiClient="apiClient" :onEtapeChange="onEtapeTypeChange" />
    </Bloc>

    <Bloc v-if="stepFondamentales" id="step-fondamentales" :step="stepFondamentales" :complete="stepFondamentalesComplete">
      <FondamentalesEdit
        :etape="etape"
        :demarcheTypeId="demarcheTypeId"
        :titreTypeId="titreTypeId"
        :user="user"
        :entreprises="entreprises"
        @update:etape="newValue => $emit('update:etape', newValue)"
        @complete-update="fondamentalesCompleteUpdate"
      />
    </Bloc>

    <Bloc v-if="stepPoints" id="step-points" :step="stepPoints" :complete="stepPerimetreComplete">
      <PerimetreEdit
        :etape="etape"
        :titreTypeId="titreTypeId"
        :titreSlug="titreSlug"
        :apiClient="apiClient"
        :onEtapeChange="onEtapePerimetreChange"
        :onPointsChange="onEtapePointsChange"
        :onForagesChange="onEtapeForagesChange"
        :completeUpdate="perimetreCompleteUpdate"
      />
    </Bloc>

    <Bloc v-if="stepSections" id="step-sections" :step="stepSections" :complete="stepSectionsComplete">
      <SectionsEdit :etape="etape" :sections="sections" @update:etape="newValue => $emit('update:etape', newValue)" @complete-update="sectionsCompleteUpdate" @sections-update="sectionsUpdate" />
    </Bloc>

    <Bloc v-if="stepDocuments" id="step-documents" :step="stepDocuments" :complete="stepDocumentsComplete">
      <DocumentsEdit
        v-model:documents="etape.documents"
        :addAction="{ name: 'titreEtapeEdition/documentAdd' }"
        :removeAction="{ name: 'titreEtapeEdition/documentRemove' }"
        :documentPopupTitle="documentPopupTitle"
        :documentsTypes="documentsTypes"
        :date="etape.date"
        :user="user"
        @complete-update="documentsCompleteUpdate"
      />
    </Bloc>

    <Bloc v-if="stepEntrepriseDocuments" id="step-entrepriseDocuments" :step="stepEntrepriseDocuments" :complete="stepEntrepriseDocumentsComplete">
      <EntrepriseDocumentsEdit :entreprises="titulairesAndAmodiataires" :apiClient="apiClient" :tde="tde" :etapeId="etape.id" :completeUpdate="entrepriseDocumentsCompleteUpdate" />
    </Bloc>

    <Bloc v-if="stepDecisionsAnnexes" id="step-decisionsAnnexes" :step="stepDecisionsAnnexes" :complete="stepDecisionsAnnexesComplete">
      <DecisionsAnnexesEdit :etape="etape" @complete-update="decisionsAnnexesComplete = $event" />
    </Bloc>

    <div class="dsfr">
      <div class="fr-input-group">
        <label class="fr-label" for="notes">Notes</label>
        <textarea id="notes" v-model="etape.notes" class="fr-input" name="notes"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { TypeEdit } from './type-edit'
import { Bloc } from './bloc'
import { DateEdit } from './date-edit'
import { FondamentalesEdit } from './fondamentales-edit'
import { PerimetreEdit } from './perimetre-edit'
import SectionsEdit from './sections-edit.vue'
import DocumentsEdit from '../document/multi-edit.vue'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import DecisionsAnnexesEdit from './decisions-annexes-edit.vue'
import { apiClient } from '../../api/api-client'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper } from 'camino-common/src/roles'

export default {
  components: {
    DecisionsAnnexesEdit,
    Bloc,
    TypeEdit,
    FondamentalesEdit,
    PerimetreEdit,
    SectionsEdit,
    DocumentsEdit,
    EntrepriseDocumentsEdit,
    DateEdit,
  },

  props: {
    etape: { type: Object, required: true },
    demarcheTypeId: { type: String, required: true },
    etapeType: { type: Object, default: null },
    titreTypeId: { type: String, required: true },
    titreSlug: { type: String, required: true },
    user: { type: Object, required: true },
    etapeIsDemandeEnConstruction: { type: Boolean, required: true },
    documentPopupTitle: { type: String, required: true },
  },

  emits: ['complete-update', 'type-complete-update', 'change', 'update:etape', 'alertes-update'],

  data() {
    return {
      fondamentalesComplete: false,
      perimetreComplete: false,
      sectionsComplete: false,
      documentsComplete: false,
      entrepriseDocumentsComplete: false,
      decisionsAnnexesComplete: false,
      entrepriseDocuments: false,
      help: {},
      apiClient,
    }
  },

  computed: {
    tde() {
      return {
        titreTypeId: this.titreTypeId,
        demarcheTypeId: this.demarcheTypeId,
        etapeTypeId: this.etapeType?.id,
      }
    },
    documentsTypes() {
      return this.$store.getters['titreEtapeEdition/documentsTypes']
    },

    entreprises() {
      return this.$store.state.titreEtapeEdition.metas.entreprises
    },

    titulairesAndAmodiataires() {
      const titulaireIds = this.etape.titulaires.map(({ id }) => id)
      const amodiatairesIds = this.etape.amodiataires.map(({ id }) => id)

      return this.entreprises.filter(({ id }) => titulaireIds.includes(id) || amodiatairesIds.includes(id))
    },

    heritageLoaded() {
      return this.$store.state.titreEtapeEdition.heritageLoaded
    },

    typeComplete() {
      if (!this.stepType) {
        return true
      }

      if (!this.etape.date || !this.etape.typeId) {
        return false
      }

      if (this.userIsAdmin && this.etapeIsDemandeEnConstruction) {
        return true
      }

      return !!this.etape.statutId
    },

    complete() {
      return (
        this.typeComplete &&
        this.stepFondamentalesComplete &&
        this.stepPerimetreComplete &&
        this.stepSectionsComplete &&
        this.stepDocumentsComplete &&
        this.stepEntrepriseDocumentsComplete &&
        this.stepDecisionsAnnexesComplete
      )
    },

    stepFondamentalesComplete() {
      return !this.stepFondamentales || this.fondamentalesComplete
    },

    stepPerimetreComplete() {
      return !this.stepFondamentales || this.perimetreComplete
    },

    stepSectionsComplete() {
      return !this.stepSections || this.sectionsComplete
    },

    stepDocumentsComplete() {
      return !this.stepDocuments || this.documentsComplete
    },

    stepEntrepriseDocumentsComplete() {
      return !this.stepEntrepriseDocuments || this.entrepriseDocumentsComplete
    },

    stepDecisionsAnnexesComplete() {
      return !this.stepDecisionsAnnexes || this.decisionsAnnexesComplete
    },

    steps() {
      const steps = []

      if (this.userIsAdmin) {
        steps.push({
          id: 'type',
          name: 'Type',
        })
      }

      if (this.heritageLoaded && this.etapeType?.fondamentale) {
        steps.push({
          id: 'fondamentales',
          name: 'Propriétés',
        })
        steps.push({
          id: 'points',
          name: 'Périmètre',
        })
      }

      if (this.heritageLoaded && this.sections?.length) {
        steps.push({ id: 'sections', name: 'Propriétés spécifiques' })
      }

      const hasDocuments = this.etapeType?.id ? getDocuments(this.titreTypeId, this.demarcheTypeId, this.etapeType?.id).length > 0 : false

      if (this.heritageLoaded && hasDocuments) {
        steps.push({
          id: 'documents',
          name: `Documents liés à l’étape ${EtapesTypes[this.etape.typeId].nom}`,
        })
      }

      const hasEntrepriseDocuments = this.etapeType?.id ? getEntrepriseDocuments(this.titreTypeId, this.demarcheTypeId, this.etapeType?.id).length > 0 : false

      if (this.heritageLoaded && hasEntrepriseDocuments) {
        steps.push({ id: 'entrepriseDocuments', name: 'Documents d’entreprise' })
      }

      if (this.etape.decisionsAnnexesSections) {
        steps.push({ id: 'decisionsAnnexes', name: 'Décisions annexes' })
      }

      const titreTypeHelp = this.help[this.titreTypeId]
      if (titreTypeHelp) {
        steps.forEach(step => {
          step.help = titreTypeHelp[step.id]
        })
      }

      return steps
    },

    stepType() {
      return this.steps.find(s => s.id === 'type')
    },

    stepFondamentales() {
      return this.steps.find(s => s.id === 'fondamentales')
    },

    stepPoints() {
      return this.steps.find(s => s.id === 'points')
    },

    stepSections() {
      return this.steps.find(s => s.id === 'sections')
    },

    stepDocuments() {
      return this.steps.find(s => s.id === 'documents')
    },

    stepEntrepriseDocuments() {
      return this.steps.find(s => s.id === 'entrepriseDocuments')
    },

    stepDecisionsAnnexes() {
      return this.steps.find(s => s.id === 'decisionsAnnexes')
    },

    userIsAdmin() {
      return isSuper(this.user) || isAdministrationAdmin(this.user) || isAdministrationEditeur(this.user)
    },

    sections() {
      try {
        return getSections(this.titreTypeId, this.demarcheTypeId, this.etapeType.id)
      } catch (e) {
        return []
      }
    },
  },

  watch: {
    complete: 'completeUpdate',

    etape: {
      handler: function () {
        this.$emit('change')
      },
      deep: true,
    },
  },

  created() {
    this.$emit('type-complete-update', this.typeComplete)
    this.completeUpdate()

    if (this.etapeType?.id === 'mfr') {
      this.help.arm = {
        sections: 'Ce bloc permet de savoir si la prospection est mécanisée ou non et s’il y a des franchissements de cours d’eau (si oui, combien ?)',
        documents: 'Toutes les pièces obligatoires, spécifiques à la demande, doivent être déposées dans cette rubrique en format pdf.',
        entrepriseDocuments:
          "Les documents d’entreprise sont des documents propres à l'entreprise, et pourront être réutilisés pour la création d'un autre dossier et mis à jour si nécessaire. Ces documents d’entreprise sont consultables dans la fiche entreprise de votre société. Cette section permet de protéger et de centraliser les informations d'ordre privé relatives à la société et à son personnel.",
      }

      this.help.axm = this.help.arm
    }
  },

  methods: {
    fondamentalesCompleteUpdate(complete) {
      this.fondamentalesComplete = complete
    },

    perimetreCompleteUpdate(complete) {
      this.perimetreComplete = complete
    },

    documentsCompleteUpdate(complete) {
      this.documentsComplete = complete
    },

    entrepriseDocumentsCompleteUpdate(entrepriseDocumentIds, complete) {
      this.etape.entrepriseDocumentIds = entrepriseDocumentIds
      this.entrepriseDocumentsComplete = complete
    },

    sectionsCompleteUpdate(complete) {
      this.sectionsComplete = complete
    },

    async sectionsUpdate() {
      await this.$store.dispatch('titreEtapeEdition/documentInit', this.etape.documents)
    },

    completeUpdate() {
      this.$emit('complete-update', this.complete)
    },

    onDateChanged(date) {
      this.etape.date = date
      this.$emit('update:etape', this.etape)
    },

    async onEtapeTypeChange(etapeStatutId, etapeTypeId) {
      if (this.etape.typeId !== etapeTypeId) {
        await this.$store.dispatch('titreEtapeEdition/heritageGet', {
          ...this.tde,
          etapeTypeId,
        })
      }
      // TODO 2023-01-13 Il faut que les données soient mises après l'appel au store, sinon l'étape est réinitialisée.
      // Pour que ça soit propre, il faut arrêter de bouger le même objet pour diverses raisons, et maintenir une étape minimaliste à part
      this.etape.statutId = etapeStatutId
      this.etape.typeId = etapeTypeId
      this.$emit('type-complete-update', this.typeComplete)
      this.$emit('update:etape', this.etape)
    },

    onEtapePerimetreChange(perimetreInfos) {
      // TODO 2023-01-13 Il faut que les données soient mises après l'appel au store, sinon l'étape est réinitialisée.
      // Pour que ça soit propre, il faut arrêter de bouger le même objet pour diverses raisons, et maintenir une étape minimaliste à part
      this.etape.geojson4326Perimetre = perimetreInfos.geojson4326_perimetre
      this.etape.geojson4326Points = perimetreInfos.geojson4326_points
      this.etape.geojsonOriginePerimetre = perimetreInfos.geojson_origine_perimetre
      this.etape.geojsonOriginePoints = perimetreInfos.geojson_origine_points
      this.etape.geojsonOrigineGeoSystemeId = perimetreInfos.geojson_origine_geo_systeme_id

      this.etape.geojson4326Forages = perimetreInfos.geojson4326_forages
      this.etape.geojsonOrigineForages = perimetreInfos.geojson_origine_forages

      this.$emit('alertes-update', { superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
      this.$emit('update:etape', this.etape)
    },
    onEtapePointsChange(geojson4326Points, geojsonOriginePoints) {
      this.etape.geojson4326Points = geojson4326Points
      this.etape.geojsonOriginePoints = geojsonOriginePoints
      this.$emit('update:etape', this.etape)
    },
    onEtapeForagessChange(geojson4326Forages, geojsonOrigineForages) {
      this.etape.geojson4326Forages = geojson4326Forages
      this.etape.geojsonOrigineForages = geojsonOrigineForages
      this.$emit('update:etape', this.etape)
    },
  },
}
</script>
