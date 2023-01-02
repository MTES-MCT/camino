<template>
  <div>
    <div class="desktop-blobs">
      <div class="desktop-blob-2-3">
        <h1 class="mt-xs mb-xxl">Tableau de bord {{ isDGTM ? 'DGTM' : '' }}</h1>
      </div>
    </div>
    <div v-if="isDGTM" class="mb-l">
      <h3>
        Statistiques
        <router-link :to="{ name: 'Stats DGTM' }"> Voir plus </router-link>
      </h3>
      <PureDGTMStats :getDgtmStats="getDgtmStats" />
    </div>
    <div class="line-neutral width-full mb-l"></div>
    <h3>Titres</h3>
    <LoadingElement v-slot="{ item }" :data="data">
      <template v-if="item.drealTitresBloques.length">
        <h4>Titres en attente de la DREAL</h4>
        <TableAuto
          class="mb-xxl"
          :columns="columnsEnAttente"
          :rows="item.drealTitresBloques"
          :initialSort="{ column: initialColumnId, order: 'asc' }"
        />
      </template>
    </LoadingElement>
    <h4>Titres en cours d’instruction</h4>
    <LoadingElement v-slot="{ item }" :data="data">
      <TableAuto
        :columns="columns"
        :rows="item.drealTitres"
        :initialSort="{ column: initialColumnId, order: 'asc' }"
        class="width-full-p"
      />
    </LoadingElement>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref } from 'vue'
import TableAuto from '../_ui/table-auto.vue'
import List from '../_ui/list.vue'
import {
  Column,
  ComponentColumnData,
  TableAutoRow,
  TextColumnData
} from '../_ui/table-auto.type'
import PureDGTMStats from './pure-dgtm-stats.vue'
import {
  nomColumn,
  nomCell,
  referencesColumn,
  statutColumn,
  titulairesColumn,
  statutCell,
  referencesCell,
  titulairesCell,
  typeColumn,
  typeCell,
  activiteColumn,
  activitesCell
} from '@/components/titres/table-utils'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { LoadingElement } from '@/components/_ui/pure-loader'
import { AsyncData } from '@/api/client-rest'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'

const data = ref<
  AsyncData<{ drealTitres: TableAutoRow[]; drealTitresBloques: TableAutoRow[] }>
>({ status: 'LOADING' })
const props = defineProps<{
  getDrealTitres: () => Promise<CommonTitreDREAL[]>
  isDGTM: boolean
  getDgtmStats: () => Promise<StatistiquesDGTM>
}>()

const derniereEtapeColumn: Column<'derniereEtape'> = {
  id: 'derniereEtape',
  name: 'Dernière étape',
  class: ['min-width-8']
}

const prochainesEtapesColumn: Column<'prochainesEtapes'> = {
  id: 'prochainesEtapes',
  name: 'Prochaines étapes',
  class: ['min-width-8']
}
const columns = [
  nomColumn,
  typeColumn,
  statutColumn,
  activiteColumn,
  referencesColumn,
  titulairesColumn,
  derniereEtapeColumn
] as const

const columnsEnAttente = [
  nomColumn,
  typeColumn,
  statutColumn,
  titulairesColumn,
  derniereEtapeColumn,
  prochainesEtapesColumn
] as const

const initialColumnId = columns[3].id

type Columns =
  | typeof columns[number]['id']
  | typeof columnsEnAttente[number]['id']

const prochainesEtapesCell = (titre: CommonTitreDREAL) => ({
  component: markRaw(List),
  props: {
    elements: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom),
    mini: true
  },
  class: 'mb--xs',
  value: titre.prochainesEtapes?.map(id => EtapesTypes[id].nom).join(', ')
})
const titresLignesBuild = (
  titres: CommonTitreDREAL[]
): TableAutoRow<Columns>[] => {
  return titres.map(titre => {
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } =
      {
        nom: nomCell(titre),
        type: typeCell(titre),
        statut: statutCell(titre),
        activites: activitesCell(titre),
        references: referencesCell(titre),
        titulaires: titulairesCell(titre),
        derniereEtape: {
          value: titre.derniereEtape
            ? `${EtapesTypes[titre.derniereEtape.etapeTypeId].nom} (${
                titre.derniereEtape.date
              })`
            : ''
        },
        prochainesEtapes: prochainesEtapesCell(titre)
      }
    return {
      id: titre.id,
      link: { name: 'titre', params: { id: titre.slug } },
      columns
    }
  })
}

onMounted(async () => {
  try {
    const titres = await props.getDrealTitres()
    data.value = {
      status: 'LOADED',
      value: {
        drealTitres: titresLignesBuild(
          titres.filter(titre => !titre.enAttenteDeDREAL)
        ),
        drealTitresBloques: titresLignesBuild(
          titres.filter(titre => titre.enAttenteDeDREAL)
        )
      }
    }
  } catch (e: any) {
    console.error('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>
