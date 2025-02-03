import emailValidator from 'email-validator'
import { computed, defineComponent } from 'vue'
import { ActivitesTypes, ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { User } from 'camino-common/src/roles'
import { canEditEmails } from 'camino-common/src/permissions/administrations'
import { ADMINISTRATION_TYPE_IDS, Administration, AdministrationId, Administrations } from 'camino-common/src/static/administrations'
import { AdministrationActiviteTypeEmail } from 'camino-common/src/administrations'
import { NonEmptyArray, getValues, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { capitalize } from 'camino-common/src/strings'
import { DsfrInput } from '../_ui/dsfr-input'
import { useState } from '@/utils/vue-tsx-utils'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { DsfrSelect } from '../_ui/dsfr-select'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'
import { fr } from '@codegouvfr/react-dsfr'

interface Props {
  administrationId: AdministrationId
  user: User
  activitesTypesEmails: AdministrationActiviteTypeEmail[]
  // TODO 2024-06-26 tester et gérer les retours CaminoError
  emailUpdate: (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => Promise<void>
  emailDelete: (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => Promise<void>
}
const activiteTypeLabelize = (activiteType: { nom: string; id: string }) => {
  return `${capitalize(activiteType.nom)} (${activiteType.id.toUpperCase()})`
}
const activiteTypeIdLabelize = (activiteTypeId: ActivitesTypesId) => {
  const activiteType = ActivitesTypes[activiteTypeId]

  return activiteTypeLabelize(activiteType)
}
type ColumnId = 'type' | 'email' | 'action'
export const ActivitesTypesEmails = defineComponent<Props>(props => {
  const administration = computed<Administration>(() => Administrations[props.administrationId])

  const [activiteType, setActiviteType] = useState<{
    activiteTypeId: ActivitesTypesId | null
    email: string | null
  }>({
    activiteTypeId: null,
    email: null,
  })
  const activitesTypes = getValues(ActivitesTypes).map(activiteType => {
    return { id: activiteType.id, label: activiteTypeLabelize(activiteType) }
  }) as NonEmptyArray<{ id: ActivitesTypesId; label: string }>
  const activiteTypeNewActive = computed<boolean>(() => {
    return isNotNullNorUndefined(activiteType.value.activiteTypeId) && isNotNullNorUndefined(activiteType.value.email) && emailValidator.validate(activiteType.value.email)
  })

  const isFullyNotifiable = computed(() => {
    return [ADMINISTRATION_TYPE_IDS.DREAL, ADMINISTRATION_TYPE_IDS.MINISTERE].includes(administration.value.typeId)
  })

  const canEditEmailsComp = computed(() => {
    return canEditEmails(props.user, props.administrationId)
  })

  const activiteTypeEmailUpdate = () => {
    if (isNotNullNorUndefined(activiteTypeNewActive.value)) {
      const { email, activiteTypeId } = activiteType.value
      if (email !== null && activiteTypeId !== null) {
        props.emailUpdate(props.administrationId, { activite_type_id: activiteTypeId, email })
      }
      setActiviteType({ activiteTypeId: null, email: null })
    }
  }

  const activiteTypeEmailDelete = async (administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => {
    props.emailDelete(props.administrationId, administrationActiviteTypeEmail)
  }

  const updateActiviteTypeEmail = (email: string) => {
    setActiviteType({ activiteTypeId: activiteType.value.activiteTypeId, email })
  }
  const updateActiviteTypeId = (activiteTypeId: ActivitesTypesId | null) => {
    setActiviteType({ activiteTypeId, email: activiteType.value.email })
  }

  const columns = computed<Column<ColumnId>[]>(() => {
    const staticColumns: Column<ColumnId>[] = [
      { id: 'type', contentTitle: "Type d'activité" },
      { id: 'email', contentTitle: 'Email' },
    ]
    if (canEditEmailsComp.value) {
      staticColumns.push({ id: 'action', contentTitle: 'Actions', class: [fr.cx('fr-cell--bottom')] })
    }
    return staticColumns
  })

  const rows = computed<TableRow<ColumnId>[]>(() => {
    const myRows: TableRow<ColumnId>[] = []

    if (canEditEmailsComp.value) {
      myRows.push({
        id: 'add',
        link: null,
        columns: {
          type: {
            type: 'jsx',
            jsxElement: <DsfrSelect legend={{ main: 'Activité' }} items={activitesTypes} valueChanged={updateActiviteTypeId} initialValue={activiteType.value.activiteTypeId} />,
            value: 'type',
          },
          email: {
            type: 'jsx',
            jsxElement: <DsfrInput type={{ type: 'email' }} legend={{ main: 'Email' }} valueChanged={updateActiviteTypeEmail} initialValue={activiteType.value.email} />,
            value: 'email',
          },
          action: {
            type: 'jsx',
            jsxElement: <DsfrButtonIcon icon="fr-icon-add-line" title="Ajouter un email pour un type d'activité" onClick={activiteTypeEmailUpdate} disabled={!activiteTypeNewActive.value} />,
            value: 'action',
          },
        },
      })
    }

    myRows.push(
      ...props.activitesTypesEmails.map<TableRow<ColumnId>>(activiteTypeEmail => {
        return {
          id: activiteTypeEmail.activite_type_id + activiteTypeEmail.email,
          link: null,
          columns: {
            type: { type: 'text', value: activiteTypeIdLabelize(activiteTypeEmail.activite_type_id) },
            email: { type: 'text', value: activiteTypeEmail.email },
            action: {
              type: 'jsx',
              jsxElement: canEditEmailsComp.value ? (
                <DsfrButtonIcon icon="fr-icon-delete-bin-line" title="Supprimer un email pour un type d’activité" onClick={() => activiteTypeEmailDelete(activiteTypeEmail)} buttonType="secondary" />
              ) : (
                <div></div>
              ),
              value: activiteTypeEmail.activite_type_id + activiteTypeEmail.email,
            },
          },
        }
      })
    )
    return myRows
  })
  return () => (
    <div>
      <h3>Emails à notifier lors du dépôt d’un type d’activité</h3>

      <div>
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
        <TableSimple caption={{ value: '', visible: false }} columns={columns.value} rows={rows.value} />
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ActivitesTypesEmails.props = ['administrationId', 'user', 'activitesTypesEmails', 'emailUpdate', 'emailDelete']
