import { Utilisateur } from "@/api/api-client";
import { isAdministrationRole, isEntrepriseOrBureauDetudeRole, Role, User } from "camino-common/src/roles";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { FunctionalPopup } from "../_ui/functional-popup";
import { isAdministrationId, sortedAdministrations } from 'camino-common/src/static/administrations'
import {
  isAdministration,
  isAdministrationAdmin,
  isBureauDEtudes,
  isEntreprise,
  isSuper,
  ROLES
} from 'camino-common/src/roles'
import router from '@/router'
import { Entreprise } from "camino-common/src/entreprise";
import { AsyncData } from "@/api/client-rest";
import { LoadingElement } from "../_ui/functional-loader";
import { cloneAndClean } from "@/utils";
import { InputAutocomplete, Element } from "../_ui/filters-input-autocomplete";
import { isNotNullNorUndefined } from "camino-common/src/typescript-tools";
import { getAssignableRoles } from "camino-common/src/permissions/utilisateurs";
import { isEventWithTarget } from "@/utils/vue-tsx-utils";

interface Props {
  user: User
  getEntreprises: () => Promise<Entreprise[]>
  close: () => void
  values: 
  { action: 'edit', utilisateur: Utilisateur,  subscription: boolean, update: (utilisateur: Utilisateur, subscription :boolean) => Promise<void>} | 
  { action: 'create', create: (utilisateur: Utilisateur, subscription: boolean) => Promise<{id: string}> }
}

const formIsVisible = (user: User): boolean =>  {
  return isSuper(user) || isAdministrationAdmin(user)
}

