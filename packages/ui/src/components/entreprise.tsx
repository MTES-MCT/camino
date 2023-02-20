import Accordion from './_ui/accordion.vue'
import Loader from './_ui/loader.vue'
import { TableAuto } from './_ui/table-auto'
import { TitresTable } from './titres/table'
import EntrepriseEditPopup from './entreprise/edit-popup.vue'
import DocumentAddButton from './document/button-add.vue'
import Documents from './documents/list.vue'
import { dateFormat } from '../utils/index'
import EntrepriseFiscalite from './entreprise/pure-entreprise-fiscalite.vue'

import {
  utilisateursColonnes,
  utilisateursLignesBuild
} from './utilisateurs/table'
import {
  Fiscalite,
  fiscaliteVisible as fiscaliteVisibleFunc
} from 'camino-common/src/fiscalite'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isSuper,
  User
} from 'camino-common/src/roles'
import { Icon } from './_ui/icon'
import {
  CaminoAnnee,
  getCurrentAnnee,
  toCaminoAnnee
} from 'camino-common/src/date'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  watch,
  defineComponent
} from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { fetchWithJson } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { canEditEntreprise } from 'camino-common/src/permissions/entreprises'
import { Utilisateur } from '@/api/api-client'
import { TitreEntreprise } from './titres/table-utils'

export type EntrepriseType = {
  id: EntrepriseId
  nom: string
  telephone: string
  email: string
  legalSiren: string
  legalForme: string
  adresse: string
  codePostal: string
  commune: string
  url: string
  documents: any[]
  archive: boolean
  titulaireTitres: TitreEntreprise[]
  amodiataireTitres: TitreEntreprise[]
  utilisateurs: Utilisateur[]
  etablissements: any[]
}

export const Entreprise = defineComponent({
  setup() {
    const store = useStore()
    const vueRoute = useRoute()
    const entreprise = computed<EntrepriseType>(
      () => store.state.entreprise.element
    )
    const user = computed<User>(() => store.state.user.element)
    const getFiscaliteEntreprise = async (
      annee: CaminoAnnee
    ): Promise<Fiscalite> =>
      fetchWithJson(CaminoRestRoutes.fiscaliteEntreprise, {
        annee,
        entrepriseId: entreprise.value.id
      })

    const get = async () => {
      await store.dispatch('entreprise/get', vueRoute.params.id)
    }

    watch(
      () => vueRoute.params.id,
      newRoute => {
        if (vueRoute.name === 'entreprise' && newRoute) {
          get()
        }
      }
    )
    watch(
      () => user.value,
      _newUser => get()
    )

    onMounted(async () => {
      await get()
    })

    onBeforeUnmount(() => {
      store.commit('entreprise/reset')
    })

    // TODO 2023-02-16: redonner la responsabilité au composant de gérer sa propre popup, et bouger ça dans le composant Pure
    const editPopupOpen = () => {
      const entrepriseEdit = {
        id: entreprise.value.id,
        telephone: entreprise.value.telephone,
        url: entreprise.value.url,
        email: entreprise.value.email,
        archive: entreprise.value.archive
      }

      store.commit('popupOpen', {
        component: EntrepriseEditPopup,
        props: {
          entreprise: entrepriseEdit
        }
      })
    }
    const anneeCourante = getCurrentAnnee()

    return () => (
      <PureEntreprise
        currentYear={anneeCourante}
        editPopupOpen={editPopupOpen}
        entreprise={entreprise.value}
        getFiscaliteEntreprise={getFiscaliteEntreprise}
        user={user.value}
      />
    )
  }
})

