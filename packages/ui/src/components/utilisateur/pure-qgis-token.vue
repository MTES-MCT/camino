<template>
  <div class="tablet-blobs">
    <div class="tablet-blob-1-4">
      <h5>Jeton QGIS</h5>
    </div>

    <div class="tablet-blob-3-4">
      <LoadingElement v-slot="{ item }" :data="data">
        <div v-if="item.token" class="mb-s">
          Voici le jeton généré
          <Pill @click="copyToClipboard(item.token)">{{ item.token }}</Pill
          >. Assurez-vous de le copier, vous ne pourrez plus le revoir !
        </div>
        <button class="btn btn-secondary" @click="generateToken()">
          Générer un jeton QGIS
        </button>
      </LoadingElement>
      <Messages :messages="messages"></Messages>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AsyncData } from '@/api/client-rest'
import { ref } from 'vue'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { QGISToken } from 'camino-common/src/utilisateur'
import Messages from '@/components/_ui/messages.vue'
import Pill from '@/components/_ui/pill.vue'

const props = defineProps<{ generateTokenCall: () => Promise<QGISToken> }>()
const data = ref<AsyncData<QGISToken>>({ status: 'LOADED', value: {} })
const messages = ref<{ type: 'error' | 'success'; value: string }[]>([])

const generateToken = async () => {
  data.value = { status: 'LOADING' }
  try {
    const tokenData = await props.generateTokenCall()
    data.value = { status: 'LOADED', value: tokenData }
    if (tokenData.token) {
      copyToClipboard(tokenData.token)
    }
  } catch (e: any) {
    data.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
}

const copyToClipboard = (token: string) => {
  navigator.clipboard.writeText(token)
  messages.value.push({
    type: 'success',
    value: "Le jeton vient d'être copié dans votre presse papier"
  })
  setTimeout(() => {
    messages.value.shift()
  }, 4500)
}
</script>