export const EditPopup = defineComponent<Props>({
  props: ['user', 'getEntreprises', 'values', 'close'] as unknown as undefined,
    setup(props) {

      const assignableRoles = getAssignableRoles(props.user)
      const onSelectEntreprises = (elements: Element[], entreprises: Entreprise[]) => {
        console.log('bite')
        const entrs = elements.map(({id}) => entreprises.find(({id: entrId}) => id === entrId )).filter(isNotNullNorUndefined)

        if (!utilisateurPopup.value.entreprises) {
          utilisateurPopup.value.entreprises = entrs
        } else {
          utilisateurPopup.value.entreprises.splice(0,utilisateurPopup.value.entreprises.length, ...entrs)
        }
      }
      const entreprises = ref<AsyncData<Entreprise[]>>({status: 'LOADING'})
      onMounted(async () => {
        try {
          const entreprisesApi = await props.getEntreprises()
          console.log('entreprise', entreprisesApi)
          entreprises.value = {status: 'LOADED', value: entreprisesApi}
        } catch (e: any) {
          console.error('error', e)
          entreprises.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite"
          }
        }
      })
      const complete = computed(() => {
        const formComplete =
          props.values.action === 'create'
            ? utilisateurPopup.value.nom &&
              utilisateurPopup.value.prenom &&
              utilisateurPopup.value.email
            : utilisateurPopup.value.nom &&
              utilisateurPopup.value.prenom &&
              utilisateurPopup.value.id &&
              utilisateurPopup.value.email
  
        if (!formComplete) {
          return false
        }
  
        if (isEntrepriseOrBureauDetudeRole(utilisateurPopup.value.role) && !utilisateurPopup.value.entreprises?.length ) {
          return false
        }
  
        if (
          isAdministration(utilisateurPopup.value) && !utilisateurPopup.value.administrationId
        ) {
          return false
        }
  
        return true
      })

      const selectAdministration = (e: Event) => {
        if (isEventWithTarget(e) && isAdministration(utilisateurPopup.value) && isAdministrationId(e.target.value)) {
          utilisateurPopup.value.administrationId = e.target.value
        }
      }
      const title = props.values.action === 'create' ? "Création d'un compte utilisateur" : 'Modification du compte utilisateur'
      const utilisateurPopup = ref<Utilisateur>(props.values.action === 'edit' ? cloneAndClean(props.values.utilisateur) : {nom: '', id: 'unused', email: '', prenom: '', role: 'defaut'})
      const subscription = ref<boolean>(props.values.action === 'edit' ? props.values.subscription : false)

      const content = () => (<div>
        {props.values.action === 'create' ? (<div>
          <p>Renseignez au moins l'email, le prénom et le nom.</p>
          <hr />
        </div>) : null} 
        {formIsVisible(props.user) ? (<div class="tablet-blobs">
          <div class="mb tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Email</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <input
              value={utilisateurPopup.value.email}
              type="email"
              class="p-s"
              placeholder="Email"
            />
          </div>
        </div>) : null}
        
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Prénom</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <input
              value={utilisateurPopup.value.prenom}
              type="text"
              class="p-s"
              placeholder="Prénom"
            />
          </div>
        </div>
  
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Nom</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <input
              value={utilisateurPopup.value.nom}
              type="text"
              class="p-s"
              placeholder="Nom"
            />
          </div>
        </div>
  
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Téléphone fixe</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <input
              value={utilisateurPopup.value.telephoneFixe}
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
              type="text"
              class="p-s"
              placeholder="0100000000"
            />
          </div>
        </div>
  
        {assignableRoles.length > 0 ? (<div>
          <hr />
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5>Rôles</h5>
            </div>
            <div class="mb tablet-blob-2-3">
              <ul class="list-inline mb-0 tablet-pt-s">
                {assignableRoles.map(role => (<li key={role} class="mb-xs">
                  <button
                    class={`btn-flash small py-xs px-s pill cap-first mr-xs ${utilisateurPopup.value.role === role ? 'active' : ''}`}
                    onClick={() => roleToggle(role)}
                  >
                    { role }
                  </button>
                </li>))}
                
              </ul>
            </div>
          </div>
  
          {(isEntreprise(utilisateurPopup.value) || isBureauDEtudes(utilisateurPopup.value)) ? (
            <div>
            <hr />
            <h3 class="mb-s">Entreprises</h3>
            <LoadingElement data={entreprises.value} renderItem={(items) => (<div>
              {/* FIXME BUG AUTOCOMPLETE */}
              <InputAutocomplete filter={{
  id: 'entreprises',
  name: 'Entreprises',
  value: utilisateurPopup.value.entreprises?.map(({id}) => id as string) ?? [],
  elements: items,
  lazy: false
}}
onSelectItems={(elements) => onSelectEntreprises(elements, items)}/>
            </div>)}/>
          </div>
          ) : null}
          
  
              {isSuper(props.user) && isAdministration(utilisateurPopup.value) ? (<div>
            <hr />
            <h3 class="mb-s">Administration</h3>
  
            <div class="flex full-x mb">
              <select onChange={selectAdministration} value={utilisateurPopup.value.administrationId} class="p-s mr-s">
                {sortedAdministrations.map(a => (<option key={a.id} value={a.id}>
                  { a.abreviation }
                </option>))}
                
              </select>
            </div>
          </div>) : null}
          
        </div>) : null}
        
  
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Newsletter</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <label class="tablet-pt-s">
              <input
                checked={subscription.value}
                onInput={() => subscription.value = !subscription.value}
                type="checkbox"
                class="p-s mt-s mb-s mr-xs"
              />
              {subscription.value ? (<span>Inscrit</span>) : null}
            </label>
          </div>
        </div>
      </div>)

const save = async () => {
  if (complete.value) {
    const utilisateur = JSON.parse(JSON.stringify(utilisateurPopup.value))


    if (!isAdministration(utilisateurPopup.value)) {
      utilisateur.administrationId = undefined
    }

    if (isEntreprise(utilisateurPopup.value) || isBureauDEtudes(utilisateurPopup.value)) {
      utilisateur.entreprises = utilisateur.entreprises.map(({ id }) => ({id}))
    } else {
      utilisateur.entreprises = []
    }

    let utilisateurId = utilisateur.id
    if (props.values.action === 'create') {
      if (!utilisateur.role) {
        utilisateur.role = 'defaut'
      }

      const utilisateurSaved = await props.values.create(utilisateur, subscription.value)

      // const utilisateurSaved = await this.$store.dispatch(
      //   'utilisateur/add',
      //   utilisateur
      // )

      utilisateurId = utilisateurSaved.id
    } else {
      // await this.$store.dispatch('utilisateur/update', utilisateur)
      await props.values.update(utilisateur, subscription.value)
    }



    if (props.values.action === 'create') {
      await router.push({
        name: 'utilisateur',
        params: { id: utilisateurId }
      })
    }
  }
}

      const roleToggle = (role: Role) => {
        utilisateurPopup.value.role = role
        if( isAdministration(props.user) && isAdministration(utilisateurPopup.value)){
          utilisateurPopup.value.administrationId = props.user.administrationId
        }
      }

      
      return () => (<FunctionalPopup 
        title={title} 
        content={content} 
        validate={{text: 'Enregistrer', can: complete.value, action: save}} close={props.close}/>)
  }
}
)
