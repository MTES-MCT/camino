<template>
  <div v-if="data.status === 'LOADED' && data.value === false">
    Il n'est pas encore possible de calculer la fiscalité pour votre
    entreprise.<br />
    Pour le moment, seules les entreprises dont tous les titres sont du domaine
    "Mineraux et métaux" sont éligibles.<br />
    Si vous pensez qu'il s'agit d'un bug, contactez-nous.
  </div>
  <div v-else>
    Calcul, à titre indicatif, du montant de l'imposition minière de votre
    entreprise (redevance départementale et communale des mines pour les
    substances non énergétiques et taxe aurifère)

    <div class="flex">
      <div
        v-for="tab in annees"
        :key="tab"
        class="mr-xs"
        :class="{ active: tabId === tab }"
      >
        <button
          :id="`cmn-titre-tab-${tab}`"
          class="p-m btn-tab rnd-t-s"
          @click="tabUpdate(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>
    <div class="line-neutral mb" />
    <template v-if="annees[annees.length - 1] === tabId"
      >Estimation effectuée sur la base des tarifs et des productions déclarées
      pour l'année {{ Number.parseInt(tabId) - 1 }} <br
    /></template>
    <strong>Cotisations</strong>
    <div class="fiscalite-table">
      <div>a. Redevance communale</div>
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
      <div>
        f. Frais de gestion de fiscalité directe locale (a+b{{
          data.status === 'LOADED' && isFiscaliteGuyane(data.value) ? '+e' : ''
        }})X 8%
      </div>
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
import {
  Fiscalite,
  isFiscaliteGuyane,
  montantNetTaxeAurifere,
  fraisGestion,
  isFiscaliteData
} from 'camino-common/src/fiscalite'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { AsyncData } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'

const props = defineProps<{
  getFiscaliteEntreprise: (annee: CaminoAnnee) => Promise<Fiscalite>
  anneeCourante: CaminoAnnee
  annees: CaminoAnnee[]
}>()

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
      message: e.message ?? 'something wrong happened'
    }
  }
}

const sommeAPayer = (fiscalite: Fiscalite) =>
  isFiscaliteData(fiscalite)
    ? fiscalite.redevanceCommunale +
      fiscalite.redevanceDepartementale +
      montantNetTaxeAurifere(fiscalite) +
      fraisGestion(fiscalite)
    : 0

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
