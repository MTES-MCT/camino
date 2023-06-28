import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import Preview from './etape/preview.vue'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { useRoute } from 'vue-router'
import { AsyncData } from '../api/client-rest'
import { useStore } from 'vuex'
import { LoadingElement } from './_ui/functional-loader'
import { User } from 'camino-common/src/roles'
import { titreApiClient } from './titre/titre-api-client'
import { etapeApiClient, EtapeGet } from './etape/etape-api-client'
import { TitreGet } from 'camino-common/src/titres'

export const Etape = defineComponent({
  setup() {
    const opened = ref<boolean>(true)
    const route = useRoute()
    const store = useStore()

    const etapeId = route.params.id
    const data = ref<AsyncData<{ etape: EtapeGet; titre: TitreGet }>>({ status: 'LOADING' })

    const user = computed<User>(() => {
      return store.state.user.element
    })

    const loadEtape = async () => {
      try {
        const etape = await etapeApiClient.getEtapeById(etapeId as string)
        const titre = await titreApiClient.getTitreById(etape.demarche.titre.id)
        data.value = { status: 'LOADED', value: { etape, titre } }
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
          renderItem={({ etape, titre }) => (
            <>
              <h6>
                <router-link to={{ name: 'titre', params: { id: titre.slug } }} class="cap-first">
                  {titre.nom}
                </router-link>
                <span class="color-neutral"> | </span>
                <span class="cap-first">{DemarchesTypes[etape.demarche.typeId].nom}</span>
              </h6>

              <Preview
                etape={etape}
                demarcheTypeId={etape.demarche.typeId}
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
