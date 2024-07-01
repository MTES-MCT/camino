import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
import { Card } from './_ui/card'
import { User, UtilisateurId, utilisateurIdValidator } from 'camino-common/src/roles'
import { QGisToken } from './utilisateur/qgis-token'
import { AsyncData } from '@/api/client-rest'
import { useRoute, useRouter } from 'vue-router'
import { UtilisateurApiClient, utilisateurApiClient } from './utilisateur/utilisateur-api-client'
import { LoadingElement } from './_ui/functional-loader'
import { RemovePopup } from './utilisateur/remove-popup'
import { canDeleteUtilisateur } from 'camino-common/src/permissions/utilisateurs'
import { PermissionDisplay } from './utilisateur/permission-edit'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'
import { Utilisateur as ApiUser, Entreprise } from 'camino-common/src/entreprise'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

import { entreprisesKey, userKey } from '@/moi'
import { DsfrInputCheckbox } from './_ui/dsfr-input-checkbox'
import { DsfrButtonIcon } from './_ui/dsfr-button'
import { Alert } from './_ui/alert'

export const Utilisateur = defineComponent({
  setup() {
    const route = useRoute<'utilisateur'>()
    const router = useRouter()

    const user = inject(userKey)
    const entreprises = inject(entreprisesKey, ref([]))

    const deleteUtilisateur = async (userId: UtilisateurId) => {
      const isMe: boolean = (user && userId === user.id) ?? false
      if (isMe) {
        // TODO 2023-10-23 type window.location pour s'appuyer sur nos routes rest et pas sur n'importe quoi
        window.location.replace(`/apiUrl/rest/utilisateurs/${userId}/delete`)
      } else {
        await utilisateurApiClient.removeUtilisateur(userId)
        router.push({ name: 'utilisateurs', params: {} })
      }
    }
    const updateUtilisateur = async (utilisateur: UtilisateurToEdit) => {
      await utilisateurApiClient.updateUtilisateur(utilisateur)
    }
    const passwordUpdate = () => {
      window.location.replace('/apiUrl/changerMotDePasse')
    }
    const utilisateurId = computed<UtilisateurId | null>(() => {
      const idOrSlug = route.params.id
      const validated = utilisateurIdValidator.safeParse(idOrSlug)

      if (validated.success) {
        return validated.data
      }

      return null
    })

    return () => (
      <>
        {utilisateurId.value ? (
          <PureUtilisateur
            passwordUpdate={passwordUpdate}
            apiClient={{ ...utilisateurApiClient, updateUtilisateur, removeUtilisateur: deleteUtilisateur }}
            utilisateurId={utilisateurId.value}
            user={user}
            entreprises={entreprises.value}
          />
        ) : (
          <Alert title="Utilisateur inconnu" type="error" small={true} />
        )}
      </>
    )
  },
})
export interface Props {
  user: User
  utilisateurId: UtilisateurId
  apiClient: Pick<UtilisateurApiClient, 'getQGISToken' | 'getUtilisateur' | 'removeUtilisateur' | 'getUtilisateurNewsletter' | 'updateUtilisateur' | 'updateUtilisateurNewsletter'>
  entreprises: Entreprise[]
  passwordUpdate: () => void
}

export const PureUtilisateur = defineComponent<Props>(props => {
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

  const updateSubscription = async (utilisateurId: UtilisateurId, newsletterChecked: boolean) => {
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
                {isMe.value ? <DsfrButtonIcon title="Changer de mot de passe" onClick={props.passwordUpdate} icon="fr-icon-lock-line" buttonType="secondary" /> : null}
                {canDeleteUtilisateur(props.user, item.id) ? (
                  <DsfrButtonIcon
                    title="Supprimer le compte utilisateur"
                    onClick={() => {
                      removePopup.value = true
                    }}
                    class="fr-ml-1w"
                    icon="fr-icon-delete-bin-line"
                    buttonType="secondary"
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
                    renderItem={item => <DsfrInputCheckbox legend={{ main: '' }} valueChanged={checked => updateSubscription(props.utilisateurId, checked)} initialValue={item} />}
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

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureUtilisateur.props = ['user', 'utilisateurId', 'apiClient', 'passwordUpdate', 'entreprises']
