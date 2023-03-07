import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  WatchStopHandle
} from 'vue'
import { cloneAndClean } from '../utils/index'
import Accordion from './_ui/accordion.vue'
import { Pill } from './_ui/pill'
import { EditPopup } from './utilisateur/edit-popup'
import { isAdministration, User } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'
import { Icon } from './_ui/icon'
import { QGisToken } from './utilisateur/pure-qgis-token'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { AsyncData, fetchWithJson } from '@/api/client-rest'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { utilisateurApiClient } from './utilisateur/utilisateur-api-client'
import { Utilisateur as ApiUser } from '@/api/api-client'
import { LoadingElement } from './_ui/functional-loader'
import { RemovePopup } from './utilisateur/remove-popup'
import { canEditUtilisateur } from 'camino-common/src/permissions/utilisateurs'

// TODO 2023-03-02: create pureUtilisateur and test
export const Utilisateur = defineComponent({
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const matomo = inject('matomo', null)
    const apiClient = utilisateurApiClient

    onMounted(async () => {
      userUnwatch.value = watch(
        () => user,
        () => get()
      )
      watch(
        () => route.params.id,
        id => {
          if (route.name === 'utilisateur' && id) {
            get()
          }
        }
      )
      await get()
    })

    onBeforeUnmount(() => {
      store.commit('utilisateur/reset')
    })
    const userUnwatch = ref<WatchStopHandle | null>(null)
    const subscription = ref<AsyncData<boolean>>({ status: 'LOADING' })
    const utilisateur = ref<AsyncData<ApiUser>>({ status: 'LOADING' })
    const removePopup = ref<boolean>(false)
    const editPopup = ref<boolean>(false)

    const user = computed<User>(() => {
      return store.state.user.element
    })

    const isMe = computed(() => {
      return (
        user.value &&
        utilisateur.value.status === 'LOADED' &&
        user.value.id === utilisateur.value.value.id
      )
    })

    const passwordUpdate = () => {
      window.location.replace('/apiUrl/changerMotDePasse')
    }
    const logout = async () => {
      if (matomo) {
        // @ts-ignore
        matomo.trackEvent('menu-utilisateur', 'menu-utilisateur', 'deconnexion')
      }
      const unwatch = userUnwatch.value
      if (unwatch) {
        unwatch()
      }
      window.location.replace('/apiUrl/deconnecter')
    }

    const get = async () => {
      const utilisateurId = route.params.id
      if (!Array.isArray(utilisateurId)) {
        try {
          const utilisateurFromApi = await apiClient.getUtilisateur(
            utilisateurId
          )
          utilisateur.value = {
            status: 'LOADED',
            value: utilisateurFromApi
          }
        } catch (e: any) {
          console.error('error', e)
          utilisateur.value = {
            status: 'ERROR',
            message: e.message ?? "Une erreur s'est produite"
          }
        }
        // Hack for mailjet latency
        await new Promise(resolve => setTimeout(resolve, 2000))
        try {
          subscription.value = {
            status: 'LOADED',
            value: await apiClient.getUtilisateurNewsletter(utilisateurId)
          }
        } catch (e: any) {
          console.error('error', e)
          subscription.value = {
            status: 'ERROR',
            message: e.message ?? "Une erreur s'est produite"
          }
        }
      }
    }

    const editPopupOpen = () => {
      if (utilisateur.value.status === 'LOADED') {
        editPopup.value = true
        // const utilisateurEdit = cloneAndClean(utilisateur.value.value)

        // utilisateurEdit.entreprises = utilisateur.value.value.entreprises?.map(({id}) => ({id}))

        // delete utilisateurEdit.modification
        // delete utilisateurEdit.suppression

        // store.commit('popupOpen', {
        //   component: UtilisateurEditPopup,
        //   props: {
        //     utilisateur: utilisateurEdit,
        //     action: 'edit',
        //     subscription: subscription.value
        //   }
        // })
      }
    }

    const removePopupOpen = () => {
      if (utilisateur.value.status === 'LOADED') {
        removePopup.value = true
      }
    }
    const deleteUser = async () => {
      if (utilisateur.value.status === 'LOADED') {
        await apiClient.removeUtilisateur(utilisateur.value.value.id)

        if (isMe.value) {
          await store.dispatch('user/logout', null, { root: true })
        } else {
          store.dispatch(
            'messageAdd',
            {
              value: `l'utilisateur ${utilisateur.value.value.prenom} ${utilisateur.value.value.nom} a été supprimé`,
              type: 'success'
            },
            { root: true }
          )
          router.push({ name: 'utilisateurs' })
        }
      }
    }
    const updateUtilisateur = async (
      utilisateur: ApiUser,
      newsletter: boolean
    ) => {
      try {
        await apiClient.updateUtilisateur(utilisateur)
        // FIXME use fetchWithJson
        // FIXME DO THAT IN create user in utilisateurs
        await fetch(`/apiUrl/utilisateurs/${utilisateur.id}/newsletter`, {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ newsletter })
        })
        store.dispatch(
          'messageAdd',
          {
            value: `l'utilisateur ${utilisateur.prenom} ${utilisateur.nom} a été modifié`,
            type: 'success'
          },
          { root: true }
        )
      } catch (e) {
        store.dispatch(
          'messageAdd',
          {
            value: `Erreur lors de la modification de l'utilisateur ${utilisateur.prenom} ${utilisateur.nom}`,
            type: 'error'
          },
          { root: true }
        )
      }
      await get()
    }
    return () => (
      <div>
        <h5>Utilisateur</h5>
        <div class="flex">
          <h1>
            <LoadingElement
              data={utilisateur.value}
              renderItem={item => (
                <>{item ? `${item.prenom || '–'} ${item.nom || '–'}` : '–'}</>
              )}
            />
          </h1>

          {isMe.value ? (
            <button
              id="cmn-user-menu-button-deconnexion"
              class="btn-menu text-decoration-none bold p-0 flex-right"
              onClick={logout}
            >
              Déconnexion
            </button>
          ) : null}
        </div>

        <Accordion class="mb" slotSub={true} slotButtons={true}>
          {{
            title: () => <span> Profil </span>,
            buttons: () => (
              <LoadingElement
                data={utilisateur.value}
                renderItem={item => (
                  <>
                    {canEditUtilisateur(user.value, item) ? (
                      <>
                        {isMe.value ? (
                          <button
                            class="btn-alt py-s px-m"
                            title="changer de mot de passe"
                            onClick={passwordUpdate}
                          >
                            <Icon size="M" name="key" />
                          </button>
                        ) : null}

                        {subscription.value.status === 'LOADED' ? (
                          <button
                            id="cmn-utilisateur-button-popup-editer"
                            class="btn-alt py-s px-m"
                            title="modifier le compte utilisateur"
                            onClick={editPopupOpen}
                          >
                            <Icon size="M" name="pencil" />
                          </button>
                        ) : null}

                        <button
                          id="cmn-utilisateur-button-popup-supprimer"
                          class="btn-alt py-s px-m"
                          title="supprimer le compte utilisateur"
                          onClick={removePopupOpen}
                        >
                          <Icon size="M" name="delete" />
                        </button>
                      </>
                    ) : null}
                  </>
                )}
              />
            ),

            sub: () => (
              <div class="px-m pt-m">
                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Prénom</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <LoadingElement
                      data={utilisateur.value}
                      renderItem={item => <p>{item.prenom || '–'}</p>}
                    />
                  </div>
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Nom</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <LoadingElement
                      data={utilisateur.value}
                      renderItem={item => <p>{item.nom || '–'}</p>}
                    />
                  </div>
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Email</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <LoadingElement
                      data={utilisateur.value}
                      renderItem={item => <p>{item.email || '–'}</p>}
                    />
                  </div>
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Téléphone fixe</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <LoadingElement
                      data={utilisateur.value}
                      renderItem={item => <p>{item.telephoneFixe || '–'}</p>}
                    />
                  </div>
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Téléphone mobile</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <LoadingElement
                      data={utilisateur.value}
                      renderItem={item => <p>{item.telephoneMobile || '–'}</p>}
                    />
                  </div>
                </div>

                <LoadingElement
                  data={utilisateur.value}
                  renderItem={item => (
                    <div class="tablet-blobs">
                      <div class="tablet-blob-1-4">
                        <h5>Permissions</h5>
                      </div>
                      <div class="tablet-blob-3-4">
                        {item.role ? (
                          <Pill class="mb">{item.role}</Pill>
                        ) : (
                          <p>–</p>
                        )}
                      </div>
                    </div>
                  )}
                />

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Newsletter</h5>
                  </div>
                  <div class="tablet-blob-3-4">
                    <LoadingElement
                      data={subscription.value}
                      renderItem={item => <p>{item ? 'Inscrit' : '–'}</p>}
                    />
                  </div>
                </div>

                <LoadingElement
                  data={utilisateur.value}
                  renderItem={item => (
                    <>
                      {item.entreprises?.length ? (
                        <div class="tablet-blobs">
                          <div class="tablet-blob-1-4">
                            <h5>
                              Entreprise{item.entreprises.length > 1 ? 's' : ''}
                            </h5>
                          </div>

                          <div class="tablet-blob-3-4">
                            <ul class="list-inline">
                              {item.entreprises.map(e => (
                                <li key={e.id} class="mb-xs">
                                  <router-link
                                    to={{
                                      name: 'entreprise',
                                      params: { id: e.id }
                                    }}
                                    class="btn-border small p-s rnd-xs mr-xs"
                                  >
                                    {e.legalSiren
                                      ? `${e.nom} (${e.legalSiren})`
                                      : e.nom}
                                  </router-link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                />

                <LoadingElement
                  data={utilisateur.value}
                  renderItem={item => (
                    <>
                      {isAdministration(item) ? (
                        <div class="tablet-blobs">
                          <div class="tablet-blob-1-4">
                            <h5>Administration</h5>
                          </div>

                          <div class="tablet-blob-3-4">
                            {`${
                              Administrations[item.administrationId].abreviation
                            }${
                              Administrations[item.administrationId].service
                                ? ` - ${
                                    Administrations[item.administrationId]
                                      .service
                                  }`
                                : ''
                            }`}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                />

                {isMe.value ? (
                  <QGisToken
                    generateTokenCall={() =>
                      fetchWithJson(
                        CaminoRestRoutes.generateQgisToken,
                        {},
                        'post'
                      )
                    }
                  />
                ) : null}
              </div>
            )
          }}
        </Accordion>
        {removePopup.value && utilisateur.value.status === 'LOADED' ? (
          <RemovePopup
            close={() => (removePopup.value = !removePopup.value)}
            utilisateur={utilisateur.value.value}
            deleteUser={deleteUser}
          />
        ) : null}
        {editPopup.value &&
        utilisateur.value.status === 'LOADED' &&
        subscription.value.status === 'LOADED' ? (
          <EditPopup
            close={() => (editPopup.value = !editPopup.value)}
            values={{
              action: 'edit',
              utilisateur: utilisateur.value.value,
              subscription: subscription.value.value,
              update: updateUtilisateur
            }}
            getEntreprises={apiClient.getEntreprises}
            user={user.value}
          />
        ) : null}
      </div>
    )
  }
})
