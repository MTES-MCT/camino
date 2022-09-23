<template>
  <div class="content">
    <div id="etat" class="mb-xxl mt">
      <h2>
        État du domaine minier des substances non énergétiques, en métropole, en
        temps réel
      </h2>
      <span class="separator" />
      <p>
        Les données affichées ici sont celles contenues dans la base de donnée
        Camino. Elles sont susceptibles d’évoluer chaque jour au grès des
        décisions et de la fin de validité des titres et autorisations.
      </p>
      <p>
        Les surfaces cumulées concernées par un titre ou une autorisation
        n’impliquent pas qu’elles sont effectivement explorées ou exploitées sur
        tout ou partie de l'année. Les travaux miniers font l’objet de
        déclarations ou d’autorisations distinctes portant sur une partie
        seulement de la surface des titres miniers.
      </p>
      <div class="mb-xxl">
        <h3>Titres d’exploration</h3>
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titresInstructionExploration }}
              </LoadingElement>
            </p>
            <div>
              <p class="bold text-center">
                <LoadingElement v-slot="{ item }" :data="data">
                  Demande{{
                    item.titresInstructionExploration > 1 ? 's' : ''
                  }}
                  en cours d'instruction (initiale et modification en instance)
                </LoadingElement>
              </p>
            </div>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'w',
                    typesIds: 'ar,ap,pr',
                    statutsIds: 'dmi,mod',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titres.prm }}
              </LoadingElement>
            </p>
            <p class="bold text-center">Permis exclusifs de recherches</p>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'm',
                    typesIds: 'pr',
                    statutsIds: 'val',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center flex flex-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ numberFormat(item.surfaceExploration) }} ha
              </LoadingElement>
            </p>
            <p class="bold text-center">
              Surfaces cumulées des titres pouvant faire l'objet d'une activité
              d’exploration
            </p>
          </div>
        </div>
      </div>
      <div class="mb-xxl">
        <h3>Titres d’exploitation</h3>
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titresInstructionExploitation }}
              </LoadingElement>
            </p>
            <div>
              <p class="bold text-center">
                <LoadingElement v-slot="{ item }" :data="data">
                  Demande{{
                    item.titresInstructionExploitation > 1 ? 's' : ''
                  }}
                  en cours d'instruction (initiale et modification en instance)
                </LoadingElement>
              </p>
            </div>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'w',
                    typesIds: 'ax,cx,px',
                    statutsIds: 'dmi,mod',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ item.titresValCxw }}
              </LoadingElement>
            </p>
            <div>
              <LoadingElement v-slot="{ item }" :data="data">
                <p class="bold text-center">
                  Concession{{ item.titresValCxw > 1 ? 's' : '' }}
                </p>
              </LoadingElement>
            </div>
            <p class="h6 text-center">
              <router-link
                :to="{
                  name: 'titres',
                  query: {
                    domainesIds: 'w',
                    typesIds: 'cx',
                    statutsIds: 'val',
                    vueId: 'table'
                  }
                }"
              >
                Voir les titres
              </router-link>
            </p>
          </div>
          <div class="tablet-blob-1-3">
            <p class="h0 text-center">
              <LoadingElement v-slot="{ item }" :data="data">
                {{ numberFormat(item.surfaceExploitation) }} ha
              </LoadingElement>
            </p>
            <p class="bold text-center">
              Surfaces cumulées des titres pouvant faire l'objet d'une activité
              d’exploitation
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="line-neutral width-full mb" />
  </div>
</template>

<script setup lang="ts">
import { AsyncData } from '@/api/client-rest'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { numberFormat } from '@/utils/number-format'
import { StatistiquesMetauxMinerauxMetropole } from 'camino-common/src/statistiques'
import { ref, onMounted } from 'vue'
const data = ref<AsyncData<StatistiquesMetauxMinerauxMetropole>>({
  status: 'LOADING'
})
const props = defineProps<{
  getStats: () => Promise<StatistiquesMetauxMinerauxMetropole>
}>()

onMounted(async () => {
  try {
    const stats = await props.getStats()
    data.value = {
      status: 'LOADED',
      value: stats
    }
  } catch (e: any) {
    console.log('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>
