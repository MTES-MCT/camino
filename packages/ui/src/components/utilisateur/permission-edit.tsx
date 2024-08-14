import { isEntrepriseOrBureauDetudeRole, Role, User, UserNotNull, isAdministration, isSuper, isEntrepriseOrBureauDEtude, isAdministrationRole } from 'camino-common/src/roles'
import { computed, defineComponent, ref } from 'vue'
import { AdministrationId, Administrations, sortedAdministrations } from 'camino-common/src/static/administrations'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'
import { canEditPermission, getAssignableRoles } from 'camino-common/src/permissions/utilisateurs'
import { UtilisateurApiClient } from './utilisateur-api-client'
import { TypeAheadSmartMultiple, Element } from '../_ui/typeahead-smart-multiple'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, map } from 'camino-common/src/typescript-tools'
import { capitalize } from 'camino-common/src/strings'
import { DsfrSelect } from '../_ui/dsfr-select'
import { DsfrButton, DsfrButtonIcon } from '../_ui/dsfr-button'
import { LabelWithValue } from '../_ui/label-with-value'
import { DsfrTag } from '../_ui/tag'

interface Props {
  user: User
  utilisateur: UserNotNull
  apiClient: Pick<UtilisateurApiClient, 'updateUtilisateur'>
  entreprises: Entreprise[]
}

export const PermissionDisplay = defineComponent<Props>(props => {
  const mode = ref<'read' | 'edit'>('read')

  const updateUtilisateur = async (utilisateur: UtilisateurToEdit) => {
    await props.apiClient.updateUtilisateur(utilisateur)
    mode.value = 'read'
  }

  return () => (
    <>
      {mode.value === 'read' ? (
        <>
          <LabelWithValue
            title="Rôles"
            item={
              <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                <DsfrTag ariaLabel={capitalize(props.utilisateur.role)} />
                {canEditPermission(props.user, props.utilisateur) ? (
                  <DsfrButtonIcon buttonType="tertiary-no-outline" title="Modifie les permissions" onClick={() => (mode.value = 'edit')} icon="fr-icon-pencil-line" />
                ) : null}
              </div>
            }
          />

          {isEntrepriseOrBureauDEtude(props.utilisateur) && isNotNullNorUndefinedNorEmpty(props.utilisateur.entrepriseIds) ? (
            <LabelWithValue
              title={`Entreprise${props.utilisateur.entrepriseIds.length > 0 ? 's' : ''}`}
              item={
                <ul class="fr-tags-group">
                  {isEntrepriseOrBureauDEtude(props.utilisateur) &&
                    props.utilisateur.entrepriseIds.map(entrepriseId => {
                      const e = props.entreprises.find(({ id }) => id === entrepriseId)

                      return e ? (
                        <li key={e.id}>
                          <DsfrTag ariaLabel={isNotNullNorUndefined(e.legal_siren) ? `${e.nom} (${e.legal_siren})` : e.nom} to={{ name: 'entreprise', params: { id: e.id } }} />
                        </li>
                      ) : null
                    })}
                </ul>
              }
            />
          ) : null}

          {isAdministration(props.utilisateur) ? (
            <LabelWithValue
              title="Administration"
              item={
                <DsfrTag
                  ariaLabel={`${Administrations[props.utilisateur.administrationId].abreviation}${
                    isNotNullNorUndefined(Administrations[props.utilisateur.administrationId].service) ? ` - ${Administrations[props.utilisateur.administrationId].service}` : ''
                  }`}
                  to={{ name: 'administration', params: { id: props.utilisateur.administrationId } }}
                />
              }
            />
          ) : null}
        </>
      ) : (
        <PermissionEdit cancelEdition={() => (mode.value = 'read')} user={props.user} utilisateur={props.utilisateur} entreprises={props.entreprises} updateUtilisateur={updateUtilisateur} />
      )}
    </>
  )
})

