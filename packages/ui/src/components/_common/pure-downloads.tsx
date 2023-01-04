import { defineComponent, FunctionalComponent, ref } from 'vue'
import { RouteLocationNormalized, useRoute } from 'vue-router'
import { Dropdown } from '../_ui/dropdown'
import Download from './download.vue'

export interface Props {
  formats: string[]
  section: string
  params: any
  route: RouteLocationNormalized
}
export const PureDownloads = defineComponent<Props>({
  props: ['route', 'formats', 'section', 'params'] as unknown as undefined,
  setup(props) {
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
                    key={format}
                    format={format}
                    class="btn-alt small px-s py-s full-x border-b-s"
                    section={props.section}
                    query={props.route.query}
                    params={props.params}
                    onClicked={toggle}
                  />
                )
              })}
            </div>
          )
        }}
      >
        <div></div>
      </Dropdown>
    )
  }
})
