<template>
  <div class="mb-xxl">
    <h3>Administration gestionnaire ou associée</h3>

    <div class="h6">
      <ul class="list-prefix">
        <li>
          Un utilisateur d'une <b>administration gestionnaire</b> peut créer et
          modifier les titres et leur contenu.
        </li>
        <li>
          Un utilisateur d'une <b>administration associée</b> peut voir les
          titres non-publics. Cette administration n'apparaît pas sur les pages
          des titres.
        </li>
      </ul>
    </div>

    <div class="line width-full" />
    <div class="width-full-p">
      <div class="overflow-scroll-x mb">
        <table>
          <tr>
            <th>Domaine</th>
            <th>Type de titre</th>
            <th>Gestionnaire</th>
            <th>Associée</th>
          </tr>

          <tr v-for="titreType in titresTypes" :key="titreType.titreTypeId">
            <td>
              <CaminoDomaine :domaineId="titreType.domaineId" class="mt-s" />
            </td>
            <td>
              <span class="small bold cap-first mt-s">{{
                titreType.titreTypeTypeNom
              }}</span>
            </td>
            <td>
              <Icon v-if="titreType.gestionnaire" name="checkbox" size="M" />
              <Icon v-else name="checkbox-blank" size="M" />
            </td>
            <td>
              <Icon v-if="titreType.associee" name="checkbox" size="M" />
              <Icon v-else name="checkbox-blank" size="M" />
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitresTypes, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { Domaine as CaminoDomaine } from '@/components/_common/domaine'
import Icon from '@/components/_ui/icon.vue'

const props = defineProps<{ administrationId: AdministrationId }>()

type AdministrationTitresTypes = {
  titreTypeId: TitreTypeId
  domaineId: DomaineId
  titreTypeTypeNom: string
  gestionnaire: boolean
  associee: boolean
}[]

const titresTypes = computed<AdministrationTitresTypes>(() => {
  return getTitreTypeIdsByAdministration(props.administrationId).map(att => {
    const titreType = TitresTypes[att.titreTypeId]
    return {
      titreTypeId: att.titreTypeId,
      domaineId: titreType.domaineId,
      titreTypeTypeNom: TitresTypesTypes[titreType.typeId].nom,
      gestionnaire: att.gestionnaire,
      associee: att.associee
    }
  })
})
</script>
