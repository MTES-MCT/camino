import { TitreTypeSelect } from './_common/titre-type-select'
import { User, isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper } from 'camino-common/src/roles'
import { TitresLink } from '@/components/titre/titres-link'
import { canCreateTitre, getLinkConfig } from 'camino-common/src/permissions/titres'
import { computed, defineComponent, onMounted, ref, inject } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { LinkableTitre, TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'
import { DsfrSelect } from './_ui/dsfr-select'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { Nullable, isNonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
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
import { TitreDemande, titreDemandeValidator } from 'camino-common/src/titres'
import { entreprisesKey, userKey } from '@/moi'
import { Alert } from './_ui/alert'

export const TitreCreation = defineComponent(() => {
  const router = useRouter()

  const user = inject(userKey)
  const entreprises = inject(entreprisesKey, ref([]))

  const goToEtape = async (titreEtapeId: EtapeId) => {
    await router.push({
      name: 'etapeEdition',
      params: { id: titreEtapeId },
    })
  }

  return () => (
    <PureTitreCreation
      user={user}
      entreprises={entreprises.value}
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

type Props = {
  user: User
  entreprises: Entreprise[]
  apiClient: Pick<ApiClient, 'createTitre' | 'loadLinkableTitres'>
  initialValue?: TitreDemande
}
export const PureTitreCreation = defineComponent<Props>(props => {
  type EntrepriseInternal = {
    id: EntrepriseId
    label: string
  }

  const titreDemande = ref<Nullable<TitreDemande>>(props.initialValue ?? { entrepriseId: null, references: [], typeId: null, nom: null, titreFromIds: [] })

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

  onMounted(() => {
    if (entreprises.length === 1) {
      titreDemande.value.entrepriseId = entreprises[0].id
    }
  })

  const onSelectTitres = (titres: { id: TitreId }[]) => {
    titreDemande.value.titreFromIds = titres.map(({ id }) => id)
  }

  const entreprises: EntrepriseInternal[] = props.entreprises
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

  const entrepriseUpdate = (entrepriseId: EntrepriseId | null) => {
    titreDemande.value = {
      entrepriseId,
      references: [],
      typeId: null,
      nom: null,
      titreFromIds: [],
    }
  }

  const save = async () => {
    const parsed = titreDemandeValidator.safeParse(titreDemande.value)
    if (parsed.success) {
      savingTitre.value = { status: 'LOADING' }
      try {
        await props.apiClient.createTitre(parsed.data)
        savingTitre.value = { status: 'LOADED', value: undefined }
      } catch (e: any) {
        console.error('error', e)
        savingTitre.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
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
    <div>
      <h1>Demande de titre</h1>

      <form
        onSubmit={e => {
          e.preventDefault()
        }}
      >
        {isNonEmptyArray(entreprises) ? (
          <DsfrSelect required={true} legend={{ main: 'Entreprise' }} initialValue={titreDemande.value.entrepriseId} items={entreprises} valueChanged={entrepriseUpdate} />
        ) : (
          <Alert class="fr-mb-1w" small={true} type="error" title="Aucune entreprise associée à cet utilisateur" />
        )}

        {isNotNullNorUndefined(titreDemande.value.entrepriseId) ? <TitreTypeSelect onUpdateTitreTypeId={onUpdateTitreTypeId} titreTypeId={titreDemande.value.typeId} user={props.user} /> : null}

        {isNotNullNorUndefined(titreDemande.value.typeId) ? (
          <DsfrInput required={true} initialValue={titreDemande.value.nom} legend={{ main: 'Nom du titre' }} type={{ type: 'text' }} valueChanged={onTitreNomChanged} />
        ) : null}

        {isNotNullNorUndefined(titreDemande.value.typeId) && !entrepriseOuBureauDEtudeCheck.value ? (
          <TitreReferenceSelect class="fr-mt-3w" initialValues={titreDemande.value.references ?? []} onUpdateReferences={onUpdateReferences} />
        ) : null}

        {isNotNullNorUndefined(titreDemande.value.typeId) && isNotNullNorUndefined(linkConfig.value) ? (
          <div class="fr-mt-3w">
            <label class="fr-label fr-mb-1w">Titre {linkConfig.value.count === 'multiple' ? 's' : ''} à l’origine de cette nouvelle demande</label>
            <TitresLink config={titreLinkConfig.value} loadLinkableTitres={loadLinkableTitresByTypeId.value} onSelectTitres={onSelectTitres} />
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center' }} class="fr-mt-3w">
          <DsfrButton title="Enregistrer" onClick={save} disabled={!complete.value || savingTitre.value.status === 'LOADING'} type="submit" class="fr-mr-1w" />
          <LoadingElement data={savingTitre.value} renderItem={() => null} />
        </div>
      </form>
    </div>
  )
})

// @ts-ignore
PureTitreCreation.props = ['user', 'entreprises', 'apiClient', 'initialValue']
