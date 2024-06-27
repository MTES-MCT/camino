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
import { ApiClient, apiClient } from '@/api/api-client'
import { isNotNullNorUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { userKey, entreprisesKey } from '@/moi'
import { DsfrButtonIcon, DsfrLink } from './_ui/dsfr-button'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { Alert } from './_ui/alert'
import { LabelWithValue } from './_ui/label-with-value'
import { List } from './_ui/list'

export const Entreprise = defineComponent({
  setup() {
    const vueRoute = useRoute<'entreprise'>()
    const entrepriseId = ref<EntrepriseId | undefined>(newEntrepriseId(vueRoute.params.id))
    const user = inject(userKey)
    const entreprises = inject(entreprisesKey, ref([]))

    watch(
      () => vueRoute.params.id,
      newRoute => {
        if (vueRoute.name === 'entreprise' && isNotNullNorUndefined(newRoute)) {
          const newEid = newEntrepriseId(vueRoute.params.id)
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
          <Alert type="error" title="Impossible d’afficher une entreprise sans identifiant" small={true} />
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
          <DsfrLink to={{ name: 'entreprises', params: {} }} disabled={false} title="Entreprises" icon={null} />

          <div class="fr-grid-row fr-grid-row--top fr-mt-4w">
            <h1 class="fr-m-0">{item.nom}</h1>
            <div class="fr-m-0" style={{ marginLeft: 'auto !important', display: 'flex' }}>
              {canEditEntreprise(props.user, props.entrepriseId) ? (
                <DsfrButtonIcon onClick={() => (editPopup.value = !editPopup.value)} title="Modifier l’entreprise" icon="fr-icon-edit-line" buttonType="secondary" />
              ) : null}
            </div>
          </div>
          <div class="fr-pt-8w fr-pb-4w" style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
            <LabelWithValue title="Siren" text={item.legal_siren ?? ''} />
            <LabelWithValue title="Forme juridique" text={item.legal_forme ?? ''} />
            <LabelWithValue
              title={`Établissement${isNullOrUndefinedOrEmpty(item.etablissements) || item.etablissements.length === 1 ? '' : 's'}`}
              item={<List elements={item.etablissements.map(({ date_debut, nom }) => `${dateFormat(date_debut)} : ${nom}`)} />}
            />

            <LabelWithValue
              title="Adresse"
              item={
                <p>
                  {item.adresse}
                  <br />
                  {item.code_postal} {item.commune}
                </p>
              }
            />

            <LabelWithValue title="Téléphone" text={item.telephone ?? '−'} />

            <LabelWithValue title="Email" item={isNotNullNorUndefined(item.email) ? <DsfrLink disabled={false} href={`mailto:${item.email}`} icon={null} title={item.email} /> : <span>–</span>} />

            <LabelWithValue
              title="Site"
              item={isNotNullNorUndefined(item.url) ? <DsfrLink href={item.url} title={item.url} disabled={false} icon={null} target="_blank" rel="noopener noreferrer" /> : <span>–</span>}
            />

            <LabelWithValue title="Archivée" text={item.archive ? 'Oui' : 'Non'} />

            {canReadUtilisateurs(props.user) ? (
              <LabelWithValue
                title="Utilisateurs de l'entreprise"
                item={<DsfrLink to={{ name: 'utilisateurs', params: {}, query: { entreprisesIds: props.entrepriseId } }} icon={null} title="Voir les utilisateurs" disabled={false} />}
              />
            ) : null}

            <LabelWithValue
              title="Titres de l'entreprise"
              item={<DsfrLink to={{ name: 'titres', params: {}, query: { entreprisesIds: props.entrepriseId, vueId: 'table' } }} icon={null} title="Voir les titres" disabled={false} />}
            />
            {canSeeEntrepriseDocuments(props.user, props.entrepriseId) ? <EntrepriseDocuments user={props.user} apiClient={props.apiClient} entrepriseId={props.entrepriseId} /> : null}
          </div>

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
