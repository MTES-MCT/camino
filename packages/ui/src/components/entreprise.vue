<template>
  <Loader v-if="!loaded" />
  <div v-else>
    <h5>Entreprise</h5>
    <h1>
      {{ nom }}
    </h1>
    <Accordion class="mb-xxl" :slotSub="true" :slotButtons="true">
      <template #title>
        <span class="cap-first"> Profil </span>
      </template>

      <template v-if="entreprise.modification" #buttons>
        <DocumentAddButton
          :route="route"
          :document="documentNew"
          :title="nom"
          repertoire="entreprises"
          class="btn py-s px-m mr-px"
        />
        <button class="btn py-s px-m" @click="editPopupOpen">
          <Icon size="M" name="pencil" />
        </button>
      </template>

      <template #sub>
        <div class="px-m pt-m border-b-s">
          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Siren</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>{{ entreprise.legalSiren }}</p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Forme juridique</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>{{ entreprise.legalForme }}</p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>
                Établissement{{
                  entreprise.etablissements.length > 1 ? 's' : ''
                }}
              </h5>
            </div>
            <div class="tablet-blob-3-4">
              <ul class="list-sans">
                <li v-for="e in entreprise.etablissements" :key="e.id">
                  <h6 class="inline-block">
                    {{ dateFormat(e.dateDebut) }}
                  </h6>
                  : {{ e.nom }}
                </li>
              </ul>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Adresse</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>
                {{ entreprise.adresse }}
                <br />{{ entreprise.codePostal }}
                {{ entreprise.commune }}
              </p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Téléphone</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p class="word-break">
                <span v-if="entreprise.telephone">{{
                  entreprise.telephone
                }}</span>
                <span v-else>–</span>
              </p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Email</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p class="word-break">
                <a
                  v-if="entreprise.email"
                  :href="`mailto:${entreprise.email}`"
                  class="btn small bold py-xs px-s rnd"
                >
                  {{ entreprise.email }}
                </a>
                <span v-else>–</span>
              </p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Site</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p class="word-break">
                <a
                  v-if="entreprise.url"
                  :href="entreprise.url"
                  class="btn small bold py-xs px-s rnd"
                >
                  {{ entreprise.url }}
                </a>
                <span v-else>–</span>
              </p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Archivée</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>{{ entreprise.archive ? 'Oui' : 'Non' }}</p>
            </div>
          </div>
        </div>

        <div v-if="entreprise.documents.length">
          <h4 class="px-m pt mb-0">Documents</h4>
          <Documents
            :boutonModification="entreprise.modification"
            :boutonSuppression="canDeleteDocument(entreprise, user)"
            :route="route"
            :documents="entreprise.documents"
            :etiquette="entreprise.modification"
            :parentId="entreprise.id"
            :title="nom"
            repertoire="entreprises"
            class="px-m"
          />
        </div>
      </template>
    </Accordion>
    <div v-if="fiscaliteVisible" class="mb-xxl">
      <div class="line-neutral width-full mb-xxl" />
      <h3>Fiscalité</h3>
      <EntrepriseFiscalite
        :getFiscaliteEntreprise="getFiscaliteEntreprise"
        :anneeCourante="annees[annees.length - 1]"
        :annees="annees"
      />
    </div>
    <div v-if="utilisateurs && utilisateurs.length" class="mb-xxl">
      <div class="line-neutral width-full mb-xxl" />
      <h3>Utilisateurs</h3>
      <div class="line width-full" />
      <UiTable
        class="width-full-p"
        :columns="utilisateursColonnes"
        :rows="utilisateursLignes"
        :utilisateurs="utilisateurs"
      />
    </div>

    <div v-if="titulaireTitres && titulaireTitres.length" class="mb-xxl">
      <div class="line-neutral width-full mb-xxl" />
      <h3>Titres miniers et autorisations</h3>
      <div class="line width-full" />
      <TitresTable :titres="titulaireTitres" />
    </div>

    <div v-if="amodiataireTitres && amodiataireTitres.length" class="mb-xxl">
      <div class="line width-full my-xxl" />
      <h3>Titres miniers et autorisations (amodiataire)</h3>
      <div class="line width-full" />
      <TitresTable :titres="amodiataireTitres" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Accordion from './_ui/accordion.vue'
