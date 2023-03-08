import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { PureDownloads, Props } from './pure-downloads'

export const Downloads = caminoDefineComponent<Omit<Props, 'route' | 'matomo'>>(['formats', 'section'], props => {
  const route = useRoute()
  const matomo = inject('matomo', undefined)
  return () => <PureDownloads {...props} route={route} matomo={matomo} />
})
