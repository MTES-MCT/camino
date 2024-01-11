import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { onMounted, ref } from 'vue'
import { montantNetTaxeAurifere, fraisGestion } from 'camino-common/src/fiscalite'
import type { Fiscalite } from 'camino-common/src/validators/fiscalite'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import styles from './entreprise-fiscalite.module.css'

interface Props {
  getFiscaliteEntreprise: (annee: CaminoAnnee) => Promise<Fiscalite>
  anneeCourante: CaminoAnnee
  annees: CaminoAnnee[]
}
export const EntrepriseFiscalite = caminoDefineComponent<Props>(['anneeCourante', 'annees', 'getFiscaliteEntreprise'], props => {
  const tabId = ref<CaminoAnnee>(props.anneeCourante)
  const data = ref<AsyncData<Fiscalite>>({ status: 'LOADING' })

  const tabUpdate = async (annee: CaminoAnnee): Promise<void> => {
    if (annee !== tabId.value) {
      tabId.value = annee
      await reloadData(annee)
    }
  }

  onMounted(async () => {
    await reloadData(props.anneeCourante)
  })

  const reloadData = async (annee: CaminoAnnee) => {
    data.value = { status: 'LOADING' }
    try {
      const fiscaliteData = await props.getFiscaliteEntreprise(annee)

      data.value = { status: 'LOADED', value: fiscaliteData }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  const sommeAPayer = (fiscalite: Fiscalite) => fiscalite.redevanceCommunale + fiscalite.redevanceDepartementale + montantNetTaxeAurifere(fiscalite) + fraisGestion(fiscalite).toNumber()

  const currencyFormat = (number: number) =>
    Intl.NumberFormat('FR-fr', {
      style: 'currency',
      currency: 'EUR',
    }).format(number)

  return () => (
    <div>
      Calcul, à titre indicatif, du montant de l'imposition minière de votre entreprise (redevance départementale et communale des mines pour les substances non énergétiques et taxe aurifère)
      <div class="flex">
        {props.annees.map(tab => (
          <div key={tab} class={`mr-xs ${tabId.value === tab ? 'active' : ''} `}>
            <button id={`cmn-titre-tab-${tab}`} class="p-m btn-tab rnd-t-s" onClick={() => tabUpdate(tab)}>
              {tab}
            </button>
          </div>
        ))}
      </div>
      <div class="line-neutral mb" />
      {props.annees[props.annees.length - 1] === tabId.value ? (
        <>
          Estimation effectuée sur la base des tarifs et des productions déclarées pour l'année {Number.parseInt(tabId.value) - 1} <br />
        </>
      ) : null}
      <strong>Cotisations</strong>
      <div class={styles['fiscalite-table']}>
        <div>a. Redevance communale</div>
        <LoadingElement data={data.value} class={styles['fiscalite-value']} renderItem={item => <>{currencyFormat(item.redevanceCommunale)}</>} />
        <div>b. Redevance départementale</div>
        <LoadingElement data={data.value} class={styles['fiscalite-value']} renderItem={item => <>{currencyFormat(item.redevanceDepartementale)}</>} />
        {data.value.status === 'LOADED' && 'guyane' in data.value.value ? (
          <>
            <div>c. Taxe minière sur l’or de Guyane</div>
            <div class={styles['fiscalite-value']}>{currencyFormat(data.value.value.guyane.taxeAurifereBrute)}</div>
            <div>d. Investissements déductibles de la taxe perçue pour la région de Guyane</div>
            <div class={styles['fiscalite-value']}>{currencyFormat(data.value.value.guyane.totalInvestissementsDeduits)}</div>
            <div>e. Montant net de taxe minière sur l’or de Guyane (c-d)</div>
            <div class={styles['fiscalite-value']}>{currencyFormat(montantNetTaxeAurifere(data.value.value))}</div>
          </>
        ) : null}
        <div>f. Frais de gestion de fiscalité directe locale (a+b{data.value.status === 'LOADED' && 'guyane' in data.value.value ? '+e' : ''})X 8%</div>
        <LoadingElement data={data.value} class={styles['fiscalite-value']} renderItem={item => <>{currencyFormat(fraisGestion(item).toNumber())}</>} />
        <div>Somme à payer auprès du comptable (2)</div>
        <LoadingElement data={data.value} class={styles['fiscalite-value']} renderItem={item => <>{currencyFormat(sommeAPayer(item))}</>} />
      </div>
    </div>
  )
})
