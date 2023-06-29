import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
import { Card } from './_ui/card'
import { User } from 'camino-common/src/roles'
import { QGisToken } from './utilisateur/qgis-token'
import { AsyncData } from '@/api/client-rest'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { UtilisateurApiClient, utilisateurApiClient } from './utilisateur/utilisateur-api-client'
import { LoadingElement } from './_ui/functional-loader'
import { RemovePopup } from './utilisateur/remove-popup'
import { canDeleteUtilisateur } from 'camino-common/src/permissions/utilisateurs'
import { caminoDefineComponent, isEventWithTarget } from '../utils/vue-tsx-utils'
import { PermissionDisplay } from './utilisateur/permission-edit'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'
import { Utilisateur as ApiUser } from 'camino-common/src/entreprise'
import { ButtonIcon } from './_ui/button-icon'

export const Utilisateur = defineComponent({
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const matomo = inject('matomo', null)

    const user = computed<User>(() => {
      return store.state.user.element
    })

    const deleteUtilisateur = async (userId: string) => {
      await utilisateurApiClient.removeUtilisateur(userId)

      const isMe: boolean = (user.value && userId === user.value.id) ?? false
      if (isMe) {
        if (matomo) {
          // @ts-ignore
          matomo.trackEvent('menu-utilisateur', 'menu-utilisateur', 'deconnexion')
        }
        window.location.replace('/apiUrl/deconnecter')
      } else {
        store.dispatch(
          'messageAdd',
          {
            value: `l'utilisateur a été supprimé`,
            type: 'success',
          },
          { root: true }
        )
        router.push({ name: 'utilisateurs' })
      }
    }
    const updateUtilisateur = async (utilisateur: UtilisateurToEdit) => {
      try {
        await utilisateurApiClient.updateUtilisateur(utilisateur)

        store.dispatch(
          'messageAdd',
          {
            value: `le rôle a bien été modifié`,
            type: 'success',
          },
          { root: true }
        )
      } catch (e) {
        store.dispatch(
          'messageAdd',
          {
            value: `Erreur lors de la modification du rôle de l'utilisateur`,
            type: 'error',
          },
          { root: true }
        )
      }
    }
    const passwordUpdate = () => {
      window.location.replace('/apiUrl/changerMotDePasse')
    }
    const utilisateurId = ref<string>(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
    watch(
      () => route.params.id,
      newId => {
        utilisateurId.value = Array.isArray(newId) ? newId[0] : newId
      }
    )
    return () => (
      <PureUtilisateur
        passwordUpdate={passwordUpdate}
        apiClient={{ ...utilisateurApiClient, updateUtilisateur, removeUtilisateur: deleteUtilisateur }}
        utilisateurId={utilisateurId.value}
        user={user.value}
      />
    )
  },
})
interface Props {
  user: User
  utilisateurId: string
  apiClient: UtilisateurApiClient
  passwordUpdate: () => void
}

