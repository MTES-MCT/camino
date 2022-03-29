<template>
  <div class="tablet-blobs mb flex-align-items-stretch">
    <div class="tablet-blob-1-3 pt-m">
      <router-link :to="{ name: 'homepage' }" class="flex text-decoration-none">
        <img src="/img/logo-rf.svg" alt="logo" class="logo mr" />
        <div>
          <p class="mb-0 mt-xs title">
            camino<span class="color-neutral">.beta.gouv.fr</span>
          </p>
          <p class="h6 mb-0 bold color-text">
            Le cadastre minier numérique ouvert
          </p>
        </div>
      </router-link>
    </div>

    <div class="tablet-blob-1-3 pt-m flex" style="align-self: center">
      <QuickAccessTitre />
    </div>

    <div class="tablet-blob-1-3 flex">
      <div v-if="!apiError && loaded" class="flex-right">
        <div class="mt-m tablet-mb-m flex">
          <div class="ml-xs flex">
            <UserButton />
          </div>
          <div class="ml-xs">
            <MenuButton />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserButton from '../user/button.vue'
import MenuButton from '../menu/button.vue'
import QuickAccessTitre from '@/components/page/quick-access-titre.vue'

export default {
  name: 'PageHeader',

  components: {
    QuickAccessTitre,
    UserButton,
    MenuButton
  },

  props: {
    loaded: { type: Boolean, default: false }
  },

  computed: {
    apiError() {
      return this.$store.state.apiError
    }
  }
}
</script>
