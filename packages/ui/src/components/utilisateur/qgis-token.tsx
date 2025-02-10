import { AsyncData } from '@/api/client-rest'
import { QGISTokenRest } from 'camino-common/src/utilisateur'
import { defineComponent, ref } from 'vue'
import { LoadingElement } from '../_ui/functional-loader'
import { UtilisateurApiClient } from './utilisateur-api-client'
import { DsfrButton, DsfrLink } from '../_ui/dsfr-button'
import { Alert } from '../_ui/alert'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { DsfrCallout } from '../_ui/dsfr-callout'

interface Props {
  apiClient: Pick<UtilisateurApiClient, 'getQGISToken'>
}

export const QGisToken = defineComponent<Props>(props => {
  const data = ref<AsyncData<QGISTokenRest> | null>(null)
  const alertMessage = ref<string | null>(null)

  const generateToken = async () => {
    data.value = { status: 'LOADING' }
    const tokenData = await props.apiClient.getQGISToken()
    if ('message' in tokenData) {
      data.value = {
        status: 'NEW_ERROR',
        error: tokenData,
      }
    } else if (tokenData.url) {
      data.value = { status: 'LOADED', value: tokenData }
    }
  }

  const copyToClipboard = (message: string, token: string) => {
    navigator.clipboard.writeText(token)
    alertMessage.value = message

    setTimeout(() => {
      alertMessage.value = null
    }, 10_000)
  }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data.value?.status !== 'LOADING' || data.value === null ? <DsfrButton title="Générer des identifiants pour QGis" buttonType="secondary" onClick={() => generateToken()} /> : null}
      {data.value !== null ? (
        <LoadingElement
          data={data.value}
          renderItem={item => (
            <>
              {isNotNullNorUndefinedNorEmpty(item.token) ? (
                <>
                  <DsfrCallout
                    title="URL QGis"
                    content={
                      <>
                        Voici l'URL à utiliser pour intégrer les flux Camino dans QGis :<br />
                        {item.url}
                        <br />
                        <br />
                        Pour plus d'informations, n'hésitez pas à aller voir{' '}
                        <DsfrLink
                          href="https://docs.camino.beta.gouv.fr/01-utilisation/02-flux/#utilisation-dans-qgis"
                          disabled={false}
                          icon={null}
                          label="la documentation."
                          title="Documentation pour intégrer QGIS - Lien externe"
                        />
                      </>
                    }
                    footer={
                      <DsfrButton title="Copier l'URL dans le presse-papier" onClick={() => copyToClipboard(`L'URL vient d'être copiée dans votre presse papier`, item.url)} buttonType="tertiary" />
                    }
                  />
                  {isNotNullNorUndefined(alertMessage.value) && <Alert small={true} type="info" role="alert" title={alertMessage.value} />}
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