import Loader from './_ui/loader.vue'
import UiTable from './_ui/table.vue'
import TitresTable from './titres/table.vue'
import EntrepriseEditPopup from './entreprise/edit-popup.vue'
import DocumentAddButton from './document/button-add.vue'
import Documents from './documents/list.vue'
import { dateFormat } from '../utils/index'
import EntrepriseFiscalite from './entreprise/pure-entreprise-fiscalite.vue'

import {
  utilisateursColonnes,
  utilisateursLignesBuild
} from './utilisateurs/table'
import {
  Fiscalite,
  fiscaliteVisible as fiscaliteVisibleFunc
} from 'camino-common/src/fiscalite'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isSuper,
  User
} from 'camino-common/src/roles'
import Icon from './_ui/icon.vue'
import { CaminoAnnee, valideAnnee } from 'camino-common/src/date'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { fetchWithJson } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'

const store = useStore()
const vueRoute = useRoute()

const getFiscaliteEntreprise = async (annee: CaminoAnnee): Promise<Fiscalite> =>
  fetchWithJson(CaminoRestRoutes.fiscaliteEntreprise, {
    annee,
    entrepriseId: entreprise.value.id
  })

const annees = computed(() => {
  const anneeDepart = 2021
  const anneeCourante = new Date().getFullYear()
  const caminoAnneeCourante = valideAnnee(anneeCourante.toString())
  let anneeAAjouter = anneeDepart
  const annees = [valideAnnee(anneeAAjouter.toString())]
  while (annees[annees.length - 1] !== caminoAnneeCourante) {
    anneeAAjouter++
    annees.push(valideAnnee(anneeAAjouter.toString()))
  }
  return annees
})
const entreprise = computed(() => store.state.entreprise.element)
const nom = computed(() => (entreprise.value && entreprise.value.nom) ?? '-')
const utilisateurs = computed(() => entreprise.value.utilisateurs)
const utilisateursLignes = computed(() =>
  utilisateursLignesBuild(utilisateurs.value)
)
const titulaireTitres = computed(() => entreprise.value.titulaireTitres)
const amodiataireTitres = computed(() => entreprise.value.amodiataireTitres)
const user = computed(() => store.state.user.element)
const loaded = computed(() => !!entreprise.value)
const documentNew = computed(() => ({
  entrepriseId: entreprise.value.id,
  entreprisesLecture: false,
  publicLecture: false,
  fichier: null,
  fichierNouveau: null,
  fichierTypeId: null,
  typeId: ''
}))

const route = computed(() => ({ id: entreprise.value.id, name: 'entreprise' }))
const fiscaliteVisible = computed(() =>
  fiscaliteVisibleFunc(user.value, entreprise.value.id, [
    ...titulaireTitres.value,
    ...amodiataireTitres.value
  ])
)
const get = async () => {
  await store.dispatch('entreprise/get', vueRoute.params.id)
}

watch(
  () => vueRoute.params.id,
  newRoute => {
    if (vueRoute.name === 'entreprise' && newRoute) {
      get()
    }
  }
)
watch(
  () => user,
  _newUser => get()
)

onMounted(async () => {
  await get()
})

onBeforeUnmount(() => {
  store.commit('entreprise/reset')
})

const editPopupOpen = () => {
  const entrepriseEdit = {
    id: entreprise.value.id,
    telephone: entreprise.value.telephone,
    url: entreprise.value.url,
    email: entreprise.value.email,
    archive: entreprise.value.archive
  }

  store.commit('popupOpen', {
    component: EntrepriseEditPopup,
    props: {
      entreprise: entrepriseEdit
    }
  })
}

const canDeleteDocument = (
  entreprise: { modification?: boolean },
  user: User
): boolean => {
  return (
    (entreprise.modification ?? false) &&
    (isSuper(user) ||
      isAdministrationAdmin(user) ||
      isAdministrationEditeur(user))
  )
}
</script>
