<template>
  <div class="tablet-blobs">
    <div class="mb tablet-blob-1-3">
      <h5>
        Système
        <span v-if="geoSystemeOpposableId === geoSysteme.id" class="bg-info py-xxs px-xs rnd-xs color-bg ml-xxs">Opposable</span>
      </h5>

      <p class="py-s mb-0 h6 bold">
        {{ geoSysteme.nom }}
      </p>
    </div>
    <div class="mb tablet-blob-1-3">
      <h5>X ({{ geoSystemeUniteNom }})</h5>
      <inputNumber :initialValue="pointReference.x" :negative="true" placeholder="0,01" :numberChanged="updateX" />
    </div>
    <div class="mb tablet-blob-1-3">
      <h5>Y ({{ geoSystemeUniteNom }})</h5>
      <inputNumber :initialValue="pointReference.y" :negative="true" placeholder="0,01" :numberChanged="updateY" />
    </div>
  </div>
</template>

<script>
import { InputNumber } from '../_ui/input-number'
import { Unites } from 'camino-common/src/static/unites'

export default {
  components: { InputNumber },

  props: {
    geoSysteme: { type: Object, required: true },
    geoSystemeOpposableId: {
      type: String,
      required: false,
      default: undefined,
    },
    pointReferences: { type: Object, required: true },
  },

  emits: ['update:pointReferences'],

  computed: {
    pointReference() {
      return this.pointReferences[this.geoSysteme.id] ? this.pointReferences[this.geoSysteme.id] : { id: undefined, x: 0, y: 0 }
    },
    geoSystemeUniteNom() {
      return Unites[this.geoSysteme.uniteId].nom
    },
  },
  methods: {
    updateX(value) {
      this.pointReference.x = value
    },
    updateY(value) {
      this.pointReference.y = value
    },
  },
}
</script>
