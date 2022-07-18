<template>
  <div
    v-if="
      canLinkTitresFrom(
        config.type === 'single' ? titreTypeId : config.demarcheTypeId
      )
    "
  >
    <h3 class="mb-s">Titre{{ config.type === 'single' ? '' : 's' }}</h3>
    <p class="h6 italic"></p>
    <hr />
    <LoadingElement :data="data">
      <SimpleTypeahead
        id="titre-link-typeahead"
        :placeholder="
          config.type === 'single' ? 'Lier un titre' : 'Lier plusieurs titres'
        "
        :type="config.type"
        :items="titresFiltered"
        :itemKey="item => item.id"
        :itemChipLabel="item => item.nom"
        :overrideItems="selectedTitres"
        :minInputLength="1"
        @selectItem="onSelectItem"
        @selectItems="onSelectItems"
        @onInput="onSearch"
      >
        <template #default="{ item }">
          <div class="flex flex-center">
            <Statut :color="item.statut.couleur" :nom="item.statut.nom" />
            <span class="cap-first bold ml-m">{{ item.nom }}</span>
            <span class="ml-m" style="margin-left: auto">{{
              getDateDebutEtDateFin(item)
            }}</span>
          </div>
        </template>
      </SimpleTypeahead>
    </LoadingElement>
  </div>
</template>

<script lang="ts" setup>
import { canLinkTitresFrom } from 'camino-common/src/permissions/titres'
import SimpleTypeahead from '@/components/_ui/typeahead.vue'
import { computed, onMounted, ref, watch } from 'vue'
import {
  LoadLinkableTitres,
  TitreLink,
  TitresLinkConfig
} from './pure-titres-link.type'
import Statut from '@/components/_common/statut.vue'
import { AsyncData } from '@/api/client-rest'
import LoadingElement from '@/components/_ui/loader-element.vue'
import { TitreTypeId } from 'camino-common/src/titresTypes'

const props = defineProps<{
  config: TitresLinkConfig
  titreTypeId: TitreTypeId
  loadLinkableTitres: LoadLinkableTitres
}>()

const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: TitreLink | null): void
  (e: 'onSelectedTitres', titres: TitreLink[]): void
}>()

const search = ref<string>('')
const selectedTitres = ref<TitreLink[]>([])
const data = ref<AsyncData<TitreLink[]>>({ status: 'LOADING' })

const init = async () => {
  data.value = { status: 'LOADING' }
  if (
    canLinkTitresFrom(
      props.config.type === 'single'
        ? props.titreTypeId
        : props.config.demarcheTypeId
    )
  ) {
    try {
      const titresLinkables = await props.loadLinkableTitres(props.titreTypeId)

      data.value = { status: 'LOADED', value: titresLinkables }
      const titreIds: string[] = []
      if (
        props.config.type === 'single' &&
        props.config.selectedTitreId !== null
      ) {
        titreIds.push(props.config.selectedTitreId)
      }
      if (props.config.type === 'multiple') {
        titreIds.push(...props.config.selectedTitreIds)
      }

      if (titreIds.length) {
        const selectedTitreList = data.value.value.filter(({ id }) =>
          titreIds.includes(id)
        )
        if (selectedTitreList) {
          selectedTitres.value.push(...selectedTitreList)
        }
      }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened'
      }
    }
  }
}

watch(
  () => props.titreTypeId,
  async _ => {
    selectedTitres.value.splice(0, selectedTitres.value.length)
    onSelectItem(null)
    onSelectItems([])
    await init()
  }
)

onMounted(async () => {
  await init()
})

const titresFiltered = computed(() => {
  if (data.value.status === 'LOADED') {
    return search.value.length
      ? data.value.value.filter(({ nom }) =>
          nom.toLowerCase().includes(search.value)
        )
      : data.value.value
  }
  return []
})

const onSearch = (searchLabel: string) => {
  search.value = searchLabel.toLowerCase()
}

const onSelectItem = (titre: TitreLink | null) => {
  emit('onSelectedTitre', titre)
}
const onSelectItems = (titres: TitreLink[]) => {
  emit('onSelectedTitres', titres)
}

const getDateDebutEtDateFin = (titre: TitreLink): string => {
  const titreLinkDemarches = titre.demarches.filter(({ phase }) => phase)
  const dateDebut = titreLinkDemarches
    .map(({ phase }) => phase?.dateDebut)
    .sort()[0]
  const dateFin = titreLinkDemarches
    .map(({ phase }) => phase?.dateFin)
    .sort()
    .reverse()[0]

  return `${dateDebut} - ${dateFin}`
}
</script>
