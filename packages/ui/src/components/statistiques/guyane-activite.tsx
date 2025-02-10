import { FunctionalComponent } from 'vue'
import { StatistiquesGuyaneActivite } from 'camino-common/src/statistiques'
import styles from './statistiques.module.css'
import { numberFormat } from 'camino-common/src/number'
import { Alert } from '../_ui/alert'
interface Props {
  statistiqueGuyane: StatistiquesGuyaneActivite
  enConstruction: boolean
}
export const GuyaneActivite: FunctionalComponent<Props> = props => (
  <div id="indicateurs">
    {props.enConstruction ? <Alert class="fr-mb-2v" type="warning" title="Données en cours de collecte et consolidation." /> : null}

    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-4 fr-mb-3w">
        <h3 class="text-center">Production d'or nette</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGuyane.orNet)} kg</p>
        <p>Production d’or nette (après affinage) issue des mines en Guyane.</p>
      </div>
      <div class="fr-col-12 fr-col-md-4 fr-mb-3w">
        <h3 class="text-center">Energie consommée</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGuyane.carburantConventionnel + props.statistiqueGuyane.carburantDetaxe)} kl</p>
        <p class="text-center">dont {numberFormat(props.statistiqueGuyane.carburantDetaxe)} kl détaxés</p>
        <p>Volume de carburant consommé par les activités extractives.</p>
      </div>
      <div class="fr-col-12 fr-col-md-4 fr-mb-3w">
        <h3 class="text-center">Mercure collecté</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGuyane.mercure)} kg</p>
        <p>Masse de mercure d’origine anthropique historique ou illégale récupéré lors de l’exploitation.</p>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-6 fr-mb-3w">
        <h3 class="text-center">Protection de l'environnement</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGuyane.environnementCout)} €</p>
        <p>Montant en euros des investissements * déclarés contribuant à la protection de l’environnement.</p>
        <p>
          <small>* listés à l’article 318 C de l’annexe II du code général des impôts.</small>
        </p>
      </div>
      <div class="fr-col-12 fr-col-md-6 fr-mb-3w">
        <h3 class="text-center">Emplois</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGuyane.effectifs)}</p>
        <p>Salariés mobilisés sur les exploitations minières (équivalent temps plein).</p>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-6">
        <h3 class="text-center">Sources des données</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiqueGuyane.activitesDeposesQuantite)}</p>
        <p>Rapports d’activité de production collectés via Camino utilisés pour consolider ces statistiques.</p>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <h3 class="text-center">Taux de collecte</h3>
        <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiqueGuyane.activitesDeposesRatio} %</p>
        <p>Des rapports d’activité de production attendus ont été déposés par les opérateurs miniers pour consolider ces statistiques.</p>
      </div>
    </div>
  </div>
)
