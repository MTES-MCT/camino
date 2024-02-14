import { TitreTypeSelect } from './_common/titre-type-select'
import { User, isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper } from 'camino-common/src/roles'
import { TitresLink } from '@/components/titre/titres-link'
import { canCreateTitre, getLinkConfig } from 'camino-common/src/permissions/titres'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { LinkableTitre, TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'
import { DsfrSelect } from './_ui/dsfr-select'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ApiClient, apiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from './_ui/functional-loader'
import { DsfrInput } from './_ui/dsfr-input'
import { TitreReferenceSelect } from './_common/titre-reference-select'
import { TitreReference } from 'camino-common/src/titres-references'
import { DsfrButton } from './_ui/dsfr-button'
import { EtapeId } from 'camino-common/src/etape'
import { useRouter } from 'vue-router'
import { TitreId } from 'camino-common/src/validators/titres'

export const TitreCreation = defineComponent(() => {
  const store = useStore()
  const router = useRouter()

  const user = computed(() => {
    return store.state.user.element
  })

  const goToEtape = async (titreEtapeId: EtapeId) => {
    await router.push({
      name: 'etape-edition',
      params: { id: titreEtapeId },
    })
  }

  return () => (
    <PureTitreCreation
      user={user.value}
      apiClient={{
        ...apiClient,
        createTitre: async titreDemande => {
          const etapeId = await apiClient.createTitre(titreDemande)
          goToEtape(etapeId)

          return etapeId
        },
      }}
    />
  )
})

type Value = {
  entrepriseId: EntrepriseId | null
  typeId: TitreTypeId | null
  nom: string | null
  titreFromIds?: TitreId[]
  references: TitreReference[]
}
type Props = {
  user: User
  apiClient: Pick<ApiClient, 'getEntreprises' | 'createTitre' | 'loadLinkableTitres'>
  initialValue?: Value
}
export const PureTitreCreation = defineComponent<Props>(props => {
  type Entreprise = {
    id: EntrepriseId
    label: string
  }

  const titreDemande = ref<Value>(props.initialValue ?? { entrepriseId: null, references: [], typeId: null, nom: null })

  const titreLinkConfig = computed<TitresLinkConfig>(() => {
    if (linkConfig.value?.count === 'single') {
      return {
        type: 'single',
        selectedTitreId: titreDemande.value.titreFromIds?.[0] ?? null,
      }
    }

    return {
      type: 'multiple',
      selectedTitreIds: [],
    }
  })

  const entreprises = ref<AsyncData<NonEmptyArray<Entreprise>>>({ status: 'LOADING' })
  const savingTitre = ref<AsyncData<void>>({ status: 'LOADED', value: undefined })

  const entrepriseOuBureauDEtudeCheck = computed<boolean>(() => {
    return isEntreprise(props.user) || isBureauDEtudes(props.user)
  })

  const complete = computed(() => {
    return (
      isNotNullNorUndefined(titreDemande.value.entrepriseId) &&
      isNotNullNorUndefined(titreDemande.value.typeId) &&
      isNotNullNorUndefined(titreDemande.value.nom) &&
      titreDemande.value.nom.trim().length > 0
    )
  })

  const linkConfig = computed(() => {
    if (titreDemande.value.typeId) {
      return getLinkConfig(titreDemande.value.typeId, [])
    }

    return null
  })

  const loadLinkableTitresByTypeId = computed<() => Promise<LinkableTitre[]>>(() => {
    const titreTypeId = titreDemande.value.typeId
    if (isNotNullNorUndefined(titreTypeId)) {
      return props.apiClient.loadLinkableTitres(titreTypeId, [])
    } else {
      return () => Promise.resolve([])
    }
  })

  onMounted(async () => {
    await init()
  })

  const onSelectedTitres = (titres: { id: TitreId }[]) => {
    titreDemande.value.titreFromIds = titres.map(({ id }) => id)
  }
  const unused = () => {}

  const init = async () => {
    entreprises.value = { status: 'LOADING' }
    try {
      const data = await props.apiClient.getEntreprises()

      const dataParsed = data
        .filter(entreprise => {
          if (isSuper(props.user)) {
            return true
          }

          if ((isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user)) && canCreateTitre(props.user, null)) {
            return true
          }

          if (isEntreprise(props.user) || isBureauDEtudes(props.user)) {
            return props.user.entreprises.map(({ id }) => id).includes(entreprise.id)
          }

          return false
        })
        .map(({ id, nom }) => ({ id, label: nom }))
      if (isNonEmptyArray(dataParsed)) {
        entreprises.value = { status: 'LOADED', value: dataParsed }

        if (dataParsed.length === 1) {
          titreDemande.value.entrepriseId = dataParsed[0].id
        }
      } else {
        entreprises.value = { status: 'ERROR', message: 'Aucune entreprise associée à cet utilisateur' }
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
      entrepriseId,
      references: [],
      typeId: null,
      nom: null,
    }
  }

  const save = async () => {
    savingTitre.value = { status: 'LOADING' }
    try {
      await props.apiClient.createTitre(titreDemande.value)
      savingTitre.value = { status: 'LOADED', value: undefined }
    } catch (e: any) {
      console.error('error', e)
      savingTitre.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
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

  return () => (
    <div class="dsfr">
      <h1>Demande de titre</h1>

      <form
        onSubmit={e => {
          e.preventDefault()
        }}
      >
        <LoadingElement
          data={entreprises.value}
          renderItem={items => <DsfrSelect required={true} legend={{ main: 'Entreprise' }} initialValue={titreDemande.value.entrepriseId} items={items} valueChanged={entrepriseUpdate} />}
        />

        {isNotNullNorUndefined(titreDemande.value.entrepriseId) ? <TitreTypeSelect onUpdateTitreTypeId={onUpdateTitreTypeId} titreTypeId={titreDemande.value.typeId} user={props.user} /> : null}

        {isNotNullNorUndefined(titreDemande.value.typeId) ? (
          <DsfrInput required={true} initialValue={titreDemande.value.nom} legend={{ main: 'Nom du titre' }} type={{ type: 'text' }} valueChanged={onTitreNomChanged} />
        ) : null}

        {isNotNullNorUndefined(titreDemande.value.typeId) && !entrepriseOuBureauDEtudeCheck.value ? (
          <TitreReferenceSelect initialValues={titreDemande.value.references} onUpdateReferences={onUpdateReferences} />
        ) : null}

        {isNotNullNorUndefined(titreDemande.value.typeId) && isNotNullNorUndefined(linkConfig.value) ? (
          <div class="fr-mb-3w">
            <label class="fr-label fr-mb-1w">Titre {linkConfig.value.count === 'multiple' ? 's' : ''} à l’origine de cette nouvelle demande</label>
            <TitresLink config={titreLinkConfig.value} loadLinkableTitres={loadLinkableTitresByTypeId.value} onSelectTitres={onSelectedTitres} onSelectTitre={unused} />
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DsfrButton title="Enregistrer" onClick={save} disabled={!complete.value || savingTitre.value.status === 'LOADING'} type="submit" class="fr-mr-1w" />
          <LoadingElement data={savingTitre.value} renderItem={() => null} />
        </div>
      </form>
    </div>
  )
})

// @ts-ignore
PureTitreCreation.props = ['user', 'apiClient', 'initialValue']