export const PureUtilisateur = caminoDefineComponent<Props>(['user', 'utilisateurId', 'apiClient', 'passwordUpdate'], props => {
  watch(
    () => props.user,
    () => get()
  )
  watch(
    () => props.utilisateurId,
    _newId => {
      get()
    }
  )
  onMounted(async () => {
    await get()
  })

  const subscription = ref<AsyncData<boolean>>({ status: 'LOADING' })
  const utilisateur = ref<AsyncData<ApiUser>>({ status: 'LOADING' })
  const removePopup = ref<boolean>(false)
  const isMe = computed(() => {
    return props.user && props.utilisateurId === props.user.id
  })

  const get = async () => {
    try {
      const utilisateurFromApi = await props.apiClient.getUtilisateur(props.utilisateurId)
      utilisateur.value = {
        status: 'LOADED',
        value: utilisateurFromApi,
      }
    } catch (e: any) {
      console.error('error', e)
      utilisateur.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
    if (isMe.value) {
      try {
        subscription.value = {
          status: 'LOADED',
          value: await props.apiClient.getUtilisateurNewsletter(props.utilisateurId),
        }
      } catch (e: any) {
        console.error('error', e)
        subscription.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }

  const updateUtilisateur = async (utilisateur: UtilisateurToEdit) => {
    await props.apiClient.updateUtilisateur(utilisateur)
    await get()
  }

  const updateSubscription = async (utilisateurId: string, newsletterChecked: boolean) => {
    subscription.value = { status: 'LOADING' }
    try {
      await props.apiClient.updateUtilisateurNewsletter(utilisateurId, newsletterChecked)
      // Hack for mailjet latency
      await new Promise(resolve => setTimeout(resolve, 500))
      subscription.value = {
        status: 'LOADED',
        value: newsletterChecked,
      }
    } catch (e: any) {
      console.error('error', e)
      subscription.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }
  return () => (
    <div>
      <h5>Utilisateur</h5>
      <div class="flex">
        <h1>
          <LoadingElement data={utilisateur.value} renderItem={item => <>{item ? `${item.prenom || '–'} ${item.nom || '–'}` : '–'}</>} />
        </h1>
      </div>

      <Card
        class="mb"
        title={() => <span> Profil </span>}
        buttons={() => (
          <LoadingElement
            data={utilisateur.value}
            renderItem={item => (
              <>
                {isMe.value ? <ButtonIcon class="btn-alt py-s px-m" title="changer de mot de passe" onClick={props.passwordUpdate} icon="key" /> : null}
                {canDeleteUtilisateur(props.user, item.id) ? (
                  <ButtonIcon
                    class="btn-alt py-s px-m"
                    title="supprimer le compte utilisateur"
                    onClick={() => {
                      removePopup.value = true
                    }}
                    icon="delete"
                  />
                ) : null}
              </>
            )}
          />
        )}
        content={() => (
          <div class="px-m pt-m">
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Prénom</h5>
              </div>
              <LoadingElement data={utilisateur.value} renderItem={item => <p>{item.prenom || '–'}</p>} />
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Nom</h5>
              </div>
              <LoadingElement data={utilisateur.value} renderItem={item => <p>{item.nom || '–'}</p>} />
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Email</h5>
              </div>
              <div>
                <LoadingElement data={utilisateur.value} renderItem={item => <p>{item.email || '–'}</p>} />
              </div>
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Téléphone fixe</h5>
              </div>
              <LoadingElement data={utilisateur.value} renderItem={item => <p>{item.telephoneFixe || '–'}</p>} />
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Téléphone mobile</h5>
              </div>
              <LoadingElement data={utilisateur.value} renderItem={item => <p>{item.telephoneMobile || '–'}</p>} />
            </div>
            <PermissionDisplay user={props.user} utilisateur={utilisateur.value} apiClient={{ ...props.apiClient, updateUtilisateur }} />

            {isMe.value ? (
              <>
                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Newsletter</h5>
                  </div>
                  <LoadingElement
                    data={subscription.value}
                    renderItem={item => (
                      <input
                        onInput={e => {
                          if (isEventWithTarget(e)) {
                            updateSubscription(props.utilisateurId, e.target.checked)
                          }
                        }}
                        type="checkbox"
                        checked={!!item}
                      />
                    )}
                  />
                </div>
                <div class="tablet-blobs pb-m">
                  <div class="tablet-blob-1-4">
                    <h5>Jeton QGIS</h5>
                  </div>

                  <QGisToken apiClient={props.apiClient} />
                </div>
              </>
            ) : null}
          </div>
        )}
      />
      {removePopup.value && utilisateur.value.status === 'LOADED' ? (
        <RemovePopup
          close={() => (removePopup.value = !removePopup.value)}
          utilisateur={utilisateur.value.value}
          deleteUser={async () => {
            if (utilisateur.value.status === 'LOADED') {
              await props.apiClient.removeUtilisateur(utilisateur.value.value.id)
            }
          }}
        />
      ) : null}
    </div>
  )
})
