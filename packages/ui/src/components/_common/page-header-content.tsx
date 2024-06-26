import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent } from 'vue'
import { Downloads, Props as DownloadProps } from './downloads'
import { DownloadRestRoutes } from 'camino-common/src/rest'
import type { JSX } from 'vue/jsx-runtime'
export type Props = {
  nom: string
  renderButton: (() => JSX.Element) | null
  download: Pick<DownloadProps<DownloadRestRoutes>, 'formats' | 'params' | 'downloadRoute' | 'id'> | null
}

export const PageContentHeader: FunctionalComponent<Props> = props => {
  return (
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-6">
        <h1>{capitalize(props.nom)}</h1>
      </div>

      <div class="fr-col-12 fr-col-md-6" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
        {props.download ? <Downloads {...props.download} /> : null}
        {props.renderButton !== null ? <div class="fr-ml-1w">{props.renderButton()}</div> : null}
      </div>
    </div>
  )
}
