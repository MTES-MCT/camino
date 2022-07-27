<template>
  <div class="tablet-blobs mb-xl">
    <div class="tablet-blob-1-4">
      <div v-if="surface">
        <h5>Surface</h5>
        <p>{{ numberFormat(surface) }} km² environ</p>
      </div>
    </div>
    <div
      v-if="communes.length || forets.length || sdomZones.length"
      class="tablet-blob-3-4"
    >
      <h5>Territoires</h5>
      <template v-if="communes.length">
        <div v-for="region in regions" :key="region.id">
          <div v-for="departement in region.departements" :key="departement.id">
            <h6 class="mb-s">
              {{
                region.paysId === PAYS_IDS['République Française']
                  ? region.nom + ' / ' + departement.nom
                  : region.nom
              }}
            </h6>
            <TagList :elements="departement.communes" />
          </div>
        </div>
      </template>
      <div v-if="forets.length">
        <div>
          <h6 class="mb-s">Forêts</h6>
          <TagList :elements="forets.map(f => f.nom)" />
        </div>
      </div>
      <div v-if="sdomZones.length">
        <div>
          <h6 class="mb-s">Zones du SDOM</h6>
          <TagList :elements="sdomZones.map(f => f.nom)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import numberFormat from '@/utils/number-format'
import TagList from '../_ui/tag-list.vue'
import { computed, withDefaults } from 'vue'
import {
  DepartementId,
  Departements
} from 'camino-common/src/static/departement'
import { PAYS_IDS, PaysId } from 'camino-common/src/static/pays'
import { Regions } from 'camino-common/src/static/region'

interface Props {
  surface?: number
  forets?: { nom: string }[]
  sdomZones?: { nom: string }[]
  communes?: { nom: string; departementId: DepartementId }[]
}

const props = withDefaults(defineProps<Props>(), {
  communes: () => [],
  forets: () => [],
  sdomZones: () => [],
  surface: 0
})

type RegionsComputed = {
  id: string
  nom: string
  paysId: PaysId
  departements: { id: string; nom: string; communes: string[] }[]
}[]

const regions = computed<RegionsComputed>(() => {
  return props.communes.reduce((acc, commune) => {
    const departement = Departements[commune.departementId]
    const region = Regions[departement.regionId]

    let regionToUpdate = acc.find(({ id }) => id === region.id)

    if (!regionToUpdate) {
      regionToUpdate = {
        id: region.id,
        paysId: region.paysId,
        nom: region.nom,
        departements: []
      }
      acc.push(regionToUpdate)
    }

    let departementToUpdate = regionToUpdate.departements.find(
      ({ id }) => id === departement.id
    )
    if (!departementToUpdate) {
      departementToUpdate = {
        id: departement.id,
        nom: departement.nom,
        communes: []
      }
      regionToUpdate.departements.push(departementToUpdate)
    }

    departementToUpdate.communes.push(commune.nom)

    return acc
  }, [] as RegionsComputed)
})
</script>
