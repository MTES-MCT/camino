import { defineComponent, FunctionalComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PureDownloads, Props } from './pure-downloads'

export const Downloads = defineComponent<Omit<Props, 'route'>>({
  props: ['formats', 'section', 'params'] as unknown as undefined,
  setup(props) {
    const route = useRoute()
    return () => <PureDownloads {...props} route={route} />
  }
})
