import { inject, ref, defineComponent, HTMLAttributes } from 'vue'
import { useRoute, RouteLocationNormalized } from 'vue-router'
import { Dropdown, Item } from '../_ui/dropdown'
import { DownloadRestRoutes, DownloadFormat, CaminoRestParams } from 'camino-common/src/rest'
import { NonEmptyArray, isNonEmptyArray } from 'camino-common/src/typescript-tools'
import { ButtonIcon } from '../_ui/button-icon'
import { getDownloadRestRoute } from '@/api/client-rest'
import { saveAs } from 'file-saver'

export const Downloads = defineComponent(
  <T extends DownloadRestRoutes>(props: Omit<Props<T>, 'route' | 'matomo'> & { class?: HTMLAttributes['class'] }) => {
    const route = useRoute()
    const matomo = inject('matomo', undefined)
    return () => <PureDownloads {...props} route={route} matomo={matomo} />
  },
  { props: ['downloadRoute', 'formats', 'params', 'class'] }
)

export interface Props<T extends DownloadRestRoutes> {
  formats: NonEmptyArray<DownloadFormat>
  downloadRoute: T
  params: CaminoRestParams<T>
  route: RouteLocationNormalized
  matomo?: { trackLink: (url: string, params: string) => void }
}

export const PureDownloads = defineComponent(
  <T extends DownloadRestRoutes>(props: Props<T>) => {
    const downloadFormat = ref<DownloadFormat | null>(null)

    const items: Item<DownloadFormat>[] = props.formats.map(f => ({id: f, label: f}))
    if (isNonEmptyArray(items)) {
      return () => (
        <div class="dsfr">
        <Dropdown
            items={items}
            label='Téléchargements'
            selectedItemId={null}
            selectItem={(id) => {downloadFormat.value = id}}
        />
        <ButtonIcon icon='download' disabled={downloadFormat.value === null} title={`Télécharger au format ${downloadFormat.value}`} onClick={() => download(downloadFormat.value, props)} />
        </div>
      )
    } else {
      return () => null
    }
    
  },
  { props: ['formats', 'downloadRoute', 'params', 'route', 'matomo'] }
)

async function download<T extends DownloadRestRoutes>(selectedFormat: DownloadFormat, props: Props<T>) {
  const url = getDownloadRestRoute(props.downloadRoute, props.params, { format: selectedFormat, ...props.route.query })

  saveAs(url)

  if (props.matomo) {
    props.matomo.trackLink(`${window.location.origin}${url}`, 'download')
  }
}
