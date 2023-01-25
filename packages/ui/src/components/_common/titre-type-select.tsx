import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { User } from 'camino-common/src/roles'
import {
  DomaineId,
  isDomaineId,
  sortedDomaines
} from 'camino-common/src/static/domaines'
import {
  getDomaineId,
  getTitreTypeTypeByDomaineId,
  TitreTypeId,
  toTitreTypeId
} from 'camino-common/src/static/titresTypes'
import {
  TitresTypesTypes,
  TitreTypeType
} from 'camino-common/src/static/titresTypesTypes'
import { defineComponent, computed, onMounted, ref } from 'vue'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'

export interface Props {
  element: {
    typeId: TitreTypeId | undefined | null
  }
  domaineId: DomaineId | undefined
  user: User
}

type Domaine = {
  id: DomaineId
  nom: string
}

const titresTypeTypes = (
  user: Props['user'],
  domaineId: DomaineId | undefined
): undefined | TitreTypeType[] => {
  if (domaineId) {
    return getTitreTypeTypeByDomaineId(domaineId)
      .filter(titreTypeTypeId =>
        canCreateTitre(user, toTitreTypeId(titreTypeTypeId, domaineId))
      )
      .map(titreTypeTypeId => TitresTypesTypes[titreTypeTypeId])
  }

  return undefined
}

const TypeSelect = ({
  user,
  element,
  domaineId
}: Props): JSX.Element | null => {
  if (isDomaineId(domaineId)) {
    return (
      <>
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Type</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <select
              v-model={element.typeId}
              class="p-s mr"
              disabled={!titresTypeTypes}
            >
              {titresTypeTypes(user, domaineId)?.map(titreTypeType => {
                return (
                  <option
                    key={titreTypeType.id}
                    value={toTitreTypeId(titreTypeType.id, domaineId)}
                  >
                    {titreTypeType.nom}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <hr />
      </>
    )
  }
  return null
}

export const TitreTypeSelect = defineComponent<Props>({
  setup(props) {
    const domaineRef = ref<Props['domaineId']>(
      props.element.typeId
        ? getDomaineId(props.element.typeId)
        : props.domaineId
    )

    const domainesFiltered = computed<Domaine[]>(() =>
      sortedDomaines.filter(d =>
        getTitreTypeTypeByDomaineId(d.id).some(titreTypeTypeId =>
          canCreateTitre(props.user, toTitreTypeId(titreTypeTypeId, d.id))
        )
      )
    )

    const domaineUpdate = (domaineId: DomaineId | undefined) => {
      domaineRef.value = domaineId
      if (domaineId) {
        const titreTypes = titresTypeTypes(props.user, domaineId)
        // Si on a que 1 choix, on le sélectionne directement
        if (titreTypes?.length === 1) {
          props.element.typeId = toTitreTypeId(titreTypes[0].id, domaineId)
        } else {
          props.element.typeId = null
        }
      } else {
        props.element.typeId = null
      }
    }
    onMounted(() => {
      // Si l’utilisateur peut sélectionner que 1 domaine, on le sélectionne
      if (domainesFiltered.value.length === 1) {
        domaineRef.value = domainesFiltered.value[0].id
      }
      domaineUpdate(domaineRef.value)
    })

    return () => (
      <div>
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Domaine</h5>
          </div>

          <div class="mb tablet-blob-2-3">
            <select
              value={domaineRef.value}
              class="p-s mr"
              onChange={event =>
                domaineUpdate(
                  isEventWithTarget(event) && isDomaineId(event.target.value)
                    ? event.target.value
                    : undefined
                )
              }
            >
              {domainesFiltered.value.map(domaine => {
                return (
                  <option key={domaine.id} value={domaine.id}>
                    {domaine.nom}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <hr />
        <TypeSelect
          element={props.element}
          user={props.user}
          domaineId={domaineRef.value}
        ></TypeSelect>
      </div>
    )
  }
})

TitreTypeSelect.props = ['user', 'element', 'domaineId']
