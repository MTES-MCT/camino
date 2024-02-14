import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { User } from 'camino-common/src/roles'
import { DomaineId, sortedDomaines } from 'camino-common/src/static/domaines'
import { getDomaineId, getTitreTypeType, getTitreTypeTypeByDomaineId, TitreTypeId, toTitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes, TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { computed, onMounted, ref } from 'vue'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DsfrSelect } from '../_ui/dsfr-select'
import { NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  titreTypeId: TitreTypeId | null
  user: User
  onUpdateTitreTypeId: (titreTypeId: TitreTypeId | null) => void
}

export const TitreTypeSelect = caminoDefineComponent<Props>(['titreTypeId', 'user', 'onUpdateTitreTypeId'], props => {
  const domaineRef = ref<DomaineId | null>(props.titreTypeId ? getDomaineId(props.titreTypeId) : null)
  const titreTypeType = ref<TitreTypeTypeId | null>(props.titreTypeId ? getTitreTypeType(props.titreTypeId) : null)

  const domainesFiltered = computed<NonEmptyArray<{ id: DomaineId; label: string }> | null>(() => {
    const values = sortedDomaines
      .filter(d => getTitreTypeTypeByDomaineId(d.id).some(titreTypeTypeId => canCreateTitre(props.user, toTitreTypeId(titreTypeTypeId, d.id))))
      .map(({ id, nom }) => ({ id, label: nom }))

    if (isNonEmptyArray(values)) {
      return values
    }

    return null
  })

  const titresTypeTypes = computed<NonEmptyArray<{ id: TitreTypeTypeId; label: string }> | null>(() => {
    const domaineId = domaineRef.value
    if (isNotNullNorUndefined(domaineId)) {
      const value = getTitreTypeTypeByDomaineId(domaineId)
        .filter(titreTypeTypeId => canCreateTitre(props.user, toTitreTypeId(titreTypeTypeId, domaineId)))
        .map(titreTypeTypeId => ({ id: titreTypeTypeId, label: TitresTypesTypes[titreTypeTypeId].nom }))
      if (isNonEmptyArray(value)) {
        return value
      }
    }

    return null
  })

  const domaineUpdate = (domaineId: DomaineId | null) => {
    domaineRef.value = domaineId
    props.onUpdateTitreTypeId(null)
    titreTypeType.value = null
  }

  const titreTypeTypeUpdate = (titreTypeTypeId: TitreTypeTypeId | null) => {
    const domaineId = domaineRef.value
    if (isNotNullNorUndefined(domaineId) && isNotNullNorUndefined(titreTypeTypeId)) {
      props.onUpdateTitreTypeId(toTitreTypeId(titreTypeTypeId, domaineId))
      titreTypeType.value = titreTypeTypeId
    } else {
      props.onUpdateTitreTypeId(null)
      titreTypeType.value = null
    }
  }
  onMounted(() => {
    // Si l’utilisateur peut sélectionner que 1 domaine, on le sélectionne
    if (domaineRef.value === null && isNotNullNorUndefined(domainesFiltered.value) && domainesFiltered.value.length === 1) {
      domaineRef.value = domainesFiltered.value[0].id
      domaineUpdate(domaineRef.value)
    }
  })

  return () => (
    <>
      {isNotNullNorUndefined(domainesFiltered.value) ? (
        <DsfrSelect required={true} initialValue={domaineRef.value} items={domainesFiltered.value} valueChanged={domaineUpdate} legend={{ main: 'Domaine' }} />
      ) : null}

      {isNotNullNorUndefined(titresTypeTypes.value) ? (
        <DsfrSelect required={true} initialValue={titreTypeType.value} items={titresTypeTypes.value} legend={{ main: 'Type' }} valueChanged={titreTypeTypeUpdate} />
      ) : null}
    </>
  )
})
