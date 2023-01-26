<template>
  <div class="mb">
    <h5>{{ filter.name }}</h5>
    <hr class="mb-s" />

    <div v-for="(value, n) in filter.value" :key="n">
      <div class="flex mb-s">
        <select v-model="value.typeId" class="p-s mr-s" @change="valueReset(n)">
          <option value="">–</option>
          <option
            v-for="type in filter.elements"
            :key="type.id"
            :value="type.id"
          >
            {{ type.nom }}
          </option>
        </select>

        <button class="btn py-s px-m rnd-xs" @click="valueRemove(n)">
          <Icon name="minus" size="M" />
        </button>
      </div>
      <div v-if="value.typeId">
        <div class="blobs mb-s">
          <div class="blob-1-4">
            <h5 class="mb-0">Statut</h5>
            <p class="h6 italic mb-0">Optionnel</p>
          </div>
          <div class="blob-3-4">
            <select
              v-model="value.statutId"
              class="p-s mr-s cap-first"
              @change="statutValueReset(n)"
            >
              <option :value="''">–</option>
              <option
                v-for="statut in statutsFind(n)"
                :key="statut.id"
                :value="statut.id"
              >
                {{ statut.nom }}
              </option>
            </select>
          </div>
        </div>
        <div class="blobs mb-s">
          <div class="blob-1-4">
            <h5 class="mb-0">Après le</h5>
            <p class="h6 italic mb-0">Optionnel</p>
          </div>
          <div class="blob-3-4">
            <InputDate
              :initialValue="filter.value[n].dateDebut"
              :dateChanged="date => dateDebutChanged(n, date)"
            />
          </div>
        </div>
        <div class="blobs mb-s">
          <div class="blob-1-4">
            <h5 class="mb-0">Avant le</h5>
            <p class="h6 italic mb-0">Optionnel</p>
          </div>
          <div class="blob-3-4">
            <InputDate
              :initialValue="filter.value[n].dateFin"
              :dateChanged="date => dateFinChanged(n, date)"
            />
          </div>
        </div>
      </div>
      <hr class="mb-s" />
    </div>
    <button
      v-if="!filter.value || !filter.value.some(v => v.typeId === '')"
      class="btn rnd-xs py-s px-m full-x flex mb-s h6"
      @click="valueAdd"
    >
      <span class="mt-xxs">Ajouter un type d'étape</span>
      <Icon name="plus" size="M" class="flex-right" />
    </button>
  </div>
</template>

<script>
import { InputDate } from '../_ui/input-date'
import { Icon } from '@/components/_ui/icon'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'

export default {
  components: { Icon, InputDate },

  props: {
    filter: { type: Object, required: true }
  },

  methods: {
    dateDebutChanged(n, date) {
      this.filter.value[n].dateDebut = date
    },
    dateFinChanged(n, date) {
      this.filter.value[n].dateFin = date
    },
    statutsFind(n) {
      return getEtapesStatuts(this.filter.value[n].typeId)
    },

    valueAdd() {
      this.filter.value.push({ typeId: '' })
    },

    valueRemove(n) {
      this.filter.value.splice(n, 1)
    },

    valueReset(n) {
      delete this.filter.value[n].statutId
    },

    statutValueReset(n) {
      // si l'utilisateur déselectionne le statut (chaine vide)
      if (!this.filter.value[n].statutId) {
        delete this.filter.value[n].statutId
      }
    }
  }
}
</script>
