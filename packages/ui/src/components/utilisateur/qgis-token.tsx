import { AsyncData } from '@/api/client-rest'
import { QGISToken } from 'camino-common/src/utilisateur'
import { defineComponent, ref } from 'vue'
import { LoadingElement } from '../_ui/functional-loader'
import { UtilisateurApiClient } from './utilisateur-api-client'
import { DsfrButton } from '../_ui/dsfr-button'
import { Alert } from '../_ui/alert'

interface Props {
  apiClient: Pick<UtilisateurApiClient, 'getQGISToken'>
}

export const QGisToken = defineComponent<Props>(props => {
  const data = ref<AsyncData<QGISToken> | null>(null)
  const alertMessage = ref<string>('')

  const generateToken = async () => {
    data.value = { status: 'LOADING' }
    try {
      const tokenData = await props.apiClient.getQGISToken()
      data.value = { status: 'LOADED', value: tokenData }
      if (tokenData.url) {
        copyToClipboard(`L'URL vient d'être copiée dans votre presse papier`, tokenData.url)
      }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  const copyToClipboard = (message: string, token: string) => {
    navigator.clipboard.writeText(token)
    alertMessage.value = message
  }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data.value?.status !== 'LOADING' || data.value === null ? <DsfrButton title="Générer des identifiants pour QGis" buttonType="secondary" onClick={() => generateToken()} /> : null}
      {data.value !== null ? (
        <LoadingElement
          data={data.value}
          renderItem={item => (
            <>
              {item.token ? (
                <>
                  <div>
                    Voici l'URL à utiliser dans QGis :{' '}
                    <DsfrButton title={item.url} onClick={() => copyToClipboard(`L'URL vient d'être copiée dans votre presse papier`, item.url)} buttonType="tertiary" />
                  </div>
                  <div>
                    Voici le jeton généré : <DsfrButton title={item.token} onClick={() => copyToClipboard(`Le token vient d'être copié dans votre presse papier`, item.token)} buttonType="tertiary" />
                  </div>
                  <Alert small={true} type="info" title={alertMessage.value} />
                </>
              ) : null}
            </>
          )}
        ></LoadingElement>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
QGisToken.props = ['apiClient']
