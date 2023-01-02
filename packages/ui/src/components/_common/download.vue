<template>
  <button class="flex" @click="download">
    <span class="mt-xxs">{{ format }}</span>
    <div class="flex-right pl-xs">
      <Icon size="M" name="download" />
    </div>
  </button>
</template>

<script>
import { Icon } from '@/components/_ui/icon'
export default {
  components: { Icon },
  props: {
    section: { type: String, required: true },

    format: { type: String, required: true },

    query: { type: Object, default: () => ({}) },

    params: { type: Object, default: () => ({}) }
  },

  emits: ['clicked'],

  methods: {
    async download() {
      this.$emit('clicked')
      const query = new URLSearchParams({
        format: this.format,
        ...this.query,
        ...this.params
      }).toString()

      const url = `/${this.section}?${query}`

      await this.$store.dispatch('download', url)

      this.linkTrack(url)
    },

    linkTrack(url) {
      if (this.$matomo) {
        this.$matomo.trackLink(`${window.location.origin}${url}`, 'download')
      }
    }
  }
}
</script>
