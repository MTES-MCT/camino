import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
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
import { UtilisateurId, utilisateurIdValidator, User } from 'camino-common/src/roles'
import { Alert } from './_ui/alert'
import { DsfrLink, DsfrButtonIcon } from './_ui/dsfr-button'
import { LabelWithValue } from './_ui/label-with-value'

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
      <DsfrLink to={{ name: 'utilisateurs', params: {} }} disabled={false} title="Utilisateurs" icon={null} />

      <LoadingElement
        data={utilisateur.value}
        renderItem={item => (
          <>
            <div class="fr-grid-row fr-grid-row--top fr-mt-4w">
              <h1 class="fr-m-0">
                {item.nom} {item.prenom}
              </h1>
              <div class="fr-m-0" style={{ marginLeft: 'auto !important', display: 'flex' }}>
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
              </div>
            </div>

            <div class="fr-pt-8w fr-pb-4w" style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
              <LabelWithValue title="Prénom" text={item.prenom} />
              <LabelWithValue title="Nom" text={item.nom} />
              <LabelWithValue title="Email" item={isNotNullNorUndefined(item.email) ? <DsfrLink disabled={false} href={`mailto:${item.email}`} icon={null} title={item.email} /> : <span>–</span>} />
              <LabelWithValue
                title="Téléphone fixe"
                item={isNotNullNorUndefined(item.telephoneFixe) ? <DsfrLink disabled={false} href={`tel:${item.telephoneFixe}`} icon={null} title={item.telephoneFixe} /> : <span>–</span>}
              />
              <LabelWithValue
                title="Téléphone mobile"
                item={isNotNullNorUndefined(item.telephoneMobile) ? <DsfrLink disabled={false} href={`tel:${item.telephoneMobile}`} icon={null} title={item.telephoneMobile} /> : <span>–</span>}
              />
              <PermissionDisplay user={props.user} utilisateur={item} apiClient={{ ...props.apiClient, updateUtilisateur }} entreprises={props.entreprises} />
              {isMe.value ? (
                <>
                  <LabelWithValue
                    title="Newsletter"
                    item={
                      <LoadingElement
                        data={subscription.value}
                        renderItem={item => <DsfrInputCheckbox legend={{ main: '' }} valueChanged={checked => updateSubscription(props.utilisateurId, checked)} initialValue={item} />}
                      />
                    }
                  />
                  <LabelWithValue title="QGis" item={<QGisToken apiClient={props.apiClient} />} />{' '}
                </>
              ) : null}
            </div>
          </>
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
