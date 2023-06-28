import { HTMLAttributes } from 'vue'
import { LocationQuery } from 'vue-router'
import { Icon } from '../_ui/icon'
import { saveAs } from 'file-saver'
import { DownloadFormat, DownloadRestRoutes, CaminoRestParams } from 'camino-common/src/rest'
import { getDownloadRestRoute } from '../../api/client-rest'
import { Button } from '../_ui/button'

export type Props<T extends DownloadRestRoutes> = {
  downloadRoute: T
  params: CaminoRestParams<T>
  format: DownloadFormat
  query: LocationQuery
  onClicked: () => void
  matomo?: { trackLink: (url: string, params: string) => void }
} & HTMLAttributes

async function download<T extends DownloadRestRoutes>(props: Props<T>) {
  props.onClicked()

  const url = getDownloadRestRoute(props.downloadRoute, props.params, { format: props.format, ...props.query })

  saveAs(url)

  if (props.matomo) {
    props.matomo.trackLink(`${window.location.origin}${url}`, 'download')
  }
}

export const Download = <T extends DownloadRestRoutes>(props: Props<T>): JSX.Element => {
  return (
    <Button
      class="flex"
      onClick={() => download(props)}
      title="Télécharge le fichier"
      render={() => (
        <>
          <span class="mt-xxs">{props.format}</span>
          <div class="flex-right pl-xs">
            <Icon size="M" name="download" aria-hidden="true" />
          </div>
        </>
      )}
    />
  )
}
