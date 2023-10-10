import { AsyncData } from '@/api/client-rest'
import { QGISToken } from 'camino-common/src/utilisateur'
import { ref } from 'vue'
import { Pill } from '../_ui/pill'
import { LoadingElement } from '../_ui/functional-loader'
import { Messages } from '@/components/_ui/messages'
import { UtilisateurApiClient } from './utilisateur-api-client'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export interface Props {
  apiClient: Pick<UtilisateurApiClient, 'getQGISToken'>
}

export const QGisToken = caminoDefineComponent<Props>(['apiClient'], props => {
  const data = ref<AsyncData<QGISToken> | null>(null)
  const messages = ref<{ type: 'error' | 'success'; value: string }[]>([])

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
    messages.value.push({
      type: 'success',
      value: message,
    })
    setTimeout(() => {
      messages.value.shift()
    }, 4500)
  }

  return () => (
    <>
      <button class="btn btn-secondary mb-s" onClick={() => generateToken()}>
        Générer des identifiants pour QGis
      </button>
      {data.value !== null ? (
        <LoadingElement
          data={data.value}
          renderItem={item => (
            <>
              {item.token ? (
                <div>
                  Voici l'URL à utiliser dans QGis <Pill noCapitalize onClick={() => copyToClipboard(`L'URL vient d'être copiée dans votre presse papier`, item.url)} text={item.url} />
                  <br />
                  Voici le jeton généré <Pill noCapitalize onClick={() => copyToClipboard(`Le token vient d'être copié dans votre presse papier`, item.token)} text={item.token} />
                </div>
              ) : null}
            </>
          )}
        ></LoadingElement>
      ) : null}

      <Messages messages={messages.value} />
    </>
  )
})
