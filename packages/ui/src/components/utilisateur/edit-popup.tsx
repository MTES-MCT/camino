import { Utilisateur } from "@/api/api-client";
import { Role, User } from "camino-common/src/roles";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { FunctionalPopup } from "../_ui/functional-popup";
import { sortedAdministrations } from 'camino-common/src/static/administrations'
import { Icon } from '../_ui/icon'
import {
  isAdministration,
  isAdministrationAdmin,
  isBureauDEtudes,
  isEntreprise,
  isSuper,
  ROLES
} from 'camino-common/src/roles'
import router from '@/router'
import { Entreprise, newEntrepriseId } from "camino-common/src/entreprise";
import { AsyncData } from "@/api/client-rest";
import { LoadingElement } from "../_ui/functional-loader";
import { cloneAndClean } from "@/utils";

interface Props {
  user: User
  getEntreprises: () => Promise<Entreprise[]>
  close: () => void
  values: 
  { action: 'edit', utilisateur: Utilisateur,  subscription: boolean, update: (utilisateur: Utilisateur) => Promise<void>} | 
  { action: 'create', create: (utilisateur: Utilisateur) => Promise<{id: string}> }
}

const formIsVisible = (user: User): boolean =>  {
  return isSuper(user) || isAdministrationAdmin(user)
}
export const EditPopup = defineComponent<Props>({
  props: ['user', 'getEntreprises', 'values', 'close'] as unknown as undefined,
    setup(props) {
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
  
        if (!utilisateurEntreprisesLength.value) {
          return false
        }
  
        if (
          isAdministration(utilisateurPopup.value) && !utilisateurPopup.value.administrationId
        ) {
          return false
        }
  
        return true
      })
  
      const utilisateurEntreprisesLength = computed(() => {
        return (isEntreprise(utilisateurPopup.value) || isBureauDEtudes(utilisateurPopup.value)) && utilisateurPopup.value.entreprises?.filter(({ id }) => id).length
      })

      const title = props.values.action === 'create' ? "Création d'un compte utilisateur" : 'Modification du compte utilisateur'
      const utilisateurPopup = ref<Utilisateur>(props.values.action === 'edit' ? cloneAndClean(props.values.utilisateur) : {nom: '', id: 'unused', email: '', prenom: '', role: 'defaut'})
      console.log('prout', props.values.utilisateur)
      console.log('prout2', utilisateurPopup.value)
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
  
        {utilisateurPopup.value.permissionModification ? (<div>
          <hr />
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5>Rôles</h5>
            </div>
            <div class="mb tablet-blob-2-3">
              <ul class="list-inline mb-0 tablet-pt-s">
                {ROLES.map(role => (<li key={role} class="mb-xs">
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
              {/* FIXME UTILISER UN FILTERS-INPUT-AUTOCOMPLETE */}
              PROUT { utilisateurPopup.value.entreprises[0].nom }
            {utilisateurPopup.value.entreprises ? (<div>{utilisateurPopup.value.entreprises.map((entreprise, n) => (<div key={n}>
              <div
                class={`flex full-x ${utilisateurEntreprisesLength ? 'mb-s' : 'mb'}`}
              >
                <select
                  id="cmn-utilisateur-edit-popup-entreprise-select"
                  value={utilisateurPopup.value.entreprises[n].id}
                  class="p-s mr-s"
                >
                  {items.map(e => (<option
                    
                    key={e.id}
                    value={{ id: e.id }}
                    selected={utilisateurPopup.value.entreprises?.find(({ id }) => id === e.id) === undefined}
                    disabled={
                      utilisateurPopup.value.entreprises?.find(({ id }) => id === e.id) !== undefined
                    }
                  >
                    { e.nom }
                  </option>))}
                  
                </select>
                <div class="flex-right">
                  <button
                    class="btn py-s px-m rnd-xs"
                    onClick={() => entrepriseRemove(n)}
                  >
                    <Icon name="minus" size="M" />
                  </button>
                </div>
              </div>
            </div>
            ))}</div>) : null}
            </div>)}/>
            
            
  
            { !utilisateurPopup.value.entreprises?.some(({ id }) => id === '') ? (
                          <button
                          id="cmn-utilisateur-edit-popup-entreprise-button-ajouter"
                          class="btn small rnd-xs py-s px-m full-x flex mb"
                          onClick={entrepriseAdd}
                        >
                          <span class="mt-xxs">Ajouter une entreprise</span>
                          <Icon name="plus" size="M" class="flex-right" />
                        </button>
            ) : null }

          </div>
          ) : null}
          
  
              {isAdministration(utilisateurPopup.value) ? (<div>
            <hr />
            <h3 class="mb-s">Administration</h3>
  
            <div class="flex full-x mb">
              <select value={utilisateurPopup.value.administrationId} class="p-s mr-s">
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
                value={subscription.value}
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

    delete utilisateur.permissionModification

    if (!isAdministration(utilisateurPopup.value)) {
      utilisateur.administrationId = undefined
    }

    if (isEntreprise(utilisateurPopup.value) || isBureauDEtudes(utilisateurPopup.value)) {
      utilisateur.entreprises = utilisateur.entreprises.filter(
        ({ id }) => id
      )
    } else {``
      utilisateur.entreprises = []
    }

    let utilisateurId = utilisateur.id
    if (props.values.action === 'create') {
      if (!utilisateur.role) {
        utilisateur.role = 'defaut'
      }

      const utilisateurSaved = await props.values.create(utilisateur)

      // const utilisateurSaved = await this.$store.dispatch(
      //   'utilisateur/add',
      //   utilisateur
      // )

      utilisateurId = utilisateurSaved.id
    } else {
      // await this.$store.dispatch('utilisateur/update', utilisateur)
      await props.values.update(utilisateur)
    }

    // FIXME use fetchWithJson
    await fetch(`/apiUrl/utilisateurs/${utilisateurId}/newsletter`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({newsletter: subscription.value})
    })

    await router.push({
      name: 'utilisateur',
      params: { id: utilisateurId }
    })
  }
}

const roleToggle = (role: Role) => {
  utilisateurPopup.value.role = role
}

const entrepriseAdd= () => {
  utilisateurPopup.value.entreprises?.push({ id: newEntrepriseId('') })
}

const entrepriseRemove = (index: number) => {
  utilisateurPopup.value.entreprises?.splice(index, 1)
}

      return () => (<FunctionalPopup 
        title={title} 
        content={content} 
        validate={{text: 'Enregistrer', can: complete.value, action: save}} close={props.close}/>)
  }
}
)
