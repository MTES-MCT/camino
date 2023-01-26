<template>
  <div class="flex flex-direction-column">
    <inputNumber
      v-if="element.type === 'number'"
      v-model="contenu[element.id]"
      class="p-s"
      placeholder="…"
    />

    <inputNumber
      v-if="element.type === 'integer'"
      v-model="contenu[element.id]"
      :integer="true"
      class="p-s"
      placeholder="…"
    />

    <div
      v-if="element.id === 'volumeGranulatsExtrait' && contenu[element.id]"
      class="flex-self-end pt-xxs"
    >
      Soit l’équivalent de {{ masseGranulatsExtraitValeur }} tonnes
    </div>

    <InputDate
      v-else-if="element.type === 'date'"
      :inputValue="contenu[element.id]"
      :dateChanged="dateChanged"
    />

    <textarea
      v-else-if="element.type === 'textarea'"
      v-model="contenu[element.id]"
      class="p-s"
    />

    <input
      v-else-if="element.type === 'text'"
      v-model="contenu[element.id]"
      type="text"
      class="p-s"
    />

    <div v-else-if="element.type === 'radio'">
      <label class="mr">
        <input
          v-model="contenu[element.id]"
          :name="element.id"
          :value="true"
          type="radio"
          class="p-s mt-s mb-s"
        />
        Oui
      </label>

      <label>
        <input
          v-model="contenu[element.id]"
          :name="element.id"
          :value="false"
          type="radio"
          class="p-s mt-s mb-s"
        />
        Non
      </label>
    </div>

    <input
      v-else-if="element.type === 'checkbox'"
      v-model="contenu[element.id]"
      type="checkbox"
      class="p-s mt-s mb-s"
    />

    <div v-else-if="element.type === 'checkboxes'">
      <div v-for="value in valeurs" :key="value.id">
        <label>
          <input
            v-model="contenu[element.id]"
            type="checkbox"
            :value="value.id"
            class="mr-s"
          />
          <span class="cap-first">{{ value.nom }}</span>
        </label>
      </div>
    </div>

    <div v-else-if="element.type === 'select'">
      <select
        v-if="valeurs && valeurs.length"
        v-model="contenu[element.id]"
        class="p-s mr-s"
      >
        <option v-for="value in valeurs" :key="value.id" :value="value.id">
          {{ value.nom }}
        </option>
      </select>
    </div>

    <div v-else-if="element.type === 'file'">
      <SectionElementFileEdit
        :contenu="contenu"
        :elementId="element.id"
        @update:contenu="newValue => emits('update:contenu', newValue)"
      />
    </div>
  </div>
</template>

<script>
import { InputDate } from '../_ui/input-date'
import InputNumber from '../_ui/input-number.vue'
import SectionElementFileEdit from './section-element-file-edit.vue'
import numberFormat from '@/utils/number-format'

export default {
  components: {
    InputDate,
    InputNumber,
    SectionElementFileEdit
  },

  props: {
    contenu: { type: Object, required: true },
    element: { type: Object, required: true }
  },

  emits: ['update:contenu'],

  computed: {
    valeurs() {
      return this.element.valeurs
    },

    masseGranulatsExtraitValeur() {
      return numberFormat(this.contenu[this.element.id] * 1.5)
    }
  },

  created() {
    // si l'élément est un bouton radio
    // et que le contenu pour cet élément est vide
    // alors on met la valeur par défaut `false`
    if (this.contenu && this.contenu[this.element.id] === undefined) {
      if (this.element.type === 'radio') {
        this.contenu[this.element.id] = false
      } else if (this.element.type === 'multiple') {
        this.contenu[this.element.id] = []
      }
    }
    this.$emit('update:contenu', this.contenu)
  },

  methods: {
    dateChanged(date) {
      this.contenu[this.element.id] = date
    }
  }
}
</script>
