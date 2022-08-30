<template>
  <div>
    <h5>Newsletter</h5>

    <div class="blobs-mini mb">
      <div class="blob-mini-2-3">
        <input
          v-model="email"
          type="text"
          placeholder="Email"
          class="p-s rnd-l-xs small"
        />
      </div>
      <div class="blob-mini-1-3">
        <button class="btn rnd-r-xs p-s full-x small" @click="subscribe">
          S'inscrire
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { newsletterInscrire } from '@/api/utilisateurs'
import { useStore } from 'vuex'
const store = useStore()

const email = ref<string>('')

const subscribe = async () => {
  if (email.value) {
    try {
      const message = await newsletterInscrire({
        email: email.value
      })

      await store.dispatch(
        'messageAdd',
        { value: message, type: 'info' },
        { root: true }
      )
    } catch (e) {
      await store.dispatch(
        'messageAdd',
        { value: e, type: 'error' },
        { root: true }
      )
    }
  }
}
</script>
