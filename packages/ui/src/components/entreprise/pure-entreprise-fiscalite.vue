<template>
  <div>
    Cotisations:
    <div class="fiscalite-table">
      <div>a. Redevance communale:</div>
      <LoadingElement v-slot="{ item }" :data="data" class="fiscalite-value">{{
        currencyFormat(item.redevanceCommunale)
      }}</LoadingElement>
      <div>b. Redevance départementale</div>
      <LoadingElement v-slot="{ item }" :data="data" class="fiscalite-value">{{
        currencyFormat(item.redevanceDepartementale)
      }}</LoadingElement>
      <template
        v-if="data.status === 'LOADED' && isFiscaliteGuyane(data.value)"
      >
        <div>c. Taxe minière sur l’or de Guyane</div>
        <LoadingElement
          v-slot="{ item }"
          :data="data"
          class="fiscalite-value"
          >{{ currencyFormat(item.guyane.taxeAurifereBrute) }}</LoadingElement
        >
        <div>
          d. Investissements déductibles de la taxe perçue pour la région de
          Guyane
        </div>
        <LoadingElement
          v-slot="{ item }"
          :data="data"
          class="fiscalite-value"
          >{{
            currencyFormat(item.guyane.totalInvestissementsDeduits)
          }}</LoadingElement
        >
        <div>e. Montant net de taxe minière sur l’or de Guyane (c-d)</div>
        <LoadingElement
          v-slot="{ item }"
          :data="data"
          class="fiscalite-value"
          >{{ currencyFormat(montantNetTaxeAurifere(item)) }}</LoadingElement
        >
      </template>
      <div>f. Frais de gestion de fiscalité directe locale (a+b+e)X 8%</div>
      <LoadingElement v-slot="{ item }" :data="data" class="fiscalite-value">{{
        currencyFormat(fraisGestion(item))
      }}</LoadingElement>
      <div>Somme à payer auprès du comptable (2)</div>
      <LoadingElement v-slot="{ item }" :data="data" class="fiscalite-value">{{
        currencyFormat(sommeAPayer(item))
      }}</LoadingElement>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Fiscalite, isFiscaliteGuyane } from 'camino-common/src/fiscalite'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { AsyncData } from '@/api/client-rest'

const props = defineProps<{
  getFiscaliteEntreprise: () => Promise<Fiscalite>
}>()

const data = ref<AsyncData<Fiscalite>>({ status: 'LOADING' })

onMounted(async () => {
  try {
    const fiscaliteData = await props.getFiscaliteEntreprise()

    data.value = { status: 'LOADED', value: fiscaliteData }
  } catch (e: any) {
    data.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
})

const fraisGestion = (fiscalite: Fiscalite) =>
  (fiscalite.redevanceDepartementale +
    fiscalite.redevanceCommunale +
    montantNetTaxeAurifere(fiscalite)) *
  0.08

const montantNetTaxeAurifere = (fiscalite: Fiscalite) =>
  isFiscaliteGuyane(fiscalite) ? fiscalite.guyane.taxeAurifere : 0

const sommeAPayer = (fiscalite: Fiscalite) =>
  fiscalite.redevanceCommunale +
  fiscalite.redevanceDepartementale +
  montantNetTaxeAurifere(fiscalite) +
  fraisGestion(fiscalite)

const currencyFormat = (number: number) =>
  Intl.NumberFormat('FR-fr', {
    style: 'currency',
    currency: 'EUR'
  }).format(number)
</script>
<style scoped>
.fiscalite-table {
  display: grid;
  grid-template-columns: fit-content(100%) fit-content(100%);
  grid-row-gap: var(--unit-xs);
  grid-column-gap: var(--unit-l);
}

.fiscalite-value {
  justify-self: end;
  font-weight: bold;
}
</style>
