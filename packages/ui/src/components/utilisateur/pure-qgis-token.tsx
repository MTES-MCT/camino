import { AsyncData } from '@/api/client-rest'
import { QGISToken } from 'camino-common/src/utilisateur'
import { defineComponent, ref } from 'vue'
import { Pill } from '../_ui/pill'
import { LoadingElement } from '../_ui/functional-loader'
import { Messages } from '@/components/_ui/messages'

export interface Props {
  generateTokenCall: () => Promise<QGISToken>
}

export const QGisToken = defineComponent<Props>({
  setup(props) {
    const data = ref<AsyncData<QGISToken>>({ status: 'LOADED', value: {} })
    const messages = ref<{ type: 'error' | 'success'; value: string }[]>([])

    const generateToken = async () => {
      data.value = { status: 'LOADING' }
      try {
        const tokenData = await props.generateTokenCall()
        data.value = { status: 'LOADED', value: tokenData }
        if (tokenData.token) {
          copyToClipboard(tokenData.token)
        }
      } catch (e: any) {
        data.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened'
        }
      }
    }

    const copyToClipboard = (token: string | undefined) => {
      if (token) {
        navigator.clipboard.writeText(token)
        messages.value.push({
          type: 'success',
          value: "Le jeton vient d'être copié dans votre presse papier"
        })
        setTimeout(() => {
          messages.value.shift()
        }, 4500)
      }
    }

    return () => (
      <div class="tablet-blobs">
        <div class="tablet-blob-1-4">
          <h5>Jeton QGIS</h5>
        </div>

        <div class="tablet-blob-3-4">
          <LoadingElement
            data={data.value}
            renderItem={item => (
              <>
                {item.token ? (
                  <div v-if="item.token" class="mb-s">
                    Voici le jeton généré{' '}
                    <Pill onClick={() => copyToClipboard(item.token)}>
                      {item.token}
                    </Pill>
                    <br />
                    Assurez-vous de le copier, vous ne pourrez plus le revoir !
                  </div>
                ) : null}

                <button
                  class="btn btn-secondary"
                  onClick={() => generateToken()}
                >
                  Générer un jeton QGIS
                </button>
              </>
            )}
          ></LoadingElement>
          <Messages messages={messages.value} />
        </div>
      </div>
    )
  }
})

QGisToken.props = ['generateTokenCall']