type PermissionEditProps = {
  user: User
  utilisateur: UserNotNull
  entreprises: Entreprise[]
  updateUtilisateur: (utilisateur: UtilisateurToEdit) => Promise<void>
  cancelEdition: () => void
}

const PermissionEdit = defineComponent<PermissionEditProps>(props => {
  const updatingUtilisateur = ref<UtilisateurToEdit>({
    id: props.utilisateur.id,
    role: props.utilisateur.role,
    entrepriseIds: isEntrepriseOrBureauDEtude(props.utilisateur) ? props.utilisateur.entrepriseIds : [],
    administrationId: isAdministration(props.utilisateur) ? props.utilisateur.administrationId : null,
  })

  const assignableRoles = getAssignableRoles(props.user)
  const onSelectEntreprises = (elements: Element<EntrepriseId>[]) => {
    const entrs = elements.map(({ id }) => id)
    updatingUtilisateur.value.entrepriseIds.splice(0, updatingUtilisateur.value.entrepriseIds.length, ...entrs)
  }

  const complete = computed(() => {
    if (isEntrepriseOrBureauDetudeRole(updatingUtilisateur.value.role) && !updatingUtilisateur.value.entrepriseIds?.length) {
      return false
    }

    if (isAdministrationRole(updatingUtilisateur.value.role) && !updatingUtilisateur.value.administrationId) {
      return false
    }

    return true
  })

  const selectAdministration = (e: AdministrationId | null) => {
    if (isNotNullNorUndefined(e)) {
      updatingUtilisateur.value.administrationId = e
    }
  }

  const save = async () => {
    if (complete.value) {
      if (!isAdministrationRole(updatingUtilisateur.value.role)) {
        updatingUtilisateur.value.administrationId = null
      }

      if (!isEntrepriseOrBureauDetudeRole(updatingUtilisateur.value.role)) {
        updatingUtilisateur.value.entrepriseIds = []
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
    <>
      {!!props.user && props.user.id !== updatingUtilisateur.value.id && assignableRoles.length > 0 ? (
        <>
          <LabelWithValue
            title="Rôles"
            item={
              <ul class="fr-tags-group">
                {assignableRoles.map(role => (
                  <li>
                    <DsfrButton class="fr-tag" onClick={() => roleToggle(role)} aria-pressed={updatingUtilisateur.value.role === role} title={capitalize(role)} />
                  </li>
                ))}
              </ul>
            }
          />

          {isEntrepriseOrBureauDetudeRole(updatingUtilisateur.value.role) ? (
            <LabelWithValue
              title="Entreprises"
              item={
                <TypeAheadSmartMultiple
                  filter={{
                    name: 'Entreprises',
                    value: updatingUtilisateur.value.entrepriseIds,
                    elements: props.entreprises,
                    lazy: false,
                  }}
                  onSelectItems={elements => onSelectEntreprises(elements)}
                />
              }
            />
          ) : null}

          {isSuper(props.user) && isAdministrationRole(updatingUtilisateur.value.role) ? (
            <LabelWithValue
              title="Administration"
              item={
                <DsfrSelect
                  items={map(sortedAdministrations, admin => ({ id: admin.id, label: admin.abreviation }))}
                  initialValue={updatingUtilisateur.value.administrationId}
                  legend={{ main: '' }}
                  valueChanged={selectAdministration}
                />
              }
            />
          ) : null}

          <LabelWithValue
            title=""
            item={
              <div>
                <DsfrButton title="Annuler" buttonType="secondary" onClick={props.cancelEdition} />
                <DsfrButton class="fr-ml-2w" title="Enregistrer" buttonType="primary" onClick={save} disabled={!complete.value} />
              </div>
            }
          />
        </>
      ) : null}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PermissionEdit.props = ['user', 'utilisateur', 'entreprises', 'updateUtilisateur', 'cancelEdition']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PermissionDisplay.props = ['user', 'utilisateur', 'apiClient', 'entreprises']
