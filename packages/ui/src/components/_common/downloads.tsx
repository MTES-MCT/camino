import { inject, ref, defineComponent, HTMLAttributes } from 'vue'
import { useRoute, RouteLocationNormalized } from 'vue-router'
import { Dropdown } from '../_ui/dropdown'
import { Download } from './download'
import { DownloadRestRoutes, DownloadFormat, CaminoRestParams } from 'camino-common/src/rest'

export const Downloads = defineComponent(
  <T extends DownloadRestRoutes>(props: Omit<Props<T>, 'route' | 'matomo'> & { class?: HTMLAttributes['class'] }) => {
    const route = useRoute()
    const matomo = inject('matomo', undefined)
    return () => <PureDownloads {...props} route={route} matomo={matomo} />
  },
  { props: ['downloadRoute', 'formats', 'params', 'class'] }
)

export interface Props<T extends DownloadRestRoutes> {
  formats: DownloadFormat[]
  downloadRoute: T
  params: CaminoRestParams<T>
  route: RouteLocationNormalized
  matomo?: { trackLink: (url: string, params: string) => void }
}

export const PureDownloads = defineComponent(
  <T extends DownloadRestRoutes>(props: Props<T>) => {
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
                    downloadRoute={props.downloadRoute}
                    params={props.params}
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
  },
  { props: ['formats', 'downloadRoute', 'params', 'route', 'matomo'] }
)
