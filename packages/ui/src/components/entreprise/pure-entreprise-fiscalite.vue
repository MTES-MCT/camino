<template>
  <div>
    Cotisations:
    <div class="fiscalite-table">
      <div>a. Redevance communale:</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(fiscalite.redevanceCommunale)
      }}</LoadingElement>
      <div>b. Redevance départementale</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(fiscalite.redevanceDepartementale)
      }}</LoadingElement>
      <div>c. Taxe minière sur l’or de Guyane</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(fiscalite.taxeAurifereGuyane)
      }}</LoadingElement>
      <div>d. Montant total des investissements déduits (1)</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(fiscalite.totalInvestissementsDeduits)
      }}</LoadingElement>
      <div>e. Montant net de taxe minière sur l’or de Guyane (c-d)</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(montantNetTaxeAurifere)
      }}</LoadingElement>
      <div>f. Frais de gestion de fiscalité directe locale (a+b+e)X 8%</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(fraisGestion)
      }}</LoadingElement>
      <div>Somme à payer auprès du comptable (2)</div>
      <LoadingElement :loaded="status === 'LOADED'">{{
        currencyFormat(
          fiscalite.redevanceCommunale +
            fiscalite.redevanceDepartementale +
            montantNetTaxeAurifere +
            fraisGestion
        )
      }}</LoadingElement>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Fiscalite } from 'camino-common/src/fiscalite'
import LoadingElement from '@/components/_ui/loader-element.vue'

const props = defineProps<{
  getFiscaliteEntreprise: () => Promise<Fiscalite>
}>()
const status = ref<'LOADING' | 'LOADED' | 'ERROR'>('LOADING')

const fiscalite = ref<Fiscalite>({
  redevanceCommunale: 0,
  redevanceDepartementale: 0,
  taxeAurifereGuyane: 0,
  totalInvestissementsDeduits: 0
})
const montantNetTaxeAurifere = ref<number>(0)
const fraisGestion = ref<number>(0)

onMounted(async () => {
  try {
    const fiscaliteData = await props.getFiscaliteEntreprise()
    fiscalite.value = fiscaliteData
    montantNetTaxeAurifere.value =
      fiscaliteData.taxeAurifereGuyane -
      fiscaliteData.totalInvestissementsDeduits
    fraisGestion.value =
      (fiscaliteData.redevanceDepartementale +
        fiscaliteData.redevanceCommunale +
        montantNetTaxeAurifere.value) *
      0.08
    status.value = 'LOADED'
  } catch (e) {
    console.log('error', e)
    status.value = 'ERROR'
  }
})

const currencyFormat = (number: number) =>
  Intl.NumberFormat('FR-fr', {
    style: 'currency',
    currency: 'EUR'
  }).format(number)
</script>
<style scoped>
.fiscalite-table {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-row-gap: var(--unit-xs);
}
</style>
