import { Card } from './_ui/card'
import { TableAuto } from './_ui/table-auto'
import { TitresTable } from './titres/table'
import { EntrepriseEditPopup } from './entreprise/edit-popup'
import { dateFormat } from '../utils/index'
import { EntrepriseFiscalite } from './entreprise/entreprise-fiscalite'

import { utilisateursColonnes, utilisateursLignesBuild } from './utilisateurs/table'
import { fiscaliteVisible as fiscaliteVisibleFunc } from 'camino-common/src/fiscalite'
import { User } from 'camino-common/src/roles'
import { CaminoAnnee, getCurrentAnnee, toCaminoAnnee } from 'camino-common/src/date'
import { computed, onMounted, watch, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { canEditEntreprise, canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { EntrepriseType, newEntrepriseId, EntrepriseId } from 'camino-common/src/entreprise'
import { EntrepriseDocuments } from './entreprise/entreprise-documents'
import { AsyncData } from '../api/client-rest'
import { LoadingElement } from './_ui/functional-loader'
import { CaminoError } from './error'
import { ButtonIcon } from './_ui/button-icon'
import { ApiClient, apiClient } from '@/api/api-client'

// FIXME c’est cassé connecté en tant que DGTM
export const Entreprise = defineComponent({
  setup() {
    const store = useStore()
    const vueRoute = useRoute()
    const entrepriseId = ref<EntrepriseId | undefined>(newEntrepriseId(vueRoute.params.id.toString()))
    const user = computed<User>(() => store.state.user.element)

    watch(
      () => vueRoute.params.id,
      newRoute => {
        if (vueRoute.name === 'entreprise' && newRoute) {
          const newEid = newEntrepriseId(vueRoute.params.id.toString())
          if (entrepriseId.value !== newEid) {
            entrepriseId.value = newEid
          }
        }
      }
    )
    const anneeCourante = getCurrentAnnee()

    const apiClientRef = ref<
      Pick<
        ApiClient,
        | 'getEtapeEntrepriseDocuments'
        | 'getEntreprise'
        | 'deleteEntrepriseDocument'
        | 'getEntrepriseDocuments'
        | 'getFiscaliteEntreprise'
        | 'modifierEntreprise'
        | 'creerEntreprise'
        | 'creerEntrepriseDocument'
        | 'uploadTempDocument'
      >
    >({
      ...apiClient,
      modifierEntreprise: async entreprise => {
        try {
          await apiClient.modifierEntreprise(entreprise)
          store.dispatch(
            'messageAdd',
            {
              value: `l'entreprise a été modifiée`,
              type: 'success',
            },
            { root: true }
          )
        } catch (e) {
          console.error(e)
          store.dispatch(
            'messageAdd',
            {
              value: `Erreur lors de la modification de l'entreprise`,
              type: 'error',
            },
            { root: true }
          )
        }
      },
    })
    return () => (
      <>
        {entrepriseId.value ? (
          <PureEntreprise currentYear={anneeCourante} entrepriseId={entrepriseId.value} apiClient={apiClientRef.value} user={user.value} />
        ) : (
          <CaminoError couleur="error" message="Impossible d’afficher une entreprise sans identifiant" />
        )}
      </>
    )
  },
})

interface Props {
  entrepriseId: EntrepriseId
  apiClient: Pick<
    ApiClient,
    | 'getEtapeEntrepriseDocuments'
    | 'getEntreprise'
    | 'deleteEntrepriseDocument'
    | 'getEntrepriseDocuments'
    | 'getFiscaliteEntreprise'
    | 'modifierEntreprise'
    | 'creerEntreprise'
    | 'creerEntrepriseDocument'
    | 'uploadTempDocument'
  >
  user: User
  currentYear: CaminoAnnee
}

export const PureEntreprise = caminoDefineComponent<Props>(['entrepriseId', 'user', 'apiClient', 'currentYear'], props => {
  watch(
    () => props.entrepriseId,
    async _newEntrepriseId => {
      await refreshEntreprise()
    }
  )
  const annees = computed(() => {
    const anneeDepart = 2021

    let anneeAAjouter = anneeDepart
    const annees = [toCaminoAnnee(anneeAAjouter.toString())]
    while (annees[annees.length - 1] !== props.currentYear) {
      anneeAAjouter++
      annees.push(toCaminoAnnee(anneeAAjouter.toString()))
    }
    return annees
  })

  const entreprise = ref<AsyncData<EntrepriseType>>({ status: 'LOADING' })
  const utilisateursLignes = computed(() => {
    if (entreprise.value.status === 'LOADED') {
      return utilisateursLignesBuild(entreprise.value.value.utilisateurs)
    }
    return []
  })
  const editPopup = ref(false)

  const fiscaliteVisible = computed<boolean>(() => {
    if (entreprise.value.status === 'LOADED') {
      return fiscaliteVisibleFunc(props.user, props.entrepriseId, [
        ...entreprise.value.value.titulaireTitres.map(({ typeId }) => ({ type_id: typeId })),
        ...entreprise.value.value.amodiataireTitres.map(({ typeId }) => ({ type_id: typeId })),
      ])
    }
    return false
  })

  const refreshEntreprise = async () => {
    try {
      entreprise.value = { status: 'LOADING' }
      entreprise.value = { status: 'LOADED', value: await props.apiClient.getEntreprise(props.entrepriseId) }
    } catch (e: any) {
      entreprise.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }
  onMounted(async () => {
    await refreshEntreprise()
  })
  return () => (
    <LoadingElement
      data={entreprise.value}
      renderItem={item => (
        <div>
          <h5>Entreprise</h5>
          <h1>{item.nom}</h1>
          <Card
            class="mb-xxl"
            title={() => <span class="cap-first"> Profil </span>}
            buttons={() => {
              if (canEditEntreprise(props.user, props.entrepriseId)) {
                return <ButtonIcon class="btn py-s px-m" onClick={() => (editPopup.value = !editPopup.value)} title="Modifier l’entreprise" icon="pencil" />
              } else {
                return null
              }
            }}
            content={() => (
              <>
                <div class="px-m pt-m border-b-s">
                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Siren</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p>{item.legalSiren}</p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Forme juridique</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p>{item.legalForme}</p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>
                        Établissement
                        {(item.etablissements?.length ?? 0) > 1 ? 's' : ''}
                      </h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <ul class="list-sans">
                        {item.etablissements?.map(e => (
                          <li key={e.id}>
                            <h6 class="inline-block">{dateFormat(e.dateDebut)}</h6>: {e.nom}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Adresse</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p>
                        {item.adresse}
                        <br />
                        {item.codePostal} {item.commune}
                      </p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Téléphone</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p class="word-break">
                        <span>{item.telephone ?? '–'}</span>
                      </p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Email</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p class="word-break">
                        {item.email ? (
                          <a href={`mailto:${item.email}`} class="btn small bold py-xs px-s rnd">
                            {item.email}
                          </a>
                        ) : (
                          <span>–</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Site</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p class="word-break">
                        {item.url ? (
                          <a href={item.url} class="btn small bold py-xs px-s rnd">
                            {item.url}
                          </a>
                        ) : (
                          <span>–</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Archivée</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p>{item.archive ? 'Oui' : 'Non'}</p>
                    </div>
                  </div>
                </div>
                {canSeeEntrepriseDocuments(props.user, props.entrepriseId) ? <EntrepriseDocuments user={props.user} apiClient={props.apiClient} entrepriseId={props.entrepriseId} /> : null}
              </>
            )}
          />
          {fiscaliteVisible.value ? (
            <div class="mb-xxl">
              <div class="line-neutral width-full mb-xxl" />
              <h3>Fiscalité</h3>
              <EntrepriseFiscalite
                getFiscaliteEntreprise={async (annee: CaminoAnnee) => {
                  if (item.id) {
                    return await props.apiClient.getFiscaliteEntreprise(annee, item.id)
                  }
                  return { redevanceCommunale: 0, redevanceDepartementale: 0 }
                }}
                anneeCourante={annees.value[annees.value.length - 1]}
                annees={annees.value}
              />
            </div>
          ) : null}

          {item.utilisateurs.length ? (
            <div class="mb-xxl">
              <div class="line-neutral width-full mb-xxl" />
              <TableAuto caption="Utilisateurs" class="width-full-p" columns={utilisateursColonnes} rows={utilisateursLignes.value} />
            </div>
          ) : null}

          {item.titulaireTitres.length ? (
            <div class="mb-xxl">
              <div class="line-neutral width-full mb-xxl" />
              <TitresTable caption="Titres miniers et autorisations" titres={item.titulaireTitres} user={props.user} />
            </div>
          ) : null}

          {item.amodiataireTitres.length ? (
            <div class="mb-xxl">
              <div class="line width-full my-xxl" />
              <TitresTable caption="Titres miniers et autorisations (amodiataire)" titres={item.amodiataireTitres} user={props.user} />
            </div>
          ) : null}
          {editPopup.value ? (
            <EntrepriseEditPopup
              apiClient={{
                ...props.apiClient,
                modifierEntreprise: async entreprise => {
                  await props.apiClient.modifierEntreprise(entreprise)
                  await refreshEntreprise()
                },
              }}
              user={props.user}
              entreprise={item}
              close={() => (editPopup.value = !editPopup.value)}
            />
          ) : null}
        </div>
      )}
    />
  )
})
