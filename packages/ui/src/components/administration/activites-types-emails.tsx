import emailValidator from 'email-validator'
import { ref, computed } from 'vue'
import { ActivitesTypes, ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { User } from 'camino-common/src/roles'
import { canEditEmails } from 'camino-common/src/permissions/administrations'
import { Administration, AdministrationId, Administrations } from 'camino-common/src/static/administrations'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { ButtonIcon } from '../_ui/button-icon'

interface Props {
  administrationId: AdministrationId
  user: User
  activitesTypesEmails: { activiteTypeId: ActivitesTypesId; email: string }[]
  emailUpdate: (administrationId: AdministrationId, activiteTypeId: ActivitesTypesId, email: string) => void
  emailDelete: (administrationId: AdministrationId, activiteTypeId: ActivitesTypesId, email: string) => void
}

export const ActivitesTypesEmails = caminoDefineComponent<Props>(['administrationId', 'user', 'activitesTypesEmails', 'emailUpdate', 'emailDelete'], props => {
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
    return !!(activiteTypeNew.value.activiteTypeId && activiteTypeNew.value.email && emailValidator.validate(activiteTypeNew.value.email))
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
      props.emailUpdate(props.administrationId, activiteTypeId, email)
    }
    activiteTypeNew.value.activiteTypeId = null
    activiteTypeNew.value.email = null
  }

  const activiteTypeEmailDelete = async ({ activiteTypeId, email }: { email: string; activiteTypeId: ActivitesTypesId }) => {
    props.emailDelete(props.administrationId, activiteTypeId, email)
  }

  const activiteTypeIdLabelize = (activiteTypeId: ActivitesTypesId) => {
    const activiteType = ActivitesTypes[activiteTypeId]

    return activiteType ? activiteTypeLabelize(activiteType) : ''
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

      <div class="line width-full" />

      <div class="width-full-p">
        <div class="overflow-scroll-x mb">
          <table>
            <tr>
              <th>Type d'activité</th>
              <th>Email</th>
              {canEditEmailsComp.value ? <th>Actions</th> : null}
            </tr>
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
              <tr key={activiteTypeEmail.activiteTypeId + activiteTypeEmail.email}>
                <td>
                  <span class="cap-first">{activiteTypeIdLabelize(activiteTypeEmail.activiteTypeId)}</span>
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
