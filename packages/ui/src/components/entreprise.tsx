import { Card } from './_ui/card'
import { EntrepriseEditPopup } from './entreprise/edit-popup'
import { dateFormat, CaminoAnnee, getCurrentAnnee, toCaminoAnnee } from 'camino-common/src/date'
import { EntrepriseFiscalite } from './entreprise/entreprise-fiscalite'

import { User } from 'camino-common/src/roles'
import { computed, onMounted, watch, defineComponent, ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import { canEditEntreprise, canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises'
import { EntrepriseType, newEntrepriseId, EntrepriseId, Entreprise as CommonEntreprise } from 'camino-common/src/entreprise'
import { EntrepriseDocuments } from './entreprise/entreprise-documents'
import { AsyncData } from '../api/client-rest'
import { LoadingElement } from './_ui/functional-loader'
import { CaminoError } from './error'
import { ButtonIcon } from './_ui/button-icon'
import { ApiClient, apiClient } from '@/api/api-client'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { userKey, entreprisesKey } from '@/moi'
import { DsfrLink } from './_ui/dsfr-button'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'

export const Entreprise = defineComponent({
  setup() {
    const vueRoute = useRoute()
    const entrepriseId = ref<EntrepriseId | undefined>(newEntrepriseId(vueRoute.params.id.toString()))
    const user = inject(userKey)
    const entreprises = inject(entreprisesKey, ref([]))

    watch(
      () => vueRoute.params.id,
      newRoute => {
        if (vueRoute.name === 'entreprise' && isNotNullNorUndefined(newRoute)) {
          const newEid = newEntrepriseId(vueRoute.params.id.toString())
          if (entrepriseId.value !== newEid) {
            entrepriseId.value = newEid
          }
        }
      }
    )
    const anneeCourante = getCurrentAnnee()

    return () => (
      <>
        {entrepriseId.value ? (
          <PureEntreprise currentYear={anneeCourante} entrepriseId={entrepriseId.value} apiClient={apiClient} user={user} entreprises={entreprises.value} />
        ) : (
          <CaminoError couleur="error" message="Impossible d’afficher une entreprise sans identifiant" />
        )}
      </>
    )
  },
})

interface Props {
  entrepriseId: EntrepriseId
  entreprises: CommonEntreprise[]
  apiClient: Pick<
    ApiClient,
    'getEntreprise' | 'deleteEntrepriseDocument' | 'getEntrepriseDocuments' | 'getFiscaliteEntreprise' | 'modifierEntreprise' | 'creerEntreprise' | 'creerEntrepriseDocument' | 'uploadTempDocument'
  >
  user: User
  currentYear: CaminoAnnee
}

export const PureEntreprise = defineComponent<Props>(props => {
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
  const editPopup = ref(false)

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
            title={() => <span> Profil </span>}
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
                      <p>{item.legal_siren}</p>
                    </div>
                  </div>

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Forme juridique</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p>{item.legal_forme}</p>
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
                            <h6 class="inline-block">{dateFormat(e.date_debut)}</h6>: {e.nom}
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
                        {item.code_postal} {item.commune}
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
                        {isNotNullNorUndefined(item.email) ? (
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
                        {isNotNullNorUndefined(item.url) ? (
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

                  {canReadUtilisateurs(props.user) ? (
                    <div class="tablet-blobs">
                      <div class="tablet-blob-1-4">
                        <h5>Utilisateurs de l'entreprise</h5>
                      </div>
                      <div class="tablet-blob-3-4">
                        <p>
                          <DsfrLink to={{ name: 'utilisateurs', query: { entreprisesIds: props.entrepriseId } }} icon={null} title="Voir les utilisateurs" disabled={false} />
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-4">
                      <h5>Titres de l'entreprise</h5>
                    </div>
                    <div class="tablet-blob-3-4">
                      <p>
                        <DsfrLink to={{ name: 'titres', query: { entreprisesIds: props.entrepriseId, vueId: 'table' } }} icon={null} title="Voir les titres" disabled={false} />
                      </p>
                    </div>
                  </div>
                </div>
                {canSeeEntrepriseDocuments(props.user, props.entrepriseId) ? <EntrepriseDocuments user={props.user} apiClient={props.apiClient} entrepriseId={props.entrepriseId} /> : null}
              </>
            )}
          />
          <EntrepriseFiscalite
            getFiscaliteEntreprise={async (annee: CaminoAnnee) => {
              return props.apiClient.getFiscaliteEntreprise(annee, props.entrepriseId)
            }}
            anneeCourante={annees.value[annees.value.length - 1]}
            annees={annees.value}
          />

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

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureEntreprise.props = ['entrepriseId', 'entreprises', 'user', 'apiClient', 'currentYear']
