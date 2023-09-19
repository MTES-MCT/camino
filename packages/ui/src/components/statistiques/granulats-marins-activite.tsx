import { StatistiqueGranulatsMarinsStatAnnee } from 'camino-common/src/statistiques.js'
import { FunctionalComponent } from 'vue'
import styles from './statistiques.module.css'
import { numberFormat } from 'camino-common/src/number'
import { Alert } from '../_ui/alert'

interface Props {
  enConstruction?: boolean
  statistiqueGranulatsMarins: StatistiqueGranulatsMarinsStatAnnee
}

export const GranulatsMarinsActivite: FunctionalComponent<Props> = props => (
  <div id="indicateurs" class="mb-xxl">
    {props.enConstruction ? <Alert class="fr-mb-2v" type="warning" title="Données en cours de collecte et consolidation." /> : null}

    <div class="tablet-blobs">
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Production nette en volume</h4>
        {props.statistiqueGranulatsMarins.activitesDeposesQuantite > 3 ? (
          <div>
            <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGranulatsMarins.volume)} m³</p>
          </div>
        ) : (
          <div v-else>
            <p class={['fr-display--xs', styles['donnee-importante']]}>-</p>
          </div>
        )}
      </div>
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Production nette en masse</h4>
        {props.statistiqueGranulatsMarins.activitesDeposesQuantite > 3 ? (
          <div>
            <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGranulatsMarins.masse)} t</p>
          </div>
        ) : (
          <div>
            <p class={['fr-display--xs', styles['donnee-importante']]}>-</p>
          </div>
        )}
      </div>
    </div>
    <div class="tablet-blobs">
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Sources des données</h4>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGranulatsMarins.activitesDeposesQuantite)}</p>
        <p>Rapports d’activité de production collectés via Camino utilisés pour consolider ces statistiques.</p>
      </div>
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Taux de collecte</h4>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiqueGranulatsMarins.activitesDeposesRatio} %</p>
        <p>Des rapports d’activité de production attendus ont été déposés par les opérateurs miniers pour consolider ces statistiques.</p>
      </div>
    </div>
  </div>
)
