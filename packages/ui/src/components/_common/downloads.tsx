import { inject, ref, defineComponent, HTMLAttributes } from 'vue'
import { useRoute, RouteLocationNormalized, LocationQuery } from 'vue-router'
import { Dropdown, Item } from '../_ui/dropdown'
import { DownloadRestRoutes, DownloadFormat, CaminoRestParams } from 'camino-common/src/rest'
import { NonEmptyArray, isNonEmptyArray } from 'camino-common/src/typescript-tools'
import { getDownloadRestRoute } from '@/api/client-rest'
import { saveAs } from 'file-saver'
import { DsfrButtonIcon } from '../_ui/dsfr-button'

export const Downloads = defineComponent(<T extends DownloadRestRoutes>(props: Omit<Props<T>, 'route' | 'matomo'> & { class?: HTMLAttributes['class'] }) => {
  const route = useRoute()
  const matomo = inject('matomo', undefined)
  return () => <PureDownloads {...props} route={route} matomo={matomo} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Downloads.props = ['downloadRoute', 'formats', 'params', 'class']

export interface Props<T extends DownloadRestRoutes> {
  id?: string
  formats: Readonly<NonEmptyArray<DownloadFormat>>
  downloadRoute: T
  params: CaminoRestParams<T>
  route: RouteLocationNormalized
  matomo?: { trackLink: (url: string, params: string) => void }
}

export const PureDownloads = defineComponent(<T extends DownloadRestRoutes>(props: Props<T>) => {
  const downloadFormat = ref<DownloadFormat | null>(null)

  const items: Item<DownloadFormat>[] = props.formats.map(f => ({ id: f, label: f }))
  if (isNonEmptyArray(items)) {
    return () => (
      <div class="dsfr" style={{ display: 'flex' }}>
        <Dropdown
          id={props.id}
          class="fr-mr-1v"
          labelVisible={false}
          items={items}
          label="Téléchargements"
          selectedItemId={null}
          placeholder={"Choississez un format d'export"}
          selectItem={id => {
            downloadFormat.value = id
          }}
        />
        <DsfrButtonIcon
          icon="fr-icon-file-download-line"
          buttonType="secondary"
          disabled={downloadFormat.value === null}
          title={downloadFormat.value !== null ? `Télécharger au format ${downloadFormat.value}` : 'Télécharger (choisissez le format)'}
          onClick={() => download(downloadFormat.value, props.route.query, props)}
        />
      </div>
    )
  } else {
    return () => null
  }
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureDownloads.props = ['formats', 'downloadRoute', 'params', 'route', 'matomo', 'id']

export async function download<T extends DownloadRestRoutes>(selectedFormat: DownloadFormat | null, query: LocationQuery, props: Omit<Props<T>, 'formats' | 'route'>) {
  if (selectedFormat !== null) {
    const url = getDownloadRestRoute(props.downloadRoute, props.params, { format: selectedFormat, ...query })

    console.log(url)

    saveAs(url)

    if (props.matomo) {
      props.matomo.trackLink(`${window.location.origin}${url}`, 'download')
    }
  }
}
