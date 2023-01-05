import { defineComponent, inject } from 'vue'
import { useRoute } from 'vue-router'
import { PureDownloads, Props } from './pure-downloads'

export const Downloads = defineComponent<Omit<Props, 'route' | 'matomo'>>({
  props: ['formats', 'section'] as unknown as undefined,
  setup(props) {
    const route = useRoute()
    const matomo = inject('matomo', undefined)
    return () => <PureDownloads {...props} route={route} matomo={matomo} />
  }
})
