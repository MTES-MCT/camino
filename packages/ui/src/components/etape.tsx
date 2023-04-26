import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import Preview from './etape/preview.vue'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { useRoute } from 'vue-router'
import { AsyncData } from '../api/client-rest'
import { useStore } from 'vuex'
import { LoadingElement } from './_ui/functional-loader'
import { User } from 'camino-common/src/roles'
import { DemarcheGet } from 'camino-common/src/demarche'
import { demarcheApiClient } from './titre/demarche-api-client'
import { titreApiClient } from './titre/titre-api-client'
import { etapeApiClient, EtapeGet } from './etape/etape-api-client'
import { TitreGet } from 'camino-common/src/titres'

export const Etape = defineComponent({
  setup() {
    const opened = ref<boolean>(true)
    const route = useRoute()
    const store = useStore()

    const etapeId = route.params.id
    const data = ref<AsyncData<{ etape: EtapeGet; demarche: DemarcheGet; titre: TitreGet }>>({ status: 'LOADING' })

    const user = computed<User>(() => {
      return store.state.user.element
    })

    const loadEtape = async () => {
      try {
        const etape = await etapeApiClient.getEtapeById(etapeId as string)
        const demarche = await demarcheApiClient.getDemarche(etape.demarche.id)
        const titre = await titreApiClient.getTitreById(demarche.titre_id)

        data.value = { status: 'LOADED', value: { etape, demarche, titre } }
      } catch (e: any) {
        console.error('error', e)
        data.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }

    onMounted(async () => {
      await loadEtape()
    })

    watch(() => route.params.id, loadEtape)
    watch(user, loadEtape)
    return () => (
      <>
        <LoadingElement
          data={data.value}
          renderItem={({ etape, demarche, titre }) => (
            <>
              <h6>
                <router-link to={{ name: 'titre', params: { id: titre.slug } }} class="cap-first">
                  {titre.nom}
                </router-link>
                <span class="color-neutral"> | </span>
                <span class="cap-first">{DemarchesTypes[demarche.type_id].nom}</span>
              </h6>

              <Preview
                etape={etape}
                demarcheTypeId={demarche.type_id}
                titreTypeId={titre.type_id}
                titreNom={titre.nom}
                titreId={titre.id}
                titreStatutId={titre.titre_statut_id}
                user={user.value}
                titreAdministrations={titre.administrations_locales}
                opened={opened.value}
              />
            </>
          )}
        />
      </>
    )
  },
})
