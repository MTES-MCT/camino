import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { User } from 'camino-common/src/roles'
import {
  DomaineId,
  isDomaineId,
  sortedDomaines
} from 'camino-common/src/static/domaines'
import {
  getTitreTypeTypeByDomaineId,
  TitreTypeId,
  toTitreTypeId
} from 'camino-common/src/static/titresTypes'
import {
  TitresTypesTypes,
  TitreTypeType
} from 'camino-common/src/static/titresTypesTypes'
import { defineComponent, computed, onMounted } from 'vue'

export interface Props {
  element: {
    domaineId: DomaineId | undefined
    typeId: TitreTypeId | undefined | null
  }
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

const TypeSelect = ({ user, element }: Props) => {
  const domaine = element.domaineId
  if (isDomaineId(domaine)) {
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
              {titresTypeTypes(user, element.domaineId)?.map(titreTypeType => {
                return (
                  <option
                    key={titreTypeType.id}
                    value={toTitreTypeId(titreTypeType.id, domaine)}
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
    const domainesFiltered = computed<Domaine[]>(() =>
      sortedDomaines.filter(d =>
        getTitreTypeTypeByDomaineId(d.id).some(titreTypeTypeId =>
          canCreateTitre(props.user, toTitreTypeId(titreTypeTypeId, d.id))
        )
      )
    )

    const domaineUpdate = () => {
      const titreTypes = titresTypeTypes(props.user, props.element.domaineId)
      // Si on a que 1 choix, on le sélectionne directement
      if (props.element.domaineId && titreTypes?.length === 1) {
        props.element.typeId = toTitreTypeId(
          titreTypes[0].id,
          props.element.domaineId
        )
      } else {
        props.element.typeId = null
      }
    }
    onMounted(() => {
      // Si l’utilisateur peut sélectionner que 1 domaine, on le sélectionne
      if (domainesFiltered.value.length === 1) {
        props.element.domaineId = domainesFiltered.value[0].id
      }
      domaineUpdate()
    })

    return () => (
      <div>
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Domaine</h5>
          </div>

          <div class="mb tablet-blob-2-3">
            <select
              v-model={props.element.domaineId}
              class="p-s mr"
              onSelect={domaineUpdate}
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
        {TypeSelect(props)}
      </div>
    )
  }
})

TitreTypeSelect.props = ['user', 'element']
