<template>
  <Liste
    nom="administrations"
    :filtres="filtres"
    :colonnes="colonnes"
    :lignes="lignes"
    :elements="lignes"
    :params="params"
    :metas="metas"
    :total="administrations.length"
    :initialized="true"
    @params-update="paramsUpdate"
  >
  </Liste>
</template>

<script setup lang="ts">
import Liste from './_common/liste.vue'
import {
  ADMINISTRATION_TYPES,
  Administrations,
  AdministrationTypeId,
  sortedAdministrationTypes
} from 'camino-common/src/static/administrations'
import { elementsFormat } from '@/utils'
import { computed, ref, markRaw } from 'vue'
import { Tag } from '@/components/_ui/tag'

const colonnes = [
  {
    id: 'abreviation',
    name: 'Abréviation'
  },
  {
    id: 'nom',
    name: 'Nom'
  },
  {
    id: 'type',
    name: 'Type'
  }
] as const
const filtres = [
  {
    id: 'noms',
    type: 'input',
    value: '',
    name: 'Nom',
    placeholder: `Nom de l'administration`
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: [],
    elementsFormat
  }
]
type ColonneId = (typeof colonnes)[number]['id']
const metas = {
  types: sortedAdministrationTypes
}

const params = ref<{
  table: { page: 0; colonne: ColonneId; ordre: 'asc' | 'desc' }
  filtres: unknown
}>({
  table: {
    page: 0,
    colonne: 'abreviation',
    ordre: 'asc'
  },
  filtres
})

const listState = ref<{ noms: string; typesIds: AdministrationTypeId[] }>({
  noms: '',
  typesIds: []
})

const administrations = Object.values(Administrations)

const lignes = computed(() => {
  return [...administrations]
    .filter(a => {
      if (listState.value.noms.length) {
        if (
          !a.id.toLowerCase().includes(listState.value.noms) &&
          !a.nom.toLowerCase().includes(listState.value.noms) &&
          !a.abreviation.toLowerCase().includes(listState.value.noms)
        ) {
          return false
        }
      }

      if (listState.value.typesIds.length) {
        if (!listState.value.typesIds.includes(a.typeId)) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      let first: string
      let second: string
      if (params.value.table.colonne === 'type') {
        first = ADMINISTRATION_TYPES[a.typeId].nom
        second = ADMINISTRATION_TYPES[b.typeId].nom
      } else {
        first = a[params.value.table.colonne]
        second = b[params.value.table.colonne]
      }

      if (params.value.table.ordre === 'asc') {
        return first.localeCompare(second)
      }
      return second.localeCompare(first)
    })
    .map(administration => {
      const type = ADMINISTRATION_TYPES[administration.typeId]

      const columns = {
        abreviation: { value: administration.abreviation },
        nom: { value: administration.nom, class: 'h6' },
        type: {
          component: markRaw(Tag),
          props: { mini: true, text: type.nom },
          class: 'mb--xs'
        }
      }

      return {
        id: administration.id,
        link: { name: 'administration', params: { id: administration.id } },
        columns
      }
    })
})

type ParamsFiltre = {
  section: 'filtres'
  params: { noms: string; typesIds: AdministrationTypeId[] }
}
type ParamsTable = {
  section: 'table'
  params: { colonne: ColonneId; ordre: 'asc' | 'desc' }
}

const isParamsFiltre = (
  options: ParamsFiltre | ParamsTable
): options is ParamsFiltre => options.section === 'filtres'

const paramsUpdate = (options: ParamsFiltre | ParamsTable) => {
  if (isParamsFiltre(options)) {
    listState.value.noms = options.params.noms.toLowerCase()
    listState.value.typesIds = options.params.typesIds
  } else {
    params.value.table.ordre = options.params.ordre
    params.value.table.colonne = options.params.colonne
  }
}
</script>
