import { ref, defineComponent, HTMLAttributes, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DsfrSelect, Item } from '../_ui/dsfr-select'
import { DownloadRestRoutes, DownloadFormat, CaminoRestParams } from 'camino-common/src/rest'
import { NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { getDownloadRestRoute } from '@/api/client-rest'
import { saveAs } from 'file-saver'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { CaminoRouteLocation } from '@/router/routes'

export const Downloads = defineComponent(<T extends DownloadRestRoutes>(props: Omit<Props<T>, 'route'>) => {
  const route = useRoute()

  return () => <PureDownloads {...props} route={route} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Downloads.props = ['downloadRoute', 'formats', 'params', 'class', 'downloadTitle']

export interface Props<T extends DownloadRestRoutes> {
  id?: string
  class?: HTMLAttributes['class']
  formats: Readonly<NonEmptyArray<DownloadFormat>>
  downloadRoute: T
  params: CaminoRestParams<T>
  route: Pick<CaminoRouteLocation, 'query'>
  downloadTitle?: string
}

export const PureDownloads = defineComponent(<T extends DownloadRestRoutes>(props: Props<T>) => {
  const downloadFormat = ref<DownloadFormat | null>(null)

  watch(
    () => props.formats,
    formats => {
      if (formats.length === 1) {
        downloadFormat.value = formats[0]
      }
    },
    { immediate: true, deep: true }
  )

  const items: Item<DownloadFormat>[] = props.formats.map(f => ({ id: f, label: f }))
  if (isNonEmptyArray(items)) {
    return () => (
      <div style={{ display: 'flex' }}>
        {props.formats.length > 1 ? (
          <DsfrSelect
            id={props.id}
            class="fr-mr-1v"
            items={items}
            legend={{ main: 'Téléchargements', visible: false, placeholder: "Choississez un format d'export" }}
            initialValue={downloadFormat.value}
            valueChanged={id => {
              downloadFormat.value = id
            }}
          />
        ) : null}

        <DsfrButtonIcon
          icon="fr-icon-file-download-line"
          buttonType="secondary"
          disabled={downloadFormat.value === null}
          title={
            isNotNullNorUndefined(props.downloadTitle) ? props.downloadTitle : downloadFormat.value !== null ? `Télécharger au format ${downloadFormat.value}` : 'Télécharger (choisissez le format)'
          }
          onClick={() => download(downloadFormat.value, props.route.query, props)}
        />
      </div>
    )
  } else {
    return () => null
  }
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureDownloads.props = ['formats', 'downloadRoute', 'params', 'route', 'id', 'downloadTitle', 'class']

async function download<T extends DownloadRestRoutes>(selectedFormat: DownloadFormat | null, query: CaminoRouteLocation['query'], props: Omit<Props<T>, 'formats' | 'route'>) {
  if (selectedFormat !== null) {
    const url = getDownloadRestRoute(props.downloadRoute, props.params, { format: selectedFormat, ...query })

    saveAs(url)
  }
}
