import { defineComponent, onMounted, ref } from 'vue'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { User } from 'camino-common/src/roles'
import { Entreprise, EntrepriseId, TitreEntreprise } from 'camino-common/src/entreprise'
import { titresColonnes, titresLignesBuild } from '@/components/titres/table-utils'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { DashboardApiClient } from './dashboard-api-client'
import { PageContentHeader } from '../_common/page-header-content'
import { DemandeTitreButton } from '../_common/demande-titre-button'
import { Alert } from '../_ui/alert'
import { DsfrLink } from '../_ui/dsfr-button'

interface Props {
  user: User
  entrepriseIds: EntrepriseId[]
  // TODO 2022-03-22: type the graphql
  apiClient: Pick<DashboardApiClient, 'getEntreprisesTitres'>
  displayActivites: boolean
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

export const PureEntrepriseDashboard = defineComponent<Props>(props => {
  const data = ref<AsyncData<TitreEntreprise[]>>({ status: 'LOADING' })

  const entreprisesIndex = props.allEntreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

  const entrepriseTitres = (entreprises: TitreEntreprise[]): TableRow[] => titresLignesBuild(entreprises, props.displayActivites, entreprisesIndex)

  const columns = titresColonnes.filter(({ id }) => (props.displayActivites ? true : id !== 'activites'))

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
      <PageContentHeader nom="Mes Titres" download={null} renderButton={() => <DemandeTitreButton user={props.user} />} />
      <LoadingElement
        data={data.value}
        renderItem={item => {
          return (
            <>
              {fiscaliteVisibleForAtLeastOneEntreprise(props.user, props.entrepriseIds, item) ? (
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
                                item.map(({ typeId }) => ({ type_id: typeId }))
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
              <TableAuto class="fr-table--no-caption" caption="Vos titres" columns={columns} rows={entrepriseTitres(item)} initialSort={{ colonne: 'statut', ordre: 'asc' }} />
            </>
          )
        }}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureEntrepriseDashboard.props = ['user', 'entreprises', 'apiClient', 'displayActivites', 'allEntreprises']
