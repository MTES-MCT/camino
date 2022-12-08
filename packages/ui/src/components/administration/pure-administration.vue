<template>
  <div>
    <h5>Administration</h5>
    <h1>
      {{ administration.abreviation }}
    </h1>
    <Accordion class="mb-xxl" :slotSub="true" :slotButtons="true">
      <template #title>
        <span class="cap-first">{{ administration.nom }}</span>
      </template>

      <template #sub>
        <div class="px-m pt-m border-b-s">
          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Type</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p class="word-break">
                {{ type.nom }}
              </p>
            </div>
          </div>

          <div v-if="administration.service" class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Service</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p class="word-break">
                {{ administration.service }}
              </p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Adresse</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>
                {{ administration.adresse1 }}
                <span v-if="administration.adresse2"
                  ><br />{{ administration.adresse2 }}</span
                >
                <br />{{ administration.codePostal }}
                {{ administration.commune }}
              </p>
            </div>
          </div>

          <div class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Téléphone</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p class="word-break">
                <span v-if="administration.telephone">{{
                  administration.telephone
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
                  v-if="administration.email"
                  :href="`mailto:${administration.email}`"
                  class="btn small bold py-xs px-s rnd"
                >
                  {{ administration.email }}
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
                  v-if="administration.url"
                  :href="administration.url"
                  class="btn small bold py-xs px-s rnd"
                >
                  {{ administration.url }}
                </a>
                <span v-else>–</span>
              </p>
            </div>
          </div>

          <div v-if="departement" class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Département</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>
                {{ departement.nom }}
              </p>
            </div>
          </div>

          <div v-if="region" class="tablet-blobs">
            <div class="tablet-blob-1-4">
              <h5>Région</h5>
            </div>
            <div class="tablet-blob-3-4">
              <p>
                {{ region.nom }}
              </p>
            </div>
          </div>

          <div
            v-if="isSuper(user) && (region || departement)"
            class="tablet-blobs"
          >
            <div class="tablet-blob-1-4" />
            <div class="tablet-blob-3-4">
              <p class="h6 mb">
                Un utilisateur d'une <b>administration locale</b> peut créer et
                modifier le contenu des titres du territoire concerné.
              </p>
            </div>
          </div>
        </div>
      </template>
    </Accordion>

    <LoadingElement v-slot="{ item }" :data="utilisateurs">
      <div class="mb-xxl">
        <div class="line-neutral width-full mb-xxl" />
        <h2>Utilisateurs</h2>
        <div class="line width-full" />
        <UiTable
          class="width-full-p"
          :columns="utilisateursColonnes"
          :rows="utilisateursLignesBuild(item)"
          :utilisateurs="item"
        />
      </div>
    </LoadingElement>

    <LoadingElement v-slot="{ item }" :data="activitesTypesEmails">
      <div
        v-if="
          item.length && canReadActivitesTypesEmails(user, administrationId)
        "
      >
        <div class="line-neutral width-full mb-xxl" />
        <h2>Emails</h2>
        <AdministrationActiviteTypeEmail
          :user="user"
          :administration="administration"
          :activitesTypesEmails="item"
          @emailUpdate="apiClient.administrationActiviteTypeEmailUpdate"
          @emailDelete="apiClient.administrationActiviteTypeEmailDelete"
        />
      </div>
    </LoadingElement>
    <div v-if="isSuper(user)" class="mb-xxl">
      <div class="line-neutral width-full mb-xxl" />
      <h2>Permissions</h2>

      <AdministrationPermission
        :administrationId="administrationId"
        :apiClient="apiClient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Accordion from '../_ui/accordion.vue'
import UiTable from '../_ui/table.vue'
import LoadingElement from '../_ui/pure-loader.vue'
import AdministrationPermission from './permissions.vue'
import AdministrationActiviteTypeEmail from './activites-types-emails.vue'

import {
  utilisateursColonnes,
  utilisateursLignesBuild
} from '../utilisateurs/table'
import {
  ADMINISTRATION_TYPES,
  Administrations,
  AdministrationId,
  Administration,
  AdministrationType
} from 'camino-common/src/static/administrations'
import { isSuper, User } from 'camino-common/src/roles'
import { canReadActivitesTypesEmails } from 'camino-common/src/permissions/administrations'
import { Departement, Departements } from 'camino-common/src/static/departement'
import { Region, Regions } from 'camino-common/src/static/region'
import { computed, onMounted, ref } from 'vue'
import { ActiviteTypeEmail, ApiClient, Utilisateur } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'

const props = defineProps<{
  administrationId: AdministrationId
  user: User
  apiClient: Pick<
    ApiClient,
    | 'activitesTypesEmails'
    | 'administrationUtilisateurs'
    | 'administrationMetas'
    | 'administrationActiviteTypeEmailUpdate'
    | 'administrationActiviteTypeEmailDelete'
  >
}>()

const administration = computed<Administration>(
  () => Administrations[props.administrationId]
)
const type = computed<AdministrationType>(
  () => ADMINISTRATION_TYPES[administration.value.typeId]
)
const departement = computed<Departement | undefined>(() => {
  return administration.value.departementId
    ? Departements[administration.value.departementId]
    : undefined
})
const region = computed<Region | undefined>(() => {
  return administration.value.regionId
    ? Regions[administration.value.regionId]
    : undefined
})
const activitesTypesEmails = ref<AsyncData<ActiviteTypeEmail[]>>({
  status: 'LOADING'
})
const utilisateurs = ref<AsyncData<Utilisateur[]>>({ status: 'LOADING' })

onMounted(async () => {
  try {
    activitesTypesEmails.value = {
      status: 'LOADED',
      value: await props.apiClient.activitesTypesEmails(props.administrationId)
    }
  } catch (e: any) {
    console.error('error', e)
    activitesTypesEmails.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }

  try {
    utilisateurs.value = {
      status: 'LOADED',
      value: await props.apiClient.administrationUtilisateurs(
        props.administrationId
      )
    }
  } catch (e: any) {
    console.error('error', e)
    utilisateurs.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>
