<template>
  <div class="desktop-blobs">
    <div class="desktop-blob-1-2">
      <div class="rnd-b-s bg-alt pt px overflow-auto">
        <h4 class="mb">
          <Pill :color="`bg-domaine-${titre.domaine.id}`" class="mono mr-s">
            {{ titre.domaine.id }}
          </Pill>
          <span class="cap-first">
            {{ TitresTypesTypes[type.typeId].nom }}
          </span>
        </h4>

        <div class="mb">
          <Statut :color="titreStatut.couleur" :nom="titreStatut.nom" />
        </div>

        <div
          v-if="phases && phases.length"
          class="mb bg-bg mx--m px-m pt-xs pb-s rnd-xs"
        >
          <table class="table-xxs full-x mb-0">
            <tr>
              <th class="max-width-1" />
              <th>Phase</th>
              <th>Début</th>
              <th>Fin</th>
            </tr>
            <tr v-for="demarche in phases" :key="demarche.id">
              <td class="max-width-1">
                <Dot
                  class="mt-xs"
                  :color="`bg-${demarche.phase.statut.couleur}`"
                />
              </td>
              <td>
                <span class="cap-first bold h5 mb-0">
                  {{ DemarchesTypes[demarche.type.id].nom }}
                </span>
              </td>
              <td>
                <span class="h5 mb-0">{{
                  dateFormat(demarche.phase.dateDebut)
                }}</span>
              </td>
              <td>
                <span class="h5 mb-0">{{
                  dateFormat(demarche.phase.dateFin)
                }}</span>
              </td>
            </tr>
          </table>
        </div>

        <div v-if="titre.references && titre.references.length" class="mb">
          <ul class="list-prefix h6">
            <li v-for="reference in titre.references" :key="reference.nom">
              <span v-if="reference.type" class="word-break fixed-width bold">
                {{ reference.type.nom }}
              </span>
              {{ reference.nom }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="desktop-blob-1-2 mt">
      <PureTitresLinkForm
        :user="user"
        :titre="{
          id: titre.id,
          typeId: type.id,
          administrations: titre.administrations,
          demarches: titre.demarches.map(d => ({ typeId: d.type.id }))
        }"
        :linkTitres="linkTitres"
        :loadTitreLinks="loadTitreLinks"
        :loadLinkableTitres="loadLinkableTitres"
      />

      <div v-if="titre.substances && titre.substances.length > 0" class="mb">
        <h5>Substances</h5>
        <TagList
          :elements="
            titre.substances?.map(
              substanceId => SubstancesLegale[substanceId].nom
            )
          "
        />
      </div>

      <div v-if="titre.titulaires.length" class="mb">
        <h5>
          {{ titre.titulaires.length > 1 ? 'Titulaires' : 'Titulaire' }}
        </h5>
        <ul class="list-inline">
          <li v-for="e in titre.titulaires" :key="e.id" class="mb-xs mr-xs">
            <router-link
              :to="{ name: 'entreprise', params: { id: e.id } }"
              class="btn-border small p-s rnd-xs mr-xs"
            >
              <span class="mr-xs">{{
                e.legalSiren ? `${e.nom} (${e.legalSiren})` : e.nom
              }}</span>
              <Tag
                v-if="e.operateur"
                :mini="true"
                color="bg-info"
                class="ml-xs"
              >
                Opérateur
              </Tag>
            </router-link>
          </li>
        </ul>
      </div>

      <div v-if="titre.amodiataires.length" class="mb">
        <h5>
          {{ titre.amodiataires.length > 1 ? 'Amodiataires' : 'Amodiataire' }}
        </h5>
        <ul class="list-prefix">
          <li v-for="e in titre.amodiataires" :key="e.id">
            <router-link
              :to="{ name: 'entreprise', params: { id: e.id } }"
              class="btn-border small p-s rnd-xs mr-xs"
            >
              <span class="mr-xs">{{
                e.legalSiren ? `${e.nom} (${e.legalSiren})` : e.nom
              }}</span>
              <Tag
                v-if="e.operateur"
                :mini="true"
                color="bg-info"
                class="ml-xs"
              >
                Opérateur
              </Tag>
            </router-link>
          </li>
        </ul>
      </div>

      <div v-if="hasContenu">
        <Section
          v-for="s in titre.type.sections"
          :key="s.id"
          :entete="false"
          :section="s"
          :contenu="titre.contenu[s.id]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pill from '../_ui/pill.vue'
import Tag from '../_ui/tag.vue'
import TagList from '../_ui/tag-list.vue'
import Dot from '../_ui/dot.vue'
import Section from '../_common/section.vue'
import Statut from '../_common/statut.vue'
import { dateFormat } from '@/utils'
import PureTitresLinkForm from './pure-titres-link-form.vue'
import {
  linkTitres,
  loadLinkableTitres,
  loadTitreLinks
} from '@/components/titre/pure-titres-link.type'
import { User } from 'camino-common/src/roles'
import { computed } from 'vue'
import { TitresTypes, TitreTypeId } from 'camino-common/src/static/titresTypes'
import {
  DemarchesTypes,
  DemarcheTypeId
} from 'camino-common/src/static/demarchesTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import {
  SubstanceLegaleId,
  SubstancesLegale
} from 'camino-common/src/static/substancesLegales'
import {
  TitresStatuts,
  TitreStatutId
} from 'camino-common/src/static/titresStatuts'

type Entreprise = {
  id: string
  nom: string
  legalSiren?: string
  operateur: boolean
}

const props = defineProps<{
  titre: {
    id: string
    domaine: { id: string }
    titreStatutId: TitreStatutId
    demarches: {
      id: string
      type: { id: DemarcheTypeId }
      phase: { dateDebut: string; dateFin: string; statut: { couleur: string } }
    }[]
    contenu: { [sectionId: string]: { [elementId: string]: unknown } }
    administrations: { id: AdministrationId }[]
    type: {
      id: TitreTypeId
      sections: { id: string; elements: { id: string }[] }[]
    }
    titulaires: Entreprise[]
    amodiataires: Entreprise[]
    substances: SubstanceLegaleId[]
    references: { nom: string; type: { nom: string } }[]
  }
  user: User
}>()
const phases = computed(() => props.titre.demarches.filter(d => d.phase))

const hasContenu = computed(
  () =>
    props.titre.contenu &&
    props.titre.type.sections &&
    props.titre.type.sections.some(s =>
      s.elements.some(
        e =>
          props.titre.contenu[s.id] &&
          props.titre.contenu[s.id][e.id] !== undefined
      )
    )
)

const type = computed(() => TitresTypes[props.titre.type.id])
const titreStatut = computed(() => TitresStatuts[props.titre.titreStatutId])
</script>
