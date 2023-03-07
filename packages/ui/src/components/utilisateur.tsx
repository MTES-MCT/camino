import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
import Accordion from './_ui/accordion.vue'
import { Pill } from './_ui/pill'
import { EditPopup } from './utilisateur/edit-popup'
import { isAdministration, User } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'
import { Icon } from './_ui/icon'
import { QGisToken } from './utilisateur/qgis-token'
import { AsyncData } from '@/api/client-rest'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import {
  UtilisateurApiClient,
  utilisateurApiClient
} from './utilisateur/utilisateur-api-client'
import { Utilisateur as ApiUser } from '@/api/api-client'
import { LoadingElement } from './_ui/functional-loader'
import { RemovePopup } from './utilisateur/remove-popup'
import { canEditUtilisateur } from 'camino-common/src/permissions/utilisateurs'
import { isEventWithTarget } from '../utils/vue-tsx-utils'

export const Utilisateur = defineComponent({
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const matomo = inject('matomo', null)

    const user = computed<User>(() => {
      return store.state.user.element
    })

    const logout = () => {
      if (matomo) {
        // @ts-ignore
        matomo.trackEvent('menu-utilisateur', 'menu-utilisateur', 'deconnexion')
      }
      window.location.replace('/apiUrl/deconnecter')
    }
    const deleteUtilisateur = (utilisateur: ApiUser) => {
      store.dispatch(
        'messageAdd',
        {
          value: `l'utilisateur ${utilisateur.prenom} ${utilisateur.nom} a été supprimé`,
          type: 'success'
        },
        { root: true }
      )
      router.push({ name: 'utilisateurs' })
    }
    const updateUtilisateur = async (utilisateur: ApiUser) => {
      try {
        await utilisateurApiClient.updateUtilisateur(utilisateur)

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
    }
    const passwordUpdate = () => {
      window.location.replace('/apiUrl/changerMotDePasse')
    }
    const utilisateurId = Array.isArray(route.params.id)
      ? route.params.id[0]
      : route.params.id
    return () => (
      <PureUtilisateur
        passwordUpdate={passwordUpdate}
        updateUtilisateur={updateUtilisateur}
        apiClient={utilisateurApiClient}
        utilisateurId={utilisateurId}
        user={user.value}
        logout={logout}
        deleteUtilisateur={deleteUtilisateur}
      />
    )
  }
})
interface Props {
  user: User
  logout: () => void
  deleteUtilisateur: (utilisateur: ApiUser) => void
  utilisateurId: string
  apiClient: UtilisateurApiClient
  updateUtilisateur: (utilisateur: ApiUser) => Promise<void>
  passwordUpdate: () => void
}
export const PureUtilisateur = defineComponent<Props>({
  props: [
    'user',
    'logout',
    'deleteUtilisateur',
    'utilisateurId',
    'apiClient',
    'updateUtilisateur',
    'passwordUpdate'
  ] as unknown as undefined,
  setup(props) {
    watch(
      () => props.user,
      () => get()
    )
    onMounted(async () => {
      await get()
    })

    const subscription = ref<AsyncData<boolean>>({ status: 'LOADING' })
    const utilisateur = ref<AsyncData<ApiUser>>({ status: 'LOADING' })
    const removePopup = ref<boolean>(false)
    const editPopup = ref<boolean>(false)
    const isMe = computed(() => {
      return props.user && props.utilisateurId === props.user.id
    })

    const get = async () => {
      try {
        const utilisateurFromApi = await props.apiClient.getUtilisateur(
          props.utilisateurId
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
      if (isMe.value) {
        try {
          subscription.value = {
            status: 'LOADED',
            value: await props.apiClient.getUtilisateurNewsletter(
              props.utilisateurId
            )
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

    const deleteUser = async () => {
      if (utilisateur.value.status === 'LOADED') {
        await props.apiClient.removeUtilisateur(utilisateur.value.value.id)

        if (isMe.value) {
          props.logout()
        } else {
          props.deleteUtilisateur(utilisateur.value.value)
        }
      }
    }
    const updateUtilisateur = async (utilisateur: ApiUser) => {
      await props.updateUtilisateur(utilisateur)
      await get()
    }

    const updateSubscription = async (
      utilisateurId: string,
      newsletterChecked: boolean
    ) => {
      subscription.value = { status: 'LOADING' }
      try {
        await props.apiClient.updateUtilisateurNewsletter(
          utilisateurId,
          newsletterChecked
        )
        // Hack for mailjet latency
        await new Promise(resolve => setTimeout(resolve, 500))
        subscription.value = {
          status: 'LOADED',
          value: newsletterChecked
        }
      } catch (e: any) {
        console.error('error', e)
        subscription.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite"
        }
      }
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
              onClick={() => props.logout()}
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
                    {canEditUtilisateur(props.user, item) ? (
                      <>
                        {isMe.value ? (
                          <button
                            class="btn-alt py-s px-m"
                            title="changer de mot de passe"
                            onClick={props.passwordUpdate}
                          >
                            <Icon size="M" name="key" />
                          </button>
                        ) : null}

                        <button
                          id="cmn-utilisateur-button-popup-editer"
                          class="btn-alt py-s px-m"
                          title="modifier le compte utilisateur"
                          onClick={() => {
                            editPopup.value = true
                          }}
                        >
                          <Icon size="M" name="pencil" />
                        </button>

                        <button
                          id="cmn-utilisateur-button-popup-supprimer"
                          class="btn-alt py-s px-m"
                          title="supprimer le compte utilisateur"
                          onClick={() => {
                            removePopup.value = true
                          }}
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
                  <LoadingElement
                    data={utilisateur.value}
                    renderItem={item => <p>{item.prenom || '–'}</p>}
                  />
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Nom</h5>
                  </div>
                  <LoadingElement
                    data={utilisateur.value}
                    renderItem={item => <p>{item.nom || '–'}</p>}
                  />
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Email</h5>
                  </div>
                  <div>
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
                  <LoadingElement
                    data={utilisateur.value}
                    renderItem={item => <p>{item.telephoneFixe || '–'}</p>}
                  />
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Téléphone mobile</h5>
                  </div>
                  <LoadingElement
                    data={utilisateur.value}
                    renderItem={item => <p>{item.telephoneMobile || '–'}</p>}
                  />
                </div>

                <div class="tablet-blobs">
                  <div class="tablet-blob-1-4">
                    <h5>Permissions</h5>
                  </div>
                  <LoadingElement
                    data={utilisateur.value}
                    renderItem={item => (
                      <>
                        {item.role ? (
                          <Pill class="mb">{item.role}</Pill>
                        ) : (
                          <p>–</p>
                        )}
                      </>
                    )}
                  />
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

                          <div>
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
                                updateSubscription(
                                  props.utilisateurId,
                                  e.target.checked
                                )
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
            utilisateur={utilisateur.value.value}
            update={updateUtilisateur}
            getEntreprises={props.apiClient.getEntreprises}
            user={props.user}
          />
        ) : null}
      </div>
    )
  }
})
