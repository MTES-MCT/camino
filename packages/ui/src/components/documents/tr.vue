<template>
  <tr class="h6">
    <td class="nowrap pt-m flex flex-center">
      <span class="bold">{{ documentType.nom }}</span>
      <span>
        <HelpTooltip v-if="helpShow && documentType.description" :text="documentType.description" class="ml-xs" />
      </span>
      <span v-if="etiquette">
        <Tag v-if="document.publicLecture" :mini="true" color="bg-info" class="ml-xs" text="Public" />

        <Tag v-if="document.entreprisesLecture && !document.publicLecture" :mini="true" color="bg-info" class="ml-xs" text="Entreprise" />
      </span>
      <Tag v-if="manquant && manquantShow" color="bg-warning" class="ml-xs" :mini="true" text="Fichier manquant" />
    </td>
    <td class="nowrap pt-m">
      {{ dateFormat(document.date) }}
    </td>
    <td class="pt-m">{{ document.description || '–' }}</td>
    <td class="flex text-right">
      <ButtonIcon v-if="boutonModification" class="btn rnd-l-xs py-s px-m my--xs mr-px" :onClick="editPopupOpen" icon="pencil" title="Modifier le document" />
      <ButtonIcon
        v-if="boutonSuppression"
        class="btn py-s px-m my--xs"
        :class="{
          'rnd-r-xs': !document.url && !document.uri && !document.fichier,
        }"
        icon="delete"
        title="Supprimer le document"
        @click="removePopupOpen"
      />
      <a
        v-if="document.fichier || document.fichierNouveau"
        class="btn-border py-s px-m my--xs"
        :class="{
          'rnd-r-xs': !document.url && !document.uri,
          'rnd-l-xs': !boutonVisualisation && !boutonModification && !boutonSuppression && !boutonDissociation,
        }"
        :href="`/apiUrl/download/fichiers/${document.id}`"
        :download="document.nom"
        target="_blank"
        title="Consulter le document - nouvelle fenêtre"
        aria-label="Consulter le document - nouvelle fenêtre"
      >
        <Icon name="download" size="M" aria-hidden="true" />
      </a>
      <a
        v-if="document.url"
        class="btn-border py-s px-m my--xs"
        :class="{
          'rnd-r-xs': !document.uri,
          'rnd-l-xs': !document.fichier && !boutonVisualisation && !boutonModification && !boutonSuppression && !boutonDissociation,
        }"
        :href="document.url"
        target="_blank"
        rel="noopener noreferrer"
        title="Consulter le document - lien externe"
        aria-label="Consulter le document - lien externe"
        alt="Url"
      >
        <Icon size="M" name="link" aria-hidden="true" />
      </a>
      <a
        v-if="document.uri"
        class="btn-border py-s px-m my--xs rnd-r-xs"
        :class="{
          'rnd-l-xs': !document.url && !document.fichier && !boutonVisualisation && !boutonModification && !boutonSuppression && !boutonDissociation,
        }"
        :href="document.uri"
        target="_blank"
        title="Consulter le document - lien externe"
        rel="noopener noreferrer"
        alt="Uri"
      >
        <Icon size="M" name="link" aria-hidden="true" />
      </a>
    </td>
  </tr>
</template>

<script>
import { cloneAndClean, dateFormat } from '../../utils/index'
import { Tag } from '../_ui/tag'
import DocumentEditPopup from '../document/edit-popup.vue'
import DocumentRemovePopup from '../document/remove-popup.vue'
import { HelpTooltip } from '../_ui/help-tooltip'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes'

export default {
  components: {
    ButtonIcon,
    Icon,
    Tag,
    HelpTooltip,
  },

  props: {
    document: { type: Object, required: true },
    repertoire: { type: String, required: true },
    title: { type: String, required: true },
    route: { type: Object, default: null },
    addAction: { type: Object, default: null },
    removeAction: { type: Object, default: null },
    parentId: { type: String, default: '' },
    parentTypeId: { type: String, default: '' },
    etiquette: { type: Boolean, default: false },
    boutonVisualisation: { type: Boolean, default: true },
    boutonDissociation: { type: Boolean, default: false },
    boutonModification: { type: Boolean, default: false },
    boutonSuppression: { type: Boolean, default: false },
    manquantShow: { type: Boolean, default: false },
    helpShow: { type: Boolean, default: false },
  },

  data() {
    return {
      fileReader: null,
    }
  },

  computed: {
    manquant() {
      return !(this.document.fichier || this.document.fichierNouveau || this.document.uri || this.document.url)
    },
    documentType() {
      if (this.document.typeId) {
        return DocumentsTypes[this.document.typeId]
      } else {
        return this.document.type
      }
    },
  },

  methods: {
    editPopupOpen() {
      const document = cloneAndClean(this.document)
      if (this.parentId) {
        if (this.repertoire === 'demarches') {
          document.titreEtapeId = this.parentId
        } else if (this.repertoire === 'activites') {
          document.titreActiviteId = this.parentId
        }
      }

      // TODO 2023-04-11 make only typeId pass in documents
      if (!document.typeId) {
        document.typeId = document.type.id
      }
      document.fichierNouveau = null

      delete document.type
      delete document.suppression

      this.$store.commit('popupOpen', {
        component: DocumentEditPopup,
        props: {
          title: this.title,
          route: this.route,
          action: this.addAction,
          document,
          repertoire: this.repertoire,
          parentTypeId: this.parentTypeId,
        },
      })
    },

    removePopupOpen() {
      if (this.removeAction) {
        this.$store.dispatch(this.removeAction.name, { id: this.document.id }, { root: true })
      } else {
        this.$store.commit('popupOpen', {
          component: DocumentRemovePopup,
          props: {
            title: this.title,
            document: this.document,
            route: this.route,
            documentType: this.documentType,
          },
        })
      }
    },

    dateFormat(date) {
      return dateFormat(date)
    },
  },
}
</script>
