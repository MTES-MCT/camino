<template>
  <div>
    <Documents
      v-if="documents.length"
      :documents="documents"
      :boutonModification="true"
      :boutonSuppression="true"
      :addAction="addAction"
      :removeAction="removeAction"
      :manquantShow="true"
      :helpShow="true"
      :title="documentPopupTitle"
      :documentsTypes="documentsTypes"
      :user="user"
    />

    <DocumentAddButton
      v-if="documentsTypes?.length"
      :document="{
        date,
        entreprisesLecture: !userIsAdmin,
        publicLecture: false,
        fichier: null,
        fichierNouveau: null,
        fichierTypeId: null,
        typeId: '',
      }"
      :action="addAction"
      :title="documentPopupTitle"
      class="btn py-s px-m rnd-xs mb-s full-x"
      :large="true"
      :documentsTypes="documentsTypes"
      :user="user"
    />
  </div>
</template>

<script>
import DocumentAddButton from './button-add.vue'
import Documents from '../documents/list.vue'
import { getCurrent } from 'camino-common/src/date'
import { isAdministration } from 'camino-common/src/roles'

export default {
  components: { DocumentAddButton, Documents },

  props: {
    documents: { type: Array, required: true },
    documentsTypes: { type: Array, required: true },
    documentPopupTitle: { type: String, required: true },
    addAction: { type: Object, default: null },
    removeAction: { type: Object, default: null },
    date: { type: String, default: getCurrent() },
    user: { type: Object, required: true },
  },

  emits: ['complete-update'],

  computed: {
    complete() {
      return this.documents.every(d => {
        const documentType = this.documentsTypes.find(dt => dt.id === d.typeId)
        return !documentType || documentType.optionnel || !!((d.fichier || d.fichierNouveau) && d.date)
      })
    },

    userIsAdmin() {
      return isAdministration(this.user)
    },
  },

  watch: {
    complete: 'completeUpdate',
  },

  created() {
    this.completeUpdate()
  },

  methods: {
    completeUpdate() {
      this.$emit('complete-update', this.complete)
    },
  },
}
</script>
