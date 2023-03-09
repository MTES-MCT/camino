import { Utilisateur } from '@/api/api-client'
import { isEntrepriseOrBureauDetudeRole, Role, User, isAdministration, isBureauDEtudes, isEntreprise, isSuper } from 'camino-common/src/roles'
import { computed, onMounted, ref } from 'vue'
import { isAdministrationId, sortedAdministrations } from 'camino-common/src/static/administrations'
import { Entreprise } from 'camino-common/src/entreprise'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { cloneAndClean } from '@/utils'
import { InputAutocomplete, Element } from '../_ui/filters-input-autocomplete'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { getAssignableRoles } from 'camino-common/src/permissions/utilisateurs'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'

interface Props {
  user: User
  getEntreprises: () => Promise<Entreprise[]>
  close: () => void
  utilisateur: Omit<Utilisateur, 'nom' | 'prenom'>
  update: (utilisateur: Utilisateur) => Promise<void>
}

export const EditPopup = caminoDefineComponent<Props>(['user', 'getEntreprises', 'close', 'utilisateur', 'update'], props => {
  const assignableRoles = getAssignableRoles(props.user)
  const onSelectEntreprises = (elements: Element[], entreprises: Entreprise[]) => {
    const entrs = elements.map(({ id }) => entreprises.find(({ id: entrId }) => id === entrId)).filter(isNotNullNorUndefined)

    if (!utilisateurPopup.value.entreprises) {
      utilisateurPopup.value.entreprises = entrs
    } else {
      utilisateurPopup.value.entreprises.splice(0, utilisateurPopup.value.entreprises.length, ...entrs)
    }
  }
  const entreprises = ref<AsyncData<Entreprise[]>>({ status: 'LOADING' })
  onMounted(async () => {
    try {
      const entreprisesApi = await props.getEntreprises()
      entreprises.value = { status: 'LOADED', value: entreprisesApi }
    } catch (e: any) {
      console.error('error', e)
      entreprises.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })
  const complete = computed(() => {
    const formComplete = utilisateurPopup.value.nom && utilisateurPopup.value.prenom && utilisateurPopup.value.id && utilisateurPopup.value.email

    if (!formComplete) {
      return false
    }

    if (isEntrepriseOrBureauDetudeRole(utilisateurPopup.value.role) && !utilisateurPopup.value.entreprises?.length) {
      return false
    }

    if (isAdministration(utilisateurPopup.value) && !utilisateurPopup.value.administrationId) {
      return false
    }

    return true
  })

  const selectAdministration = (e: Event) => {
    if (isEventWithTarget(e) && isAdministration(utilisateurPopup.value) && isAdministrationId(e.target.value)) {
      utilisateurPopup.value.administrationId = e.target.value
    }
  }
  const utilisateurPopup = ref<Utilisateur>(cloneAndClean(props.utilisateur))

  const content = () => (
    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Téléphone fixe</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            value={utilisateurPopup.value.telephoneFixe}
            onInput={e => {
              utilisateurPopup.value.telephoneFixe = isEventWithTarget(e) ? e.target.value : ''
            }}
            type="text"
            class="p-s"
            placeholder="0100000000"
          />
        </div>
      </div>

      <hr />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Téléphone mobile</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            value={utilisateurPopup.value.telephoneMobile}
            onInput={e => {
              utilisateurPopup.value.telephoneMobile = isEventWithTarget(e) ? e.target.value : ''
            }}
            type="text"
            class="p-s"
            placeholder="0100000000"
          />
        </div>
      </div>

      {assignableRoles.length > 0 ? (
        <div>
          <hr />
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5>Rôles</h5>
            </div>
            <div class="mb tablet-blob-2-3">
              <ul class="list-inline mb-0 tablet-pt-s">
                {assignableRoles.map(role => (
                  <li key={role} class="mb-xs">
                    <button class={`btn-flash small py-xs px-s pill cap-first mr-xs ${utilisateurPopup.value.role === role ? 'active' : ''}`} onClick={() => roleToggle(role)}>
                      {role}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isEntreprise(utilisateurPopup.value) || isBureauDEtudes(utilisateurPopup.value) ? (
            <div>
              <hr />
              <h3 class="mb-s">Entreprises</h3>
              <LoadingElement
                data={entreprises.value}
                renderItem={items => (
                  <div>
                    {/* FIXME BUG AUTOCOMPLETE */}
                    <InputAutocomplete
                      filter={{
                        id: 'entreprises',
                        name: 'Entreprises',
                        value: utilisateurPopup.value.entreprises?.map(({ id }) => id) ?? [],
                        elements: items,
                        lazy: false,
                      }}
                      onSelectItems={elements => onSelectEntreprises(elements, items)}
                    />
                  </div>
                )}
              />
            </div>
          ) : null}

          {isSuper(props.user) && isAdministration(utilisateurPopup.value) ? (
            <div>
              <hr />
              <h3 class="mb-s">Administration</h3>

              <div class="flex full-x mb">
                <select onChange={selectAdministration} value={utilisateurPopup.value.administrationId} class="p-s mr-s">
                  {sortedAdministrations.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.abreviation}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  const save = async () => {
    if (complete.value) {
      const utilisateur = JSON.parse(JSON.stringify(utilisateurPopup.value))

      if (!isAdministration(utilisateurPopup.value)) {
        utilisateur.administrationId = undefined
      }

      if (isEntreprise(utilisateurPopup.value) || isBureauDEtudes(utilisateurPopup.value)) {
        utilisateur.entreprises = utilisateur.entreprises.map(({ id }: { id: string }) => ({ id }))
      } else {
        utilisateur.entreprises = []
      }

      await props.update(utilisateur)
    }
  }

  const roleToggle = (role: Role) => {
    utilisateurPopup.value.role = role
    if (isAdministration(props.user) && isAdministration(utilisateurPopup.value)) {
      utilisateurPopup.value.administrationId = props.user.administrationId
    }
  }

  return () => (
    <FunctionalPopup title={`Modification du compte ${props.utilisateur.email}`} content={content} validate={{ text: 'Enregistrer', can: complete.value, action: save }} close={props.close} />
  )
})
