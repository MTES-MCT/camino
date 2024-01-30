<template>
  <div class="mb">
    <Accordion v-if="stepType" id="step-type" :step="stepType" :opened="opened['type']" :complete="typeComplete" :enConstruction="enConstruction" @toggle="toggle('type')">
      <DateEdit v-if="userIsAdmin" :date="etape.date" :onDateChanged="onDateChanged" />

      <TypeEdit :etape="etape" :etapeDate="etape.date" :demarcheId="etape.titreDemarcheId" :apiClient="apiClient" :onEtapeChange="onEtapeTypeChange" />
    </Accordion>

    <Accordion
      v-if="stepFondamentales"
      id="step-fondamentales"
      :step="stepFondamentales"
      :opened="opened['fondamentales']"
      :complete="stepFondamentalesComplete"
      :enConstruction="enConstruction"
      @toggle="toggle('fondamentales')"
    >
      <FondamentalesEdit
        :etape="etape"
        :demarcheTypeId="demarcheTypeId"
        :titreTypeId="titreTypeId"
        :user="user"
        :entreprises="entreprises"
        @update:etape="newValue => $emit('update:etape', newValue)"
        @complete-update="fondamentalesCompleteUpdate"
      />
    </Accordion>

    <Accordion v-if="stepPoints" id="step-points" :step="stepPoints" :opened="opened['points']" :complete="stepPerimetreComplete" :enConstruction="enConstruction" @toggle="toggle('points')">
      <PointsEdit :etape="etape" :titreTypeId="titreTypeId" :titreSlug="titreSlug" :apiClient="apiClient" :onEtapeChange="onEtapePerimetreChange" :completeUpdate="perimetreCompleteUpdate" />
    </Accordion>

    <Accordion v-if="stepSections" id="step-sections" :step="stepSections" :opened="opened['sections']" :complete="stepSectionsComplete" :enConstruction="enConstruction" @toggle="toggle('sections')">
      <SectionsEdit :etape="etape" :sections="sections" @update:etape="newValue => $emit('update:etape', newValue)" @complete-update="sectionsCompleteUpdate" @sections-update="sectionsUpdate" />
    </Accordion>

    <Accordion
      v-if="stepDocuments"
      id="step-documents"
      :step="stepDocuments"
      :opened="opened['documents']"
      :complete="stepDocumentsComplete"
      :enConstruction="enConstruction"
      @toggle="toggle('documents')"
    >
      <DocumentsEdit
        v-model:documents="etape.documents"
        :addAction="{ name: 'titreEtapeEdition/documentAdd' }"
        :removeAction="{ name: 'titreEtapeEdition/documentRemove' }"
        repertoire="demarches"
        :documentPopupTitle="documentPopupTitle"
        :parentTypeId="etapeType.id"
        :documentsTypes="documentsTypes"
        :date="etape.date"
        @complete-update="documentsCompleteUpdate"
      />
    </Accordion>

    <Accordion
      v-if="stepEntrepriseDocuments"
      id="step-entrepriseDocuments"
      :step="stepEntrepriseDocuments"
      :opened="opened['entrepriseDocuments']"
      :complete="stepEntrepriseDocumentsComplete"
      :enConstruction="enConstruction"
      @toggle="toggle('entrepriseDocuments')"
    >
      <EntrepriseDocumentsEdit :entreprises="titulairesAndAmodiataires" :apiClient="apiClient" :tde="tde" :etapeId="etape.id" :completeUpdate="entrepriseDocumentsCompleteUpdate" />
    </Accordion>

    <Accordion
      v-if="stepDecisionsAnnexes"
      id="step-decisionsAnnexes"
      :step="stepDecisionsAnnexes"
      :opened="opened['decisionsAnnexes']"
      :complete="stepDecisionsAnnexesComplete"
      :enConstruction="enConstruction"
      @toggle="toggle('decisionsAnnexes')"
    >
      <DecisionsAnnexesEdit :etape="etape" @complete-update="decisionsAnnexesComplete = $event" />
    </Accordion>

    <div class="dsfr">
      <div class="fr-input-group">
        <label class="fr-label" for="notes">Notes</label>
        <textarea id="notes" v-model="etape.notes" class="fr-input" name="notes"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import Accordion from './accordion.vue'
