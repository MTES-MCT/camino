<template>
  <PureAdministration
    v-if="administrationId"
    :administrationId="administrationId"
    :user="user"
    :apiClient="apiClient"
  />
  <Error v-else message="Administration inconnue" couleur="error" />
</template>

<script setup lang="ts">
import PureAdministration from './administration/pure-administration.vue'
import Error from './error.vue'
import { apiClient } from '@/api/api-client'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  AdministrationId,
  isAdministrationId
} from 'camino-common/src/static/administrations'

const store = useStore()
const route = useRoute()

const user = computed<User>(() => store.state.user.element)

const administrationId = computed<AdministrationId | null>(() => {
  if (isAdministrationId(route.params.id)) {
    return route.params.id
  }
  return null
})
</script>
