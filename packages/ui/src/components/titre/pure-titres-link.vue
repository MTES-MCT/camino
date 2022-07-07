<template>
  <div
    v-if="
      canLinkTitresFrom(
        config.type === 'single' ? config.titreTypeId : config.demarcheTypeId
      )
    "
  >
    <h3 class="mb-s">Titres</h3>
    <p class="h6 italic"></p>
    <hr />
    <SimpleTypeahead
      placeholder="Lier un titre"
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
  </div>
</template>

<script lang="ts" setup>
import { canLinkTitresFrom } from 'camino-common/src/permissions/titres'
import SimpleTypeahead from '@/components/_ui/typeahead.vue'
import { computed, onMounted, ref, watch } from 'vue'
import {
  GetTitreFromChoices,
  TitreLink,
  TitresLinkConfig
} from './pure-titres-link.type'
import Statut from '@/components/_common/statut.vue'

const props = defineProps<{
  config: TitresLinkConfig
  // FIXME rename
  getTitresFromChoices: GetTitreFromChoices
}>()

const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: TitreLink): void
  (e: 'onSelectedTitres', titres: TitreLink[]): void
}>()

const titres = ref<TitreLink[]>([])
const search = ref<string>('')
const selectedTitres = ref<TitreLink[]>([])

// FIXME: manage loading and errors
const init = async () => {
  try {
    titres.value.push(
      ...(await props.getTitresFromChoices(props.config.titreTypeId))
    )
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
      const selectedTitreList = titres.value.filter(({ id }) =>
        titreIds.includes(id)
      )
      if (selectedTitreList) {
        selectedTitres.value.push(...selectedTitreList)
      }
    }
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  await init()
})

const titresFiltered = computed(() => {
  return search.value.length
    ? titres.value.filter(({ nom }) => nom.toLowerCase().includes(search.value))
    : titres.value
})

const onSearch = (searchLabel: string) => {
  search.value = searchLabel.toLowerCase()
}

const onSelectItem = (titre: TitreLink) => {
  emit('onSelectedTitre', titre)
}
const onSelectItems = (titres: TitreLink[]) => {
  emit('onSelectedTitres', titres)
}

const getDateDebutEtDateFin = (titre: TitreLink): string => {
  // FIXME
  // const { dateDebut, dateFin } = titre.demarches
  //   .filter(({ phase }) => phase)
  //   .map(({ phase }) => phase)
  //   .reduce(
  //     (acc, phase) => {
  //       if (!dateDebut) {
  //
  //       }
  //     },
  //     { dateDebut: undefined, dateFin: undefined }
  //   )
  const dateDebut = titre.demarches
    .filter(({ phase }) => phase)
    .map(({ phase }) => phase?.dateDebut)
    .sort()[0]
  const dateFin = titre.demarches
    .filter(({ phase }) => phase)
    .map(({ phase }) => phase?.dateFin)
    .sort()
    .reverse()[0]

  return `${dateDebut} - ${dateFin}`
}
</script>
