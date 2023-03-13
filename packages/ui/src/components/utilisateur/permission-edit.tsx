import { isEntrepriseOrBureauDetudeRole, Role, User, UserNotNull, isAdministration, isSuper, isEntrepriseOrBureauDEtude, isAdministrationRole } from 'camino-common/src/roles'
import { computed, onMounted, ref } from 'vue'
import { Administrations, isAdministrationId, sortedAdministrations } from 'camino-common/src/static/administrations'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { canEditPermission, getAssignableRoles } from 'camino-common/src/permissions/utilisateurs'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { UtilisateurApiClient } from './utilisateur-api-client'
import { Pill } from '../_ui/pill'
import { Icon } from '../_ui/icon'
import { TypeAheadSmartMultiple, Element } from '../_ui/typeahead-smart-multiple'

interface Props {
  user: User
  utilisateur: AsyncData<UserNotNull>
  apiClient: Pick<UtilisateurApiClient, 'getEntreprises' | 'updateUtilisateur'>
}

export const PermissionDisplay = caminoDefineComponent<Props>(['user', 'utilisateur', 'apiClient'], props => {
  const entreprises = ref<AsyncData<Entreprise[]>>({ status: 'LOADING' })

  const mode = ref<'read' | 'edit'>('read')

  const updateUtilisateur = async (utilisateur: UtilisateurToEdit) => {
    await props.apiClient.updateUtilisateur(utilisateur)
    mode.value = 'read'
  }

  onMounted(async () => {
    try {
      const entreprisesApi = await props.apiClient.getEntreprises()
      entreprises.value = { status: 'LOADED', value: entreprisesApi }
    } catch (e: any) {
      console.error('error', e)
      entreprises.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })
  return () => (
    <>
      {mode.value === 'read' ? (
        <>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-4 tablet-pt-s pb-s">
              <h5>Rôles</h5>
            </div>
            <div class="tablet-blob-3-4">
              <LoadingElement
                style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}
                data={props.utilisateur}
                renderItem={item => (
                  <>
                    <Pill>{item.role}</Pill>{' '}
                    {canEditPermission(props.user, item) ? (
                      <button class="btn-alt p-xs rnd-s" title="modifie les permissions" onClick={() => (mode.value = 'edit')}>
                        <Icon size="M" name="pencil" />
                      </button>
                    ) : null}{' '}
                  </>
                )}
              />
            </div>
          </div>
          {props.utilisateur.status === 'LOADED' && isEntrepriseOrBureauDEtude(props.utilisateur.value) && props.utilisateur.value.entreprises?.length ? (
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Entreprise{props.utilisateur.value.entreprises.length > 1 ? 's' : ''}</h5>
              </div>

              <div>
                <ul class="list-inline">
                  <LoadingElement
                    data={entreprises.value}
                    renderItem={loadedEntreprises => (
                      <>
                        {props.utilisateur.status === 'LOADED' &&
                          isEntrepriseOrBureauDEtude(props.utilisateur.value) &&
                          props.utilisateur.value.entreprises.map(ent => {
                            const e = loadedEntreprises.find(({ id }) => id === ent.id)
                            return e ? (
                              <li key={e.id} class="mb-xs">
                                <router-link
                                  to={{
                                    name: 'entreprise',
                                    params: { id: e.id },
                                  }}
                                  class="btn-border small p-s rnd-xs mr-xs"
                                >
                                  {e.legalSiren ? `${e.nom} (${e.legalSiren})` : e.nom}
                                </router-link>
                              </li>
                            ) : null
                          })}
                      </>
                    )}
                  />
                </ul>
              </div>
            </div>
          ) : null}

          {props.utilisateur.status === 'LOADED' && isAdministration(props.utilisateur.value) ? (
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Administration</h5>
              </div>

              <div class="tablet-blob-3-4">
                {`${Administrations[props.utilisateur.value.administrationId].abreviation}${
                  Administrations[props.utilisateur.value.administrationId].service ? ` - ${Administrations[props.utilisateur.value.administrationId].service}` : ''
                }`}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {props.utilisateur.status === 'LOADED' ? (
            <PermissionEdit cancelEdition={() => (mode.value = 'read')} user={props.user} utilisateur={props.utilisateur.value} entreprises={entreprises.value} updateUtilisateur={updateUtilisateur} />
          ) : null}
        </>
      )}
    </>
  )
})

type PermissionEditProps = {
  user: User
  utilisateur: UserNotNull
  entreprises: AsyncData<Entreprise[]>
  updateUtilisateur: (utilisateur: UtilisateurToEdit) => Promise<void>
  cancelEdition: () => void
}

const PermissionEdit = caminoDefineComponent<PermissionEditProps>(['user', 'utilisateur', 'entreprises', 'updateUtilisateur', 'cancelEdition'], props => {
  const updatingUtilisateur = ref<UtilisateurToEdit>({
    id: props.utilisateur.id,
    role: props.utilisateur.role,
    entreprises: isEntrepriseOrBureauDEtude(props.utilisateur) ? props.utilisateur.entreprises.map(({ id }) => id) : [],
    administrationId: isAdministration(props.utilisateur) ? props.utilisateur.administrationId : null,
  })

  const assignableRoles = getAssignableRoles(props.user)
  const onSelectEntreprises = (elements: Element<EntrepriseId>[]) => {
    const entrs = elements.map(({ id }) => id)
    updatingUtilisateur.value.entreprises.splice(0, updatingUtilisateur.value.entreprises.length, ...entrs)
  }

  const complete = computed(() => {
    if (isEntrepriseOrBureauDetudeRole(updatingUtilisateur.value.role) && !updatingUtilisateur.value.entreprises?.length) {
      return false
    }

    if (isAdministrationRole(updatingUtilisateur.value.role) && !updatingUtilisateur.value.administrationId) {
      return false
    }

    return true
  })

  const selectAdministration = (e: Event) => {
    if (isEventWithTarget(e) && isAdministrationId(e.target.value)) {
      updatingUtilisateur.value.administrationId = e.target.value
    }
  }

  const save = async () => {
    if (complete.value) {
      if (!isAdministrationRole(updatingUtilisateur.value.role)) {
        updatingUtilisateur.value.administrationId = null
      }

      if (!isEntrepriseOrBureauDetudeRole(updatingUtilisateur.value.role)) {
        updatingUtilisateur.value.entreprises = []
      }

      await props.updateUtilisateur(updatingUtilisateur.value)
    }
  }

  const roleToggle = (role: Role) => {
    updatingUtilisateur.value.role = role
    if (isAdministration(props.user) && isAdministrationRole(updatingUtilisateur.value.role)) {
      updatingUtilisateur.value.administrationId = props.user.administrationId
    }
  }

  return () => (
    <div>
      {!!props.user && props.user.id !== updatingUtilisateur.value.id && assignableRoles.length > 0 ? (
        <div>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-4 tablet-pt-s pb-s">
              <h5>Rôles</h5>
            </div>
            <div class="mb tablet-blob-3-4">
              <ul class="list-inline mb-0 tablet-pt-s">
                {assignableRoles.map(role => (
                  <li key={role} class="mb-xs">
                    <button class={`btn-flash small py-xs px-s pill cap-first mr-xs ${updatingUtilisateur.value.role === role ? 'active' : ''}`} onClick={() => roleToggle(role)}>
                      {role}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isEntrepriseOrBureauDetudeRole(updatingUtilisateur.value.role) ? (
            <div>
              <LoadingElement
                data={props.entreprises}
                renderItem={item => (
                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4 tablet-pt-s pb-s">
                      <h5>Entreprises</h5>
                    </div>
                    <div class="mb tablet-blob-3-4">
                      <TypeAheadSmartMultiple
                        filter={{
                          id: 'entreprises',
                          name: 'Entreprises',
                          value: updatingUtilisateur.value.entreprises,
                          elements: item,
                          lazy: false,
                        }}
                        onSelectItems={elements => onSelectEntreprises(elements)}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          ) : null}

          {isSuper(props.user) && isAdministrationRole(updatingUtilisateur.value.role) ? (
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4 tablet-pt-s pb-s">
                <h5>Administration</h5>
              </div>

              <div class="tablet-blob-3-4 mb">
                <select placeholder="Administration" onChange={selectAdministration} value={updatingUtilisateur.value.administrationId} class="p-s mr-s">
                  {sortedAdministrations.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.abreviation}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          <div class="tablet-blobs">
            <div class="tablet-blob-1-4 pb-s"></div>

            <div class="tablet-blob-3-4 mb-m flex">
              <button class="btn-secondary" style="flex: 0 1 min-content" onClick={props.cancelEdition}>
                Annuler
              </button>
              <button class="btn-primary ml-s" style="flex: 0 1 min-content" onClick={save} disabled={!complete.value}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
})
