import { FunctionalComponent, HTMLAttributes } from 'vue'
import { LocationQuery } from 'vue-router'
import { Icon } from '../_ui/icon'
import { saveAs } from 'file-saver'
import { CaminoRestRoute, DownloadFormat, ParseUrlParams } from 'camino-common/src/rest'
import { getUiRestRoute } from '../../api/client-rest'

export type Props<T> = {
  downloadRoute: T
  params: ParseUrlParams<T>
  format: DownloadFormat
  query: LocationQuery
  onClicked: () => void
  matomo?: { trackLink: (url: string, params: string) => void }
} & HTMLAttributes

async function download<T extends CaminoRestRoute>(props: Props<T>) {
  props.onClicked()

  const url = getUiRestRoute(props.downloadRoute, props.params, { format: props.format, ...props.query })

  saveAs(url)

  if (props.matomo) {
    props.matomo.trackLink(`${window.location.origin}${url}`, 'download')
  }
}

export const Download = <T extends CaminoRestRoute>(props: Props<T>): JSX.Element => {
  return (
    <button class="flex" onClick={() => download(props)}>
      <span class="mt-xxs">{props.format}</span>
      <div class="flex-right pl-xs">
        <Icon size="M" name="download" />
      </div>
    </button>
  )
}
