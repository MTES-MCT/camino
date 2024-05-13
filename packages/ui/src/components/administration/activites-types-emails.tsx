import emailValidator from 'email-validator'
import { ref, computed, defineComponent } from 'vue'
import { ActivitesTypes, ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { User } from 'camino-common/src/roles'
import { canEditEmails } from 'camino-common/src/permissions/administrations'
import { Administration, AdministrationId, Administrations } from 'camino-common/src/static/administrations'
import { AdministrationActiviteTypeEmail } from 'camino-common/src/administrations'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ButtonIcon } from '../_ui/button-icon'

interface Props {
  administrationId: AdministrationId
  user: User
  activitesTypesEmails: AdministrationActiviteTypeEmail[]
  emailUpdate: (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => void
  emailDelete: (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => void
}

export const ActivitesTypesEmails = defineComponent<Props>(props => {
  const administration = computed<Administration>(() => Administrations[props.administrationId])
  const activiteTypeNew = ref<{
    activiteTypeId: ActivitesTypesId | null
    email: string | null
  }>({
    activiteTypeId: null,
    email: null,
  })
  const activitesTypes = ref(Object.values(ActivitesTypes))

  const activiteTypeNewActive = computed<boolean>(() => {
    return isNotNullNorUndefined(activiteTypeNew.value.activiteTypeId) && isNotNullNorUndefined(activiteTypeNew.value.email) && emailValidator.validate(activiteTypeNew.value.email)
  })

  const isFullyNotifiable = computed(() => {
    return ['dea', 'dre', 'min'].includes(administration.value.typeId)
  })

  const canEditEmailsComp = computed(() => {
    return canEditEmails(props.user, props.administrationId)
  })

  const activiteTypeEmailUpdate = () => {
    if (!activiteTypeNewActive.value) return
    const { email, activiteTypeId } = activiteTypeNew.value
    if (email !== null && activiteTypeId !== null) {
      props.emailUpdate(props.administrationId, { activite_type_id: activiteTypeId, email })
    }
    activiteTypeNew.value.activiteTypeId = null
    activiteTypeNew.value.email = null
  }

  const activiteTypeEmailDelete = async (administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => {
    props.emailDelete(props.administrationId, administrationActiviteTypeEmail)
  }

  const activiteTypeIdLabelize = (activiteTypeId: ActivitesTypesId) => {
    const activiteType = ActivitesTypes[activiteTypeId]

    return activiteTypeLabelize(activiteType)
  }

  const activiteTypeLabelize = (activiteType: { nom: string; id: string }) => {
    return activiteType.nom.charAt(0).toUpperCase() + activiteType.nom.slice(1) + ' (' + activiteType.id.toUpperCase() + ')'
  }

  return () => (
    <div class="mb-xxl">
      <h3>Emails à notifier lors du dépôt d’un type d’activité</h3>

      <div class="tablet-blob-3-4">
        <div class="h6">
          <p>
            Lors d’un dépôt d’une activité d’un type en particulier
            {!isFullyNotifiable.value ? (
              <span>
                <strong> si la production annuelle est non nulle</strong>
              </span>
            ) : null}
            , quels sont les emails à notifier ?
          </p>
        </div>
      </div>

      <hr />

      <div>
        <div class="overflow-scroll-x fr-table fr-table--no-caption">
          <table style={{ display: 'table' }}>
            <thead>
              <th>Type d'activité</th>
              <th>Email</th>
              {canEditEmailsComp.value ? <th>Actions</th> : null}
            </thead>
            {canEditEmailsComp.value ? (
              <tr>
                <td>
                  <select v-model={activiteTypeNew.value.activiteTypeId} class="py-xs px-s mr-s mt-xs">
                    {activitesTypes.value.map(activiteType => (
                      <option key={activiteType.id} value={activiteType.id}>
                        {activiteTypeLabelize(activiteType)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    v-model={activiteTypeNew.value.email}
                    type="email"
                    class="py-xs mt-xs"
                    placeholder="Email"
                    onKeyup={key => {
                      if (key.code === 'Enter') {
                        activiteTypeEmailUpdate()
                      }
                    }}
                  />
                </td>
                <td>
                  <ButtonIcon class="py-s px-m btn rnd-xs p-s" disabled={!activiteTypeNewActive.value} onClick={activiteTypeEmailUpdate} icon="plus" title="Ajouter un email pour un type d’activité" />
                </td>
              </tr>
            ) : null}

            {props.activitesTypesEmails.map(activiteTypeEmail => (
              <tr key={activiteTypeEmail.activite_type_id + activiteTypeEmail.email}>
                <td>
                  <span class="cap-first">{activiteTypeIdLabelize(activiteTypeEmail.activite_type_id)}</span>
                </td>
                <td>{activiteTypeEmail.email}</td>
                {canEditEmailsComp.value ? (
                  <td>
                    <ButtonIcon
                      class="btn-border py-s px-m my--xs rnd-xs flex-right"
                      onClick={() => activiteTypeEmailDelete(activiteTypeEmail)}
                      icon="delete"
                      title="Supprimer un email pour un type d’activité"
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </table>
        </div>
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ActivitesTypesEmails.props = ['administrationId', 'user', 'activitesTypesEmails', 'emailUpdate', 'emailDelete']
