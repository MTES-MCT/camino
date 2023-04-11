import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { ref } from 'vue'
import { RouteLocationNormalized } from 'vue-router'
import { Dropdown } from '../_ui/dropdown'
import { Download } from './download'

export interface Props {
  formats: string[]
  section: string
  route: RouteLocationNormalized
  matomo?: { trackLink: (url: string, params: string) => void }
}
export const PureDownloads = caminoDefineComponent<Props>(['formats', 'section', 'route', 'matomo'], props => {
  const opened = ref<boolean>(false)
  const toggle = (newState: boolean) => {
    opened.value = newState
  }
  return () => (
    <Dropdown
      class="full-x"
      open={opened.value}
      onToggle={toggle}
      title={() => <span class="h6">Téléchargements</span>}
      content={() => {
        return (
          <div>
            {props.formats.map(format => {
              return (
                <Download
                  class="btn-alt small px-s py-s full-x border-b-s"
                  key={format}
                  format={format}
                  section={props.section}
                  query={props.route.query}
                  matomo={props.matomo}
                  onClicked={() => toggle(!opened.value)}
                />
              )
            })}
          </div>
        )
      }}
    />
  )
})