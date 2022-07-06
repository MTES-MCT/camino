<template>
  <div v-if="canLinkTitresFrom(titreTypeId)">
    <h3 class="mb-s">Titres</h3>
    <p class="h6 italic"></p>
    <hr />
    <SimpleTypeahead
      placeholder="Rechercher un titre"
      type="single"
      :items="titresFiltered"
      :itemKey="item => item.id"
      :itemChipLabel="item => item.nom"
      :overrideItems="selectedTitres"
      :minInputLength="1"
      @selectItem="onSelect"
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
import { TitreTypeId } from 'camino-common/src/titresTypes'
import { canLinkTitresFrom } from 'camino-common/src/permissions/titres'
import SimpleTypeahead from '@/components/_ui/typeahead.vue'
import { computed, onMounted, ref } from 'vue'
import { GetTitreFromChoices, TitreLink } from './pure-titres-link.type'
import Statut from '@/components/_common/statut.vue'

const props = defineProps<{
  titreTypeId: TitreTypeId
  selectedTitreId: string | null
  // FIXME rename
  getTitresFromChoices: GetTitreFromChoices
}>()

const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: TitreLink): void
}>()

const titres = ref<TitreLink[]>([])
const search = ref<string>('')
const selectedTitres = ref<TitreLink[]>([])

// FIXME: manage loading and errors
onMounted(async () => {
  titres.value.push(...(await props.getTitresFromChoices(props.titreTypeId)))
  if (props.selectedTitreId) {
    const selectedTitre = titres.value.find(
      ({ id }) => id === props.selectedTitreId
    )
    if (selectedTitre) {
      selectedTitres.value.push(selectedTitre)
    }
  }
})

const titresFiltered = computed(() => {
  return search.value.length
    ? titres.value.filter(({ nom }) => nom.toLowerCase().includes(search.value))
    : titres.value
})

const onSearch = (searchLabel: string) => {
  search.value = searchLabel.toLowerCase()
}

const onSelect = (titre: TitreLink) => {
  emit('onSelectedTitre', titre)
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
