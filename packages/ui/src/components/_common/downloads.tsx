import { defineComponent, HTMLAttributes, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DownloadRestRoutes, DownloadFormat, CaminoRestParams } from 'camino-common/src/rest'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { AsyncData, downloadBlob } from '@/api/client-rest'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { CaminoRouteLocation } from '@/router/routes'
import { useState } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DsfrInputRadio, RadioElement } from '../_ui/dsfr-input-radio'
import { Alert } from '../_ui/alert'
import { LoadingElement } from '../_ui/functional-loader'

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
  downloadTitle: string
}

const download = async <T extends DownloadRestRoutes>(route: T, params: CaminoRestParams<T>, format: DownloadFormat | null, query: CaminoRouteLocation['query']): Promise<void> => {
  if (format === null) {
    return
  }

  const response = await downloadBlob(route, params, { format, ...query })
  if (response === undefined) {
    return
  }

  const url = window.URL.createObjectURL(response.data)
  const hiddenElement = document.createElement('a')
  hiddenElement.href = url
  hiddenElement.target = '_blank'
  hiddenElement.download = response.filename
  hiddenElement.click()
}

const isArrayWith2Elements = <T,>(elements: Readonly<NonEmptyArray<T>>): elements is Readonly<[T, T, ...T[]]> => {
  return elements.length > 1
}
export const PureDownloads = defineComponent(<T extends DownloadRestRoutes>(props: Props<T>) => {
  const [dowloadPopup, setDownloadPopup] = useState<boolean>(false)

  const downloadResult = ref<AsyncData<null>>({
    status: 'LOADED',
    value: null,
  })
  const downloadSingleFormat = async (): Promise<void> => {
    if (downloadResult.value.status === 'LOADING') {
      return
    }

    downloadResult.value = { status: 'LOADING' }
    try {
      await download(props.downloadRoute, props.params, props.formats[0], props.route.query)
      downloadResult.value = { status: 'LOADED', value: null }
    } catch (e: any) {
      downloadResult.value = { status: 'ERROR', message: e.message ?? "Une erreur s'est produite" }
    }
  }

  const openDownloadPopup = () => {
    setDownloadPopup(true)
  }
  const closeDownloadPopup = () => {
    setDownloadPopup(false)
  }

  return () => (
    <>
      {isArrayWith2Elements(props.formats) ? (
        <>
          <DsfrButtonIcon icon="fr-icon-file-download-line" buttonType="secondary" title={props.downloadTitle} onClick={openDownloadPopup} />
          {dowloadPopup.value ? <DownloadPopup close={closeDownloadPopup} {...props} formats={props.formats} /> : null}
        </>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {downloadResult.value.status !== 'LOADING' ? <DsfrButtonIcon icon="fr-icon-download-line" buttonType="secondary" title={props.downloadTitle} onClick={downloadSingleFormat} /> : null}
          {downloadResult.value.status !== 'LOADED' ? <LoadingElement data={downloadResult.value} renderItem={() => null} /> : null}
        </div>
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureDownloads.props = ['formats', 'downloadRoute', 'params', 'route', 'id', 'downloadTitle', 'class']

interface DownloadPopupProps<T extends DownloadRestRoutes> {
  id?: string
  formats: readonly [DownloadFormat, DownloadFormat, ...DownloadFormat[]]
  downloadRoute: T
  params: CaminoRestParams<T>
  route: Pick<CaminoRouteLocation, 'query'>
  downloadTitle: string
  close: () => void
}
const DownloadPopup = defineComponent(<T extends DownloadRestRoutes>(props: DownloadPopupProps<T>) => {
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat | null>(null)

  const items: RadioElement<DownloadFormat>[] = props.formats.map(f => ({ itemId: f, legend: { main: f } }))
  const fileTypeSelected = (value: DownloadFormat) => {
    setDownloadFormat(value)
  }
  const content = () => (
    <form>
      <DsfrInputRadio legend={{ main: 'Choisissez le format du fichier que vous souhaitez' }} required={true} orientation="horizontal" valueChanged={fileTypeSelected} elements={items} />
      <Alert small={true} type="info" title={'Une fois le téléchargement effectué, cette fenêtre se fermera automatiquement'} />
    </form>
  )

  return () => (
    <FunctionalPopup
      title={props.downloadTitle}
      content={content}
      close={props.close}
      validate={{
        text: 'Télécharger',
        action: () => download(props.downloadRoute, props.params, downloadFormat.value, props.route.query),
      }}
      canValidate={downloadFormat.value !== null}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DownloadPopup.props = ['formats', 'downloadRoute', 'params', 'route', 'id', 'downloadTitle', 'close']
