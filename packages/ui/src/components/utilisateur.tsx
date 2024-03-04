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
import { Utilisateur as ApiUser, Entreprise } from 'camino-common/src/entreprise'
import { ButtonIcon } from './_ui/button-icon'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

import { entreprisesKey, userKey } from '@/moi'

export const Utilisateur = defineComponent({
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const user = inject(userKey)
    const entreprises = inject(entreprisesKey, ref([]))

    const deleteUtilisateur = async (userId: string) => {
      const isMe: boolean = (user && userId === user.id) ?? false
      if (isMe) {
        // TODO 2023-10-23 type window.location pour s'appuyer sur nos routes rest et pas sur n'importe quoi
        window.location.replace(`/apiUrl/rest/utilisateurs/${userId}/delete`)
      } else {
        await utilisateurApiClient.removeUtilisateur(userId)
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
        user={user}
        entreprises={entreprises.value}
      />
    )
  },
})
export interface Props {
  user: User
  utilisateurId: string
  apiClient: Pick<UtilisateurApiClient, 'getQGISToken' | 'getUtilisateur' | 'removeUtilisateur' | 'getUtilisateurNewsletter' | 'updateUtilisateur' | 'updateUtilisateurNewsletter'>
  entreprises: Entreprise[]
  passwordUpdate: () => void
}

export const PureUtilisateur = caminoDefineComponent<Props>(['user', 'utilisateurId', 'apiClient', 'passwordUpdate', 'entreprises'], props => {
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
  const isMe = computed<boolean>(() => {
    return isNotNullNorUndefined(props.user) && props.utilisateurId === props.user.id
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
          <LoadingElement data={utilisateur.value} renderItem={item => <>{`${item.prenom || '–'} ${item.nom || '–'}`}</>} />
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
              <LoadingElement data={utilisateur.value} renderItem={item => <p>{isNotNullNorUndefined(item.telephoneFixe) ? item.telephoneFixe : '–'}</p>} />
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Téléphone mobile</h5>
              </div>
              <LoadingElement data={utilisateur.value} renderItem={item => <p>{isNotNullNorUndefined(item.telephoneMobile) ? item.telephoneMobile : '–'}</p>} />
            </div>
            <PermissionDisplay user={props.user} utilisateur={utilisateur.value} apiClient={{ ...props.apiClient, updateUtilisateur }} entreprises={props.entreprises} />

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
                    <h5>QGis</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <QGisToken apiClient={props.apiClient} />
                  </div>
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
