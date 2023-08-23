import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent } from 'vue'
import { Downloads, Props as DownloadProps } from './downloads'
import { DownloadRestRoutes } from 'camino-common/src/rest'

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

      <div class="fr-col-12 fr-col-md-6" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
        {props.download ? <Downloads {...props.download} class="" /> : null}
        {props.renderButton !== null ? props.renderButton() : null}
      </div>
    </div>
  )
}
