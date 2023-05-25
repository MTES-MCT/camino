import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { HTMLAttributes, inject, ref } from 'vue'
import { useRoute, RouteLocationNormalized } from 'vue-router'
import { Dropdown } from '../_ui/dropdown'
import { Download } from './download'
import { DownloadRestRoutes, DownloadFormat, CaminoRestParams } from 'camino-common/src/rest'

const DownloadsGeneric = <T extends DownloadRestRoutes>() =>
  caminoDefineComponent<Omit<Props<T>, 'route' | 'matomo'>>(['formats', 'downloadRoute', 'params'], props => {
    const route = useRoute()
    const matomo = inject('matomo', undefined)
    return () => <PureDownloads {...props} route={route} matomo={matomo} />
  })

export const Downloads = <T extends DownloadRestRoutes>(props: Omit<Props<T>, 'route' | 'matomo'> & { class: HTMLAttributes['class'] }): JSX.Element => {
  const HiddenDownloads = DownloadsGeneric<T>()
  // @ts-ignore
  return <HiddenDownloads {...props} />
}
export interface Props<T extends DownloadRestRoutes> {
  formats: DownloadFormat[]
  downloadRoute: T
  params: CaminoRestParams<T>
  route: RouteLocationNormalized
  matomo?: { trackLink: (url: string, params: string) => void }
}

const PureDownloadsGeneric = <T extends DownloadRestRoutes>() =>
  caminoDefineComponent<Props<T>>(['formats', 'downloadRoute', 'route', 'matomo', 'params'], props => {
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
  })

export const PureDownloads = <T extends DownloadRestRoutes>(props: Props<T>): JSX.Element => {
  const HiddenDownloads = PureDownloadsGeneric<T>()
  // @ts-ignore
  return <HiddenDownloads {...props} />
}
