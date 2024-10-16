import { apiClient, ApiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import { defineComponent, onMounted, ref } from 'vue'
import { LoadingElement } from './_ui/functional-loader'
import { ResultatMiseEnConcurrence } from './titre/resultat-mise-en-concurrence'
import { DemarcheId, demarcheIdValidator, GetResultatMiseEnConcurrence } from 'camino-common/src/demarche'
import { computed } from 'vue'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { useRoute, useRouter } from 'vue-router'
import { useState } from '@/utils/vue-tsx-utils'
import { inject } from 'vue'
import { entreprisesKey } from '@/moi'

export const DemarcheResultatMiseEnConcurrence = defineComponent(() => {
  const currentRoute = useRoute<'resultatMiseEnConcurrence'>()
  const demarcheId = computed<null | DemarcheId>(() => {
    const { data } = demarcheIdValidator.safeParse(currentRoute.params.demarcheId)

    return data ?? null
  })

  return () => <>{isNotNullNorUndefined(demarcheId.value) ? <PureDemarcheResultatMiseEnConcurrence demarcheId={demarcheId.value} apiClient={apiClient} /> : null}</>
})

type Props = {
  demarcheId: DemarcheId
  apiClient: Pick<ApiClient, 'getResultatMiseEnConcurrence' | 'getEtapesTypesEtapesStatuts' | 'etapeCreer'>
}

const PureDemarcheResultatMiseEnConcurrence = defineComponent<Props>(props => {
  const [data, setData] = useState<AsyncData<GetResultatMiseEnConcurrence>>({ status: 'LOADING' })

  const entreprises = inject(entreprisesKey, ref([]))
  const router = useRouter()

  onMounted(async () => {
    const result = await props.apiClient.getResultatMiseEnConcurrence(props.demarcheId)
    if ('message' in result) {
      setData({
        status: 'NEW_ERROR',
        error: result,
      })
    } else {
      setData({ status: 'LOADED', value: result })
    }
  })

  return () => (
    <LoadingElement
      data={data.value}
      renderItem={item => (
        <ResultatMiseEnConcurrence
          apiClient={{
            ...props.apiClient,
            etapeCreer: async etape => {
              const value = await props.apiClient.etapeCreer(etape)
              router.push({ name: 'demarche', params: { demarcheId: props.demarcheId } })
              return value
            },
          }}
          {...item}
          entreprises={entreprises.value}
        />
      )}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureDemarcheResultatMiseEnConcurrence.props = ['demarcheId', 'apiClient']
