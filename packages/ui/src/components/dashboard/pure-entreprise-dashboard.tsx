import { defineComponent, onMounted, ref } from 'vue'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { User } from 'camino-common/src/roles'
import { Entreprise, EntrepriseId, TitreEntreprise } from 'camino-common/src/entreprise'
import { titresColonnes, titresLignesBuild } from '@/components/titres/table-utils'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'
import { DashboardApiClient } from './dashboard-api-client'
import { PageContentHeader } from '../_common/page-header-content'
import { DemandeTitreButton } from '../_common/demande-titre-button'
import { Alert } from '../_ui/alert'
import { DsfrLink } from '../_ui/dsfr-button'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { TitresStatutIds, TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { DsfrAccordion } from '../_ui/dsfr-accordion'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { TitresTypesIds } from 'camino-common/src/static/titresTypes'

interface Props {
  user: User
  entrepriseIds: EntrepriseId[]
  // TODO 2022-03-22: type the graphql
  apiClient: Pick<DashboardApiClient, 'getEntreprisesTitres'>
  allEntreprises: Entreprise[]
}

const fiscaliteVisibleForAtLeastOneEntreprise = (user: User, entrepriseIds: EntrepriseId[], items: TitreEntreprise[]) => {
  return entrepriseIds.some(id =>
    fiscaliteVisible(
      user,
      id,
      items.map(({ typeId }) => ({ type_id: typeId }))
    )
  )
}

const nombreActivitesASaisir = (items: TitreEntreprise[]): number => items.reduce((acc, item) => acc + (item.activitesAbsentes ?? 0) + (item.activitesEnConstruction ?? 0), 0)

const statutsValideEtEnCours: TitreStatutId[] = [TitresStatutIds.DemandeInitiale, TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire] as const
const titresValidesEtEnCours = (titres: TitreEntreprise[]): TitreEntreprise[] => titres.filter(titre => statutsValideEtEnCours.includes(titre.titreStatutId))
const autresTitres = (titres: TitreEntreprise[]): TitreEntreprise[] => titres.filter(titre => !statutsValideEtEnCours.includes(titre.titreStatutId))
export const PureEntrepriseDashboard = defineComponent<Props>(props => {
  const data = ref<AsyncData<TitreEntreprise[]>>({ status: 'LOADING' })

  const entreprisesIndex = props.allEntreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

  const entrepriseTitres = (entreprises: TitreEntreprise[]): TableRow[] => titresLignesBuild(entreprises, false, entreprisesIndex)

  const columns = titresColonnes.filter(({ id }) => {
    if (id === 'activites' || id === 'departements' || id === 'regions') {
      return false
    }
    if (id === 'titulaires' && props.entrepriseIds.length === 1) {
      return false
    }
    return true
  })

  onMounted(async () => {
    try {
      const entreprises = await props.apiClient.getEntreprisesTitres(props.entrepriseIds)
      data.value = { status: 'LOADED', value: entreprises }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  })

  return () => (
    <div>
      <PageContentHeader
        nom={props.entrepriseIds.length === 1 ? `Tableau de bord ${entreprisesIndex[props.entrepriseIds[0]]}` : 'Tableau de bord entreprises'}
        download={null}
        renderButton={() => <DemandeTitreButton user={props.user} />}
      />
      <LoadingElement
        data={data.value}
        renderItem={titres => {
          return (
            <>
              {titres.length === 0 ? (
                <Alert
                  type="info"
                  title="Vous n'avez pour le moment aucun titre"
                  description={
                    <>
                      {TitresTypesIds.some(titreTypeId => canCreateTitre(props.user, titreTypeId)) ? (
                        <>
                          Vous pouvez <DsfrLink to={{ name: 'titreCreation', params: {} }} icon={null} disabled={false} title="demander un titre" />.
                        </>
                      ) : null}

                      <p>Si vous pensez qu'il s'agit d'une erreur, contactez votre admninistration instructrice afin que les titres soient rajoutés à Camino.</p>
                    </>
                  }
                />
              ) : null}
              {canReadActivites(props.user) && nombreActivitesASaisir(titres) > 0 ? (
                <Alert
                  type="warning"
                  title={`Vous avez ${nombreActivitesASaisir(titres)} activité(s) à remplir`}
                  description={
                    <>
                      <DsfrLink
                        disabled={false}
                        icon={null}
                        to={{ name: 'activites', params: {}, query: { activiteStatutsIds: ACTIVITES_STATUTS_IDS.ABSENT } }}
                        title="Voir toutes les activités non déposées"
                      />
                    </>
                  }
                />
              ) : null}
              {fiscaliteVisibleForAtLeastOneEntreprise(props.user, props.entrepriseIds, titres) ? (
                <Alert
                  type="info"
                  title="Découvrez l'estimation de votre fiscalité minière."
                  description={
                    <>
                      {props.entrepriseIds.length === 1 ? (
                        <>
                          <DsfrLink
                            disabled={false}
                            icon={null}
                            to={{ name: 'entreprise', params: { id: props.entrepriseIds[0] } }}
                            label={entreprisesIndex[props.entrepriseIds[0]]}
                            title={`Page de l’entreprise ${entreprisesIndex[props.entrepriseIds[0]]}`}
                          />
                        </>
                      ) : (
                        <>
                          {props.entrepriseIds
                            .filter(entrepriseId =>
                              fiscaliteVisible(
                                props.user,
                                entrepriseId,
                                titres.map(({ typeId }) => ({ type_id: typeId }))
                              )
                            )
                            .map(id => (
                              <DsfrLink
                                disabled={false}
                                class="fr-mr-1w"
                                icon={null}
                                to={{ name: 'entreprise', params: { id } }}
                                label={entreprisesIndex[id]}
                                title={`Page de l’entreprise ${entreprisesIndex[id]}`}
                              />
                            ))}
                        </>
                      )}
                    </>
                  }
                />
              ) : null}
              {titresValidesEtEnCours(titres).length > 0 ? (
                <TableSimple caption={{ value: 'Titres en cours et valides', visible: true }} columns={columns} rows={entrepriseTitres(titresValidesEtEnCours(titres))} />
              ) : null}
              {autresTitres(titres).length > 0 ? (
                <DsfrAccordion
                  expandedByDefault={titresValidesEtEnCours(titres).length === 0}
                  title="Autres titres"
                  content={<TableSimple caption={{ value: 'Autres titres', visible: false }} columns={columns} rows={entrepriseTitres(autresTitres(titres))} />}
                />
              ) : null}
            </>
          )
        }}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureEntrepriseDashboard.props = ['user', 'entrepriseIds', 'apiClient', 'allEntreprises']
