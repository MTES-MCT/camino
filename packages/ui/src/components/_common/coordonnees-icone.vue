<template>
  <div v-if="coordonnees" class="p-xs"><Icon size="S" name="globe" /></div>
</template>

<script>
import { Icon } from '@/components/_ui/icon'
export default {
  components: { Icon },
  props: {
    coordonnees: { type: Object, default: null }
  }
}
</script>