import { TypeEdit } from './type-edit'
import { DateEdit } from './date-edit'
import { FondamentalesEdit } from './fondamentales-edit'
import { PointsEdit } from './points-edit'
import SectionsEdit from './sections-edit.vue'
import DocumentsEdit from '../document/multi-edit.vue'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import DecisionsAnnexesEdit from './decisions-annexes-edit.vue'
import { apiClient } from '../../api/api-client'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'

export default {
  components: {
    DecisionsAnnexesEdit,
    Accordion,
    TypeEdit,
    FondamentalesEdit,
    PointsEdit,
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
      opened: {
        type: true,
        fondamentales: false,
        points: false,
        sections: false,
        documents: false,
        entrepriseDocuments: false,
        decisionsAnnexes: false,
      },
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

    enConstruction() {
      return this.etape.statutId === 'aco'
    },

    typeComplete() {
      if (!this.stepType) {
        return true
      }

      if (!this.etape.date || !this.etape.type) {
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

      if (this.heritageLoaded && this.etape.type.documentsTypes?.length) {
        steps.push({
          id: 'documents',
          name: `Documents liés à l’étape ${this.etape.type.nom}`,
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
      return this.$store.getters['user/userIsAdmin']
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
        fondamentales: 'Le renseignement d’une ou plusieurs substances est obligatoire.',
        points:
          'Pour la Guyane, le système géographique de référence est le RGFG95 / UTM zone 22N (2972). Pour le renseigner, cliquez sur « ajouter un système géographique » et choisissez le système RGFG95. Vous pouvez ensuite cliquer sur « ajouter un point », renseigner le nom, (le décrire si besoin) et renseigner les coordonnées (l’abscisse « X » en coordonnées cartésiennes correspond à la longitude en coordonnées géographiques et l’ordonnée « Y » correspond à une  latitude ). Vous devez reproduire cette étape pour tous les sommets du ou des périmètres du titre. La surface du titre est calculée automatiquement d’après les sommets renseignés.',
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

    toggle(stepId) {
      this.opened[stepId] = !this.opened[stepId]

      if (this.opened[stepId]) {
        this.scrollToStep(stepId)
      }

      this.$emit('change')
    },

    scrollToStep(stepId) {
      setTimeout(() => {
        document.getElementById(`step-${stepId}`).scrollIntoView({ behavior: 'smooth' })
      }, 500)
    },

    onDateChanged(date) {
      this.etape.date = date
      this.$emit('update:etape', this.etape)
    },

    async onEtapeTypeChange(etapeStatutId, etapeTypeId) {
      if (this.etape.type?.id !== etapeTypeId) {
        if (!this.etape.type) {
          this.etape.type = {}
        }
        await this.$store.dispatch('titreEtapeEdition/heritageGet', {
          ...this.tde,
          etapeTypeId,
        })
      }
      // TODO 2023-01-13 Il faut que les données soient mises après l'appel au store, sinon l'étape est réinitialisée.
      // Pour que ça soit propre, il faut arrêter de bouger le même objet pour diverses raisons, et maintenir une étape minimaliste à part
      this.etape.statutId = etapeStatutId
      this.etape.type.id = etapeTypeId
      this.$emit('type-complete-update', this.typeComplete)
      this.$emit('update:etape', this.etape)
    },

    onEtapePerimetreChange(perimetreInfos) {
      // TODO 2023-01-13 Il faut que les données soient mises après l'appel au store, sinon l'étape est réinitialisée.
      // Pour que ça soit propre, il faut arrêter de bouger le même objet pour diverses raisons, et maintenir une étape minimaliste à part
      this.etape.geojson4326Perimetre = perimetreInfos.geojson4326_perimetre
      this.etape.geojson4326Points = perimetreInfos.geojson4326_points

      this.$emit('alertes-update', { superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
      this.$emit('update:etape', this.etape)
    },
  },
}
</script>
