<template>
  <div class="mb header-container">
    <div class="pt-m">
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

    <div class="pt-m search" style="align-self: center">
      <QuickAccessTitre />
    </div>

    <div class="pt-m flex">
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

<style scoped>
@import '@/styles/settings.css';

@media (--viewport-tablet) {
  .header-container {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (--viewport-desktop) {
  .header-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .search {
    grid-row-start: 2;
    grid-column-start: 1;
    grid-column-end: 3;
  }
}

@media (--viewport-large) {
  .header-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .search {
    grid-row-start: 1;
    grid-column-start: 2;
    grid-column-end: 2;
  }
}
</style>