interface Props {
  entreprise?: EntrepriseType
  getFiscaliteEntreprise: (annee: CaminoAnnee) => Promise<Fiscalite>
  user: User
  editPopupOpen: () => void
  currentYear: CaminoAnnee
}
// FIXME SPLIT with PureEntreprise and TEST
export const PureEntreprise = defineComponent<Props>({
  props: [
    'entreprise',
    'getFiscaliteEntreprise',
    'user',
    'editPopupOpen',
    'currentYear'
  ] as unknown as undefined,
  setup(props) {
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

    const nom = computed(
      () => (props.entreprise && props.entreprise.nom) ?? '-'
    )
    const utilisateurs = computed(() => props.entreprise?.utilisateurs ?? [])
    const utilisateursLignes = computed(() =>
      utilisateursLignesBuild(utilisateurs.value)
    )
    const titulaireTitres = computed(
      () => props.entreprise?.titulaireTitres ?? []
    )
    const amodiataireTitres = computed(
      () => props.entreprise?.amodiataireTitres ?? []
    )
    const loaded = computed(() => !!props.entreprise)
    const documentNew = computed(() => ({
      entrepriseId: props.entreprise?.id,
      entreprisesLecture: false,
      publicLecture: false,
      fichier: null,
      fichierNouveau: null,
      fichierTypeId: null,
      typeId: ''
    }))

    const route = computed(() => ({
      id: props.entreprise?.id,
      name: 'entreprise'
    }))
    const fiscaliteVisible = computed(() =>
      fiscaliteVisibleFunc(props.user, props.entreprise?.id, [
        ...titulaireTitres.value,
        ...amodiataireTitres.value
      ])
    )

    const canDeleteDocument = (
      entreprise: EntrepriseType,
      user: User
    ): boolean => {
      return (
        canEditEntreprise(user, entreprise.id) &&
        (isSuper(user) ||
          isAdministrationAdmin(user) ||
          isAdministrationEditeur(user))
      )
    }

    return () => (
      <>
        {loaded.value ? (
          <div>
            <h5>Entreprise</h5>
            <h1>{nom.value}</h1>
            <Accordion class="mb-xxl" slotSub={true} slotButtons={true}>
              {{
                title: () => <span class="cap-first"> Profil </span>,
                buttons: () => {
                  if (canEditEntreprise(props.user, props.entreprise?.id)) {
                    return (
                      <>
                        {' '}
                        <DocumentAddButton
                          route={route.value}
                          document={documentNew.value}
                          title={nom.value}
                          repertoire="entreprises"
                          class="btn py-s px-m mr-px"
                        />
                        <button
                          class="btn py-s px-m"
                          onClick={props.editPopupOpen}
                        >
                          <Icon size="M" name="pencil" />
                        </button>
                      </>
                    )
                  } else {
                    return null
                  }
                },
                sub: () => (
                  <>
                    <div class="px-m pt-m border-b-s">
                      <div class="tablet-blobs">
                        <div class="tablet-blob-1-4">
                          <h5>Siren</h5>
                        </div>
                        <div class="tablet-blob-3-4">
                          <p>{props.entreprise?.legalSiren}</p>
                        </div>
                      </div>

                      <div class="tablet-blobs">
                        <div class="tablet-blob-1-4">
                          <h5>Forme juridique</h5>
                        </div>
                        <div class="tablet-blob-3-4">
                          <p>{props.entreprise?.legalForme}</p>
                        </div>
                      </div>

                      <div class="tablet-blobs">
                        <div class="tablet-blob-1-4">
                          <h5>
                            Établissement
                            {(props.entreprise?.etablissements?.length ?? 0) > 1
                              ? 's'
                              : ''}
                          </h5>
                        </div>
                        <div class="tablet-blob-3-4">
                          <ul class="list-sans">
                            {props.entreprise?.etablissements?.map(e => (
                              <li key={e.id}>
                                <h6 class="inline-block">
                                  {dateFormat(e.dateDebut)}
                                </h6>
                                : {e.nom}
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
                            {props.entreprise?.adresse}
                            <br />
                            {props.entreprise?.codePostal}
                            {props.entreprise?.commune}
                          </p>
                        </div>
                      </div>

                      <div class="tablet-blobs">
                        <div class="tablet-blob-1-4">
                          <h5>Téléphone</h5>
                        </div>
                        <div class="tablet-blob-3-4">
                          <p class="word-break">
                            <span>{props.entreprise?.telephone ?? '–'}</span>
                          </p>
                        </div>
                      </div>

                      <div class="tablet-blobs">
                        <div class="tablet-blob-1-4">
                          <h5>Email</h5>
                        </div>
                        <div class="tablet-blob-3-4">
                          <p class="word-break">
                            {props.entreprise?.email ? (
                              <a
                                href={`mailto:${props.entreprise.email}`}
                                class="btn small bold py-xs px-s rnd"
                              >
                                {props.entreprise.email}
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
                            {props.entreprise?.url ? (
                              <a
                                href={props.entreprise.url}
                                class="btn small bold py-xs px-s rnd"
                              >
                                {props.entreprise.url}
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
                          <p>{props.entreprise?.archive ? 'Oui' : 'Non'}</p>
                        </div>
                      </div>
                    </div>

                    {props.entreprise?.documents.length ? (
                      <div>
                        <h4 class="px-m pt mb-0">Documents</h4>
                        <Documents
                          boutonModification={canEditEntreprise(
                            props.user,
                            props.entreprise.id
                          )}
                          boutonSuppression={canDeleteDocument(
                            props.entreprise,
                            props.user
                          )}
                          route={route.value}
                          documents={props.entreprise.documents}
                          etiquette={canEditEntreprise(
                            props.user,
                            props.entreprise.id
                          )}
                          parentId={props.entreprise.id}
                          title={nom.value}
                          repertoire="entreprises"
                          class="px-m"
                        />
                      </div>
                    ) : null}
                  </>
                )
              }}
            </Accordion>
            {fiscaliteVisible.value ? (
              <div class="mb-xxl">
                <div class="line-neutral width-full mb-xxl" />
                <h3>Fiscalité</h3>
                <EntrepriseFiscalite
                  getFiscaliteEntreprise={props.getFiscaliteEntreprise}
                  anneeCourante={annees.value[annees.value.length - 1]}
                  annees={annees.value}
                />
              </div>
            ) : null}

            {utilisateurs.value && utilisateurs.value.length ? (
              <div class="mb-xxl">
                <div class="line-neutral width-full mb-xxl" />
                <h3>Utilisateurs</h3>
                <div class="line width-full" />
                <TableAuto
                  class="width-full-p"
                  columns={utilisateursColonnes}
                  rows={utilisateursLignes.value}
                />
              </div>
            ) : null}

            {titulaireTitres.value && titulaireTitres.value.length ? (
              <div class="mb-xxl">
                <div class="line-neutral width-full mb-xxl" />
                <h3>Titres miniers et autorisations</h3>
                <div class="line width-full" />
                <TitresTable titres={titulaireTitres.value} user={props.user} />
              </div>
            ) : null}

            {amodiataireTitres.value && amodiataireTitres.value.length ? (
              <div class="mb-xxl">
                <div class="line width-full my-xxl" />
                <h3>Titres miniers et autorisations (amodiataire)</h3>
                <div class="line width-full" />
                <TitresTable
                  titres={amodiataireTitres.value}
                  user={props.user}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <Loader />
        )}
      </>
    )
  }
})
