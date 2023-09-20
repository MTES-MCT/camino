import { ActivitesByTitre, TitreId } from 'camino-common/src/titres'
import { defineComponent, ref, watch } from 'vue'
import { Preview } from '../activite/preview'
import { ApiClient } from '../../api/api-client'
import { AsyncData } from '../../api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'

interface Props  {
  titreId: TitreId
  apiClient: Pick<ApiClient,  'deposerActivite' | 'supprimerActivite' | 'getActivitesByTitreId'>
}

export const TitreActivitesList = defineComponent<Props>((props) => {


  const activitesByYearsAsync = ref<AsyncData<ActivitesByTitre>>({status: 'LOADING'})

  watch(() => props.titreId, async () => {
    try {
      activitesByYearsAsync.value = { status: 'LOADING' }
      const result = await props.apiClient.getActivitesByTitreId(props.titreId)
      activitesByYearsAsync.value = { status: 'LOADED', value: result }
    } catch (e: any) {
      console.error('error', e)
      activitesByYearsAsync.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }

  }, {immediate: true})

  return () => <LoadingElement data={activitesByYearsAsync.value} renderItem={ (activitesByYears) => <>
      { activitesByYears.map( activitesByYear => <div key={activitesByYear.annee}>
    {activitesByYear.annee}
    { activitesByYear.activites.map(activite => <Preview key={activite.id} activite={activite} apiClient={props.apiClient}/>)}

  </div>)}
  </>} />


})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TitreActivitesList.props = ['titreId', 'apiClient']
