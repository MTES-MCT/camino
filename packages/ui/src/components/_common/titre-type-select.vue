<template>
  <div>
    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Domaine</h5>
      </div>

      <div class="mb tablet-blob-2-3">
        <select
          v-model="element.domaineId"
          class="p-s mr"
          @change="domaineUpdate()"
        >
          <option
            v-for="domaine in domainesFiltered"
            :key="domaine.id"
            :value="domaine.id"
          >
            {{ domaine.nom }}
          </option>
        </select>
      </div>
    </div>
    <hr />
    <div v-if="element.domaineId" class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Type</h5>
      </div>
      <div class="mb tablet-blob-2-3">
        <select
          v-model="element.typeId"
          class="p-s mr"
          :disabled="!titresTypeTypes"
        >
          <option
            v-for="titreTypeType in titresTypeTypes"
            :key="titreTypeType.id"
            :value="toTitreTypeId(titreTypeType.id, element.domaineId)"
          >
            {{ titreTypeType.nom }}
          </option>
        </select>
      </div>
    </div>
    <hr />
  </div>
</template>

<script setup lang="ts">
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { User } from 'camino-common/src/roles'
import { DomaineId, sortedDomaines } from 'camino-common/src/static/domaines'
import {
  getTitreTypeTypeByDomaineId,
  TitreTypeId,
  toTitreTypeId
} from 'camino-common/src/static/titresTypes'
import {
  TitresTypesTypes,
  TitreTypeType
} from 'camino-common/src/static/titresTypesTypes'
import { computed, onMounted } from 'vue'

type Domaine = {
  id: DomaineId
  nom: string
}

const props = defineProps<{
  element: {
    domaineId: DomaineId | undefined
    typeId: TitreTypeId | undefined | null
  }
  user: User
}>()

const domainesFiltered = computed<Domaine[]>(() =>
  sortedDomaines.filter(d =>
    getTitreTypeTypeByDomaineId(d.id).some(titreTypeTypeId =>
      canCreateTitre(props.user, toTitreTypeId(titreTypeTypeId, d.id))
    )
  )
)

const titresTypeTypes = computed<undefined | TitreTypeType[]>(() => {
  if (props.element.domaineId) {
    const domaineId: DomaineId = props.element.domaineId
    return getTitreTypeTypeByDomaineId(domaineId)
      .filter(titreTypeTypeId =>
        canCreateTitre(props.user, toTitreTypeId(titreTypeTypeId, domaineId))
      )
      .map(titreTypeTypeId => TitresTypesTypes[titreTypeTypeId])
  }

  return undefined
})

const domaineUpdate = () => {
  // Si on a que 1 choix, on le sélectionne directement
  if (props.element.domaineId && titresTypeTypes.value?.length === 1) {
    props.element.typeId = toTitreTypeId(
      titresTypeTypes.value[0].id,
      props.element.domaineId
    )
  } else {
    props.element.typeId = null
  }
}

onMounted(() => {
  // Si l’utilisateur peut sélectionner que 1 domaine, on le sélectionne
  if (domainesFiltered.value.length === 1) {
    props.element.domaineId = domainesFiltered.value[0].id
  }
  domaineUpdate()
})
</script>
