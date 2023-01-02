<template>
  <Statut
    :color="element.couleur"
    :nom="element.nom"
    class="inline-block mb-s"
  />
</template>

<script>
import { Statut } from '../statut'

export default {
  components: {
    Statut
  },

  props: {
    element: { type: Object, default: () => ({}) }
  }
}
</script>
