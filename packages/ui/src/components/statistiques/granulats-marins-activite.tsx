import { numberFormat } from '@/utils/number-format'
import { StatistiqueGranulatsMarinsStatAnnee } from 'camino-common/src/statistiques.js'
import { FunctionalComponent } from 'vue'

interface Props {
  enConstruction?: boolean
  statistiqueGranulatsMarins: StatistiqueGranulatsMarinsStatAnnee
}

export const GranulatsMarinsActivite: FunctionalComponent<Props> = props => (
  <div id="indicateurs" class="mb-xxl">
    {props.enConstruction ? <p class="p-s bg-warning color-bg">Données en cours de collecte et consolidation</p> : null}

    <div class="tablet-blobs">
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Production nette en volume</h4>
        {props.statistiqueGranulatsMarins.activitesDeposesQuantite > 3 ? (
          <div>
            <p class="h0 text-center">{numberFormat(props.statistiqueGranulatsMarins.volume)} m³</p>
          </div>
        ) : (
          <div v-else>
            <p class="h0 text-center">-</p>
          </div>
        )}
      </div>
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Production nette en masse</h4>
        {props.statistiqueGranulatsMarins.activitesDeposesQuantite > 3 ? (
          <div>
            <p class="h0 text-center">{numberFormat(props.statistiqueGranulatsMarins.masse)} t</p>
          </div>
        ) : (
          <div>
            <p class="h0 text-center">-</p>
          </div>
        )}
      </div>
    </div>
    <div class="tablet-blobs">
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Sources des données</h4>
        <p class="h0 text-center">{numberFormat(props.statistiqueGranulatsMarins.activitesDeposesQuantite)}</p>
        <p>Rapports d’activité de production collectés via Camino utilisés pour consolider ces statistiques.</p>
      </div>
      <div class="tablet-blob-1-2 mb-xl">
        <h4 class="text-center">Taux de collecte</h4>
        <p class="h0 text-center">{props.statistiqueGranulatsMarins.activitesDeposesRatio} %</p>
        <p>Des rapports d’activité de production attendus ont été déposés par les opérateurs miniers pour consolider ces statistiques.</p>
      </div>
    </div>
  </div>
)
