<template>
  <div class="overflow-scroll-x">
    <table>
      <tr>
        <th>Nom</th>
        <th>Date</th>
        <th class="full-x-">Description</th>
        <th />
      </tr>
      <DocumentTr
        v-for="document in documents"
        :key="document.id"
        :document="document"
        :parentId="parentId"
        :route="route"
        :addAction="addAction"
        :removeAction="removeAction"
        :title="title"
        :etiquette="etiquette"
        :boutonVisualisation="true"
        :boutonSuppression="boutonSuppression && document.suppression"
        :boutonModification="boutonModification"
        :boutonDissociation="boutonDissociation"
        :manquantShow="manquantShow"
        :helpShow="helpShow"
        :documentsTypes="documentsTypes"
        :user="user"
      />
    </table>
  </div>
</template>

<script>
import DocumentTr from './tr.vue'

export default {
  components: {
    DocumentTr,
  },

  props: {
    documents: { type: Array, required: true },
    title: { type: String, default: '' },
    route: { type: Object, default: null },
    addAction: { type: Object, default: null },
    removeAction: { type: Object, default: null },
    parentId: { type: String, default: '' },
    etiquette: { type: Boolean, default: false },
    boutonDissociation: { type: Boolean, default: false },
    boutonModification: { type: Boolean, default: false },
    boutonSuppression: { type: Boolean, default: false },
    manquantShow: { type: Boolean, default: false },
    helpShow: { type: Boolean, default: false },
    documentsTypes: { type: Array, required: true },
    user: { type: Object, required: true },
  },
}
</script>
