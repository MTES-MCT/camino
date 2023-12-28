import { HTMLAttributes, defineComponent, onMounted, ref } from 'vue'
import { TitreId } from 'camino-common/src/titres'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { User } from 'camino-common/src/roles'
import { DsfrButton } from '../_ui/dsfr-button'
import { LoadingElement } from '../_ui/functional-loader'
import { TitreApiClient } from './titre-api-client'
import { AsyncData } from '../../api/client-rest'

type Props = {
  apiClient: Pick<TitreApiClient, 'getTitreUtilisateurAbonne' | 'titreUtilisateurAbonne'>
  titreId: TitreId
  user: User
  class?: HTMLAttributes['class']
}

export const TitreAbonnerButton = defineComponent<Props>(props => {
  const data = ref<AsyncData<boolean>>({ status: 'LOADING' })

  const toggleAbonner = async () => {
    if (data.value.status === 'LOADED') {
      await props.apiClient.titreUtilisateurAbonne(props.titreId, !data.value.value)
      data.value.value = !data.value.value
    }
  }

  onMounted(async () => {
    try {
      if (isNotNullNorUndefined(props.user)) {
        const abonne = await props.apiClient.getTitreUtilisateurAbonne(props.titreId)
        data.value = { status: 'LOADED', value: abonne }
      }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  })

  return () => (
    <>
      {isNotNullNorUndefined(props.user) ? (
        <LoadingElement
          data={data.value}
          renderItem={isAbonne => (
            <DsfrButton class={props.class} style={{ marginRight: 0 }} buttonType={isAbonne ? 'secondary' : 'primary'} title={isAbonne ? 'Se désabonner' : 'S’abonner'} onClick={toggleAbonner} />
          )}
        />
      ) : null}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TitreAbonnerButton.props = ['apiClient', 'titreId', 'user', 'class']
