{/* <template>
  {/* 

 

  

  



  <div class="tablet-blobs mb">
    <div class="tablet-blob-1-3" />
    <div class="tablet-blob-2-3">
      <button v-if="!loading" id="cmn-titre-activite-edit-popup-button-enregistrer" :ref="saveRef" :disabled="!complete" class="btn btn-primary" @click="save">Créer le titre</button>
      <div v-else class="p-s full-x bold">Enregistrement en cours…</div>
    </div>
  </div> 
</template>

<script setup lang="ts"> */}
import { ReferenceTypeId, sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { TitreTypeSelect } from './_common/titre-type-select'
import { Icon } from '@/components/_ui/icon'
import { User, isBureauDEtudes, isEntreprise } from 'camino-common/src/roles'
import { TitresLink } from '@/components/titre/titres-link'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
// import { apiClient } from '@/api/api-client'
import { TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { DsfrSelect } from './_ui/dsfr-select'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ApiClient, apiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from './_ui/functional-loader'
import { DsfrInput } from './_ui/dsfr-input'
import { TitreReferenceSelect } from './_common/titre-reference-select'
import { TitreReference } from 'camino-common/src/titres-references'


export const TitreCreation = defineComponent(() => {
  const store = useStore()

  const user = computed(() => {
    return store.state.user.element
  })

  return () => <PureTitreCreation user={user.value} apiClient={apiClient} />
})


type Props = {
  user: User
  apiClient: Pick<ApiClient, 'getEntreprisesTitresCreation'>
}
export const PureTitreCreation = defineComponent<Props>((props) => {
type Entreprise = {
  id: EntrepriseId
  label: string
}

const titreDemande = ref<{
  entrepriseId: EntrepriseId | null
  typeId: TitreTypeId  | null
  nom: string | null
  titreFromIds?: string[]
  references: { referenceTypeId: ReferenceTypeId | ''; nom: string }[]
}>({ entrepriseId: null, references: [], typeId: null, nom: null })
const saveRef = ref<any>(null)

const titreLinkConfig = computed<TitresLinkConfig>(() => {
  if (linkConfig.value?.count === 'single') {
    return {
      type: 'single',
      selectedTitreId: null,
    }
  }

  return {
    type: 'multiple',
    selectedTitreIds: [],
  }
})



const entreprises = ref<AsyncData<NonEmptyArray<Entreprise>>>({status: 'LOADING'})

const entrepriseOuBureauDEtudeCheck = computed<boolean>(() => {
  return isEntreprise(props.user) || isBureauDEtudes(props.user)
})

const complete = computed(() => {
  return titreDemande.value.entrepriseId && titreDemande.value.typeId && titreDemande.value.nom
})

const loading = computed(() => {
  return false // store.state.loading.includes('titreCreationAdd')
})

const linkConfig = computed(() => {
  if (titreDemande.value.typeId) {
    return getLinkConfig(titreDemande.value.typeId, [])
  }
  return null
})

const loadLinkableTitresByTypeId = computed(() => {
  if (titreDemande.value.typeId) {
    return () => Promise.resolve([])// apiClient.loadLinkableTitres(titreDemande.value.typeId, [])
  } else {
    return () => Promise.resolve([])
  }
})

onMounted(async () => {
  await init()

  document.addEventListener('keyup', keyUp)
})

onBeforeUnmount(() => {
  document.removeEventListener('keyup', keyUp)
})

const onSelectedTitres = (titres: { id: string }[]) => {
  titreDemande.value.titreFromIds = titres.map(({ id }) => id)
}
const unused = () => {}
const keyUp = (e: KeyboardEvent) => {
  if ((e.which || e.keyCode) === 13 && complete.value && !loading.value) {
    saveRef.value?.focus()
    save()
  }
}

const init = async () => {
  entreprises.value = {status: 'LOADING'}
  try {
  const data = await props.apiClient.getEntreprisesTitresCreation()

  const dataParsed = data.map(({id, nom}) => ({id, label: nom}))
  if (isNonEmptyArray(dataParsed)) {
    entreprises.value = {status: 'LOADED', value: dataParsed }

    if (dataParsed.length === 1) {
      titreDemande.value.entrepriseId = dataParsed[0].id
    }
  } else {
    entreprises.value = {status: 'ERROR', message: 'Aucune entreprise associée à cet utilisateur'}
  }
} catch (e: any) {
  console.error('error', e)
  entreprises.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
}
}

const entrepriseUpdate = (entrepriseId: EntrepriseId | null) => {
  titreDemande.value = {
    entrepriseId: entrepriseId,
    references: [],
    typeId: null,
    nom: null,
  }
}

const save = () => {
  if (linkConfig.value && !titreDemande.value.titreFromIds) {
    titreDemande.value.titreFromIds = []
  }

  // store.dispatch('titreCreation/save', titreDemande.value)
}




const onUpdateTitreTypeId = (titreTypeId: TitreTypeId | null) => {
  titreDemande.value.typeId = titreTypeId
}

const onTitreNomChanged = (nom: string | null) => {
  titreDemande.value.nom = nom
}

const onUpdateReferences = (references: TitreReference[]) => {
  titreDemande.value.references = references
}
return () => (<div class="dsfr">
  <h1>Demande de titre</h1>


      <LoadingElement  data={entreprises.value} renderItem={(items) => <DsfrSelect required={true} legend={{main: 'Entreprise'}} initialValue={titreDemande.value.entrepriseId} items={items} valueChanged={entrepriseUpdate} />} />

      {isNotNullNorUndefined(titreDemande.value.entrepriseId) ? <TitreTypeSelect onUpdateTitreTypeId={onUpdateTitreTypeId} titreTypeId={titreDemande.value.typeId} user={props.user} /> : null}

      {isNotNullNorUndefined(titreDemande.value.typeId) ? <DsfrInput required={true} legend={{main: 'Nom du titre'}} type={{type: 'text'}} valueChanged={onTitreNomChanged} /> : null}

      {isNotNullNorUndefined(titreDemande.value.typeId) && !entrepriseOuBureauDEtudeCheck.value ? <TitreReferenceSelect onUpdateReferences={onUpdateReferences} /> : null }
      
      {isNotNullNorUndefined(titreDemande.value.typeId) && isNotNullNorUndefined(linkConfig.value) ? <div>
            <label class="fr-label fr-mb-1w">
            Titre { linkConfig.value.count === 'multiple' ? 's' : '' } à l’origine de cette nouvelle demande
            </label>
            <TitresLink config={titreLinkConfig.value} loadLinkableTitres={loadLinkableTitresByTypeId.value} onSelectTitres={onSelectedTitres} onSelectTitre={unused} />
      </div> : null}
      

    </div>)




})


// @ts-ignore
PureTitreCreation.props = ['user', 'apiClient']
