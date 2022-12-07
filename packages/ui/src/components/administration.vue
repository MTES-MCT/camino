<template>
  <Loader v-if="!loaded" />
  <div v-else>
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
                {{ type }}
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

    <div v-if="utilisateurs && utilisateurs.length" class="mb-xxl">
      <div class="line-neutral width-full mb-xxl" />
      <h2>Utilisateurs</h2>
      <div class="line width-full" />
      <UiTable
        class="width-full-p"
        :columns="utilisateursColonnes"
        :rows="utilisateursLignes"
        :utilisateurs="utilisateurs"
      />
    </div>

    <LoadingElement v-slot="{ item }" :data="asyncActivitesTypesEmails">
      <div v-if="item.length && canReadActivitesTypesEmails">
        {{ item }}
        <div class="line-neutral width-full mb-xxl" />
        <h2>Emails</h2>
        <AdministrationActiviteTypeEmail
          :administration="administration"
          :activitesTypes="activitesTypes"
          :activitesTypesEmails="item"
          @emailUpdate="activiteTypeEmailUpdate"
          @emailDelete="activiteTypeEmailDelete"
        />
      </div>
    </LoadingElement>
    <div v-if="isSuper(user)" class="mb-xxl">
      <div class="line-neutral width-full mb-xxl" />
      <h2>Permissions</h2>

      <AdministrationPermission :administration="administration" />
    </div>
  </div>
</template>

<script>
import Accordion from './_ui/accordion.vue'
import Loader from './_ui/loader.vue'
import UiTable from './_ui/table.vue'
import LoadingElement from './_ui/pure-loader.vue'
import AdministrationPermission from './administration/permissions.vue'
import AdministrationActiviteTypeEmail from './administration/activites-types-emails.vue'

import {
  utilisateursColonnes,
  utilisateursLignesBuild
} from './utilisateurs/table'
import {
  ADMINISTRATION_TYPES,
  Administrations
} from 'camino-common/src/static/administrations'
import { isSuper } from 'camino-common/src/roles'
import { canReadActivitesTypesEmails } from 'camino-common/src/permissions/administrations'
import { Departements } from 'camino-common/src/static/departement'
import { Regions } from 'camino-common/src/static/region'
import { administrationActivitesTypesEmails } from '../api/administrations.js'

export default {
  components: {
    Accordion,
    Loader,
    UiTable,
    AdministrationPermission,
    AdministrationActiviteTypeEmail,
    LoadingElement
  },

  data() {
    return {
      utilisateursColonnes,
      asyncActivitesTypesEmails: { status: 'LOADING' }
    }
  },

  computed: {
    administration() {
      const element = this.$store.state.administration.element
      return { ...element, ...Administrations[this.$route.params.id] }
    },
    type() {
      const typeId = this.administration?.typeId

      if (typeId) {
        return ADMINISTRATION_TYPES[typeId].nom
      }

      return ''
    },

    utilisateurs() {
      return this.administration.utilisateurs
    },

    utilisateursLignes() {
      return utilisateursLignesBuild(this.utilisateurs)
    },

    user() {
      return this.$store.state.user.element
    },

    loaded() {
      return !!this.$store.state.administration.element
    },

    activitesTypes() {
      return this.$store.state.administration.metas.activitesTypes
    },
    departement() {
      return this.administration.departementId
        ? Departements[this.administration.departementId]
        : undefined
    },
    region() {
      return this.administration.regionId
        ? Regions[this.administration.regionId]
        : undefined
    },

    canReadActivitesTypesEmails() {
      return canReadActivitesTypesEmails(this.user, this.administration.id)
    }
  },

  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'administration' && id) {
        this.get()
      }
    },

    user: 'get'
  },

  created() {
    this.get()
  },

  beforeUnmount() {
    this.$store.commit('administration/reset')
  },

  methods: {
    async get() {
      await this.$store.dispatch('administration/init')
      await this.$store.dispatch('administration/get', this.$route.params.id)

      if (this.canReadActivitesTypesEmails) {
        try {
          const activitesTypesEmails = await administrationActivitesTypesEmails(
            { id: this.administration.id }
          )
          this.asyncActivitesTypesEmails = {
            status: 'LOADED',
            value: activitesTypesEmails
          }
        } catch (e) {
          console.log('error', e)
          this.asyncActivitesTypesEmails = {
            status: 'ERROR',
            message: e.message ?? 'something wrong happened'
          }
        }
      } else {
        this.asyncActivitesTypesEmails = { status: 'LOADED', value: [] }
      }
    },

    isSuper(user) {
      return isSuper(user)
    },

    async activiteTypeEmailUpdate({ administrationId, activiteTypeId, email }) {
      await this.$store.dispatch('administration/activiteTypeEmailUpdate', {
        administrationId,
        activiteTypeId,
        email
      })
    },

    async activiteTypeEmailDelete({ administrationId, activiteTypeId, email }) {
      await this.$store.dispatch('administration/activiteTypeEmailDelete', {
        administrationId,
        activiteTypeId,
        email
      })
    }
  }
}
</script>
