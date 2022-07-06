<template>
  <div class="mb-xxl">
    <h3>Emails à notifier lors du dépôt d’un type d’activité</h3>

    <div class="tablet-blob-3-4">
      <div class="h6">
        <p>
          Lors d’un dépôt d’une activité d’un type en particulier
          <span v-if="!isFullyNotifiable">
            <strong>si la production annuelle est non nulle</strong></span
          >, quels sont les emails à notifier ?
        </p>
      </div>
    </div>

    <div class="line width-full" />

    <div class="width-full-p">
      <div class="overflow-scroll-x mb">
        <table>
          <tr>
            <th>Type d'activité</th>
            <th>Email</th>
            <th v-if="administration.emailsModification" width="1">Actions</th>
          </tr>
          <tr v-if="administration.emailsModification">
            <td>
              <select
                v-model="activiteTypeNew.activiteTypeId"
                class="py-xs px-s mr-s mt-xs"
              >
                <option
                  v-for="activiteType in activitesTypes"
                  :key="activiteType.id"
                  :value="activiteType.id"
                >
                  {{ activiteTypeLabelize(activiteType) }}
                </option>
              </select>
            </td>
            <td>
              <input
                v-model="activiteTypeNew.email"
                type="email"
                class="py-xs mt-xs"
                placeholder="Email"
                @keyup.enter="activiteTypeEmailUpdate"
              />
            </td>
            <td>
              <ButtonPlus
                class="py-s px-m"
                :disabled="!activiteTypeNewActive"
                @click="activiteTypeEmailUpdate"
              />
            </td>
          </tr>
          <tr
            v-for="activiteTypeEmail in activitesTypesEmails"
            :key="activiteTypeEmail.activiteTypeId + activiteTypeEmail.email"
          >
            <td>
              <span class="cap-first">
                {{ activiteTypeIdLabelize(activiteTypeEmail.activiteTypeId) }}
              </span>
            </td>
            <td>
              {{ activiteTypeEmail.email }}
            </td>
            <td v-if="administration.emailsModification">
              <button
                class="btn-border py-s px-m my--xs rnd-xs flex-right"
                @click="activiteTypeEmailDelete(activiteTypeEmail)"
              >
                <Icon name="delete" size="M" />
              </button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ButtonPlus from '../_ui/button-plus.vue'
import emailValidator from 'email-validator'
import { defineComponent, PropType } from 'vue'
import Icon from '@/components/_ui/icon.vue'

export default defineComponent({
  components: {
    Icon,
    ButtonPlus
  },

  props: {
    administration: { type: Object, required: true },
    activitesTypes: {
      type: Array as PropType<{ id: string; nom: string }[]>,
      required: true,
      default: () => []
    },
    activitesTypesEmails: { type: Array, required: true, default: () => [] }
  },

  emits: ['emailUpdate', 'emailDelete'],

  data() {
    return {
      activiteTypeNew: {
        activiteTypeId: null,
        email: null
      }
    }
  },

  computed: {
    activiteTypeNewActive() {
      return (
        this.activiteTypeNew.activiteTypeId &&
        this.activiteTypeNew.email &&
        emailValidator.validate(this.activiteTypeNew.email)
      )
    },

    isFullyNotifiable() {
      return ['dea', 'dre', 'min'].includes(this.administration?.type?.id)
    }
  },

  methods: {
    async activiteTypeEmailUpdate() {
      if (!this.activiteTypeNewActive) return
      const { email, activiteTypeId } = this.activiteTypeNew
      this.$emit('emailUpdate', {
        administrationId: this.administration.id,
        activiteTypeId,
        email
      })
      this.activiteTypeNew.activiteTypeId = null
      this.activiteTypeNew.email = null
    },

    async activiteTypeEmailDelete({
      activiteTypeId,
      email
    }: {
      email: string
      activiteTypeId: string
    }) {
      this.$emit('emailDelete', {
        administrationId: this.administration.id,
        activiteTypeId,
        email
      })
    },

    activiteTypeIdLabelize(activiteTypeId: string) {
      const activiteType = this.activitesTypes.find(
        ({ id }) => id === activiteTypeId
      )

      return activiteType ? this.activiteTypeLabelize(activiteType) : ''
    },

    activiteTypeLabelize(activiteType: { nom: string; id: string }) {
      return (
        activiteType.nom.charAt(0).toUpperCase() +
        activiteType.nom.slice(1) +
        ' (' +
        activiteType.id.toUpperCase() +
        ')'
      )
    }
  }
})
</script>
