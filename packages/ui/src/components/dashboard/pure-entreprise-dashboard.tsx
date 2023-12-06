import { onMounted, ref } from 'vue'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { User } from 'camino-common/src/roles'
import { Entreprise, EntrepriseId, TitreEntreprise } from 'camino-common/src/entreprise'
import { titresColonnes, titresLignesBuild } from '@/components/titres/table-utils'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DashboardApiClient } from './dashboard-api-client'
import { PageContentHeader } from '../_common/page-header-content'
import { DemandeTitreButton } from '../_common/demande-titre-button'
import { Alert } from '../_ui/alert'
import { DsfrLink } from '../_ui/dsfr-button'

export interface Props {
  user: User
  entreprises: Pick<Entreprise, 'id' | 'nom'>[]
  // TODO 2022-03-22: type the graphql
  apiClient: Pick<DashboardApiClient, 'getEntreprisesTitres'>
  displayActivites: boolean
}

const fiscaliteVisibleForAtLeastOneEntreprise = (user: User, entreprises: Pick<Entreprise, 'id' | 'nom'>[], items: TitreEntreprise[]) => {
  return entreprises.some(({ id }) =>
    fiscaliteVisible(
      user,
      id,
      items.map(({ typeId }) => ({ type_id: typeId }))
    )
  )
}

export const PureEntrepriseDashboard = caminoDefineComponent<Props>(['user', 'entreprises', 'apiClient', 'displayActivites'], props => {
  const data = ref<AsyncData<TitreEntreprise[]>>({ status: 'LOADING' })

  const entrepriseTitres = (entreprises: TitreEntreprise[]): TableRow[] => titresLignesBuild(entreprises, props.displayActivites)
  const entrepriseUrl = (entrepriseId: EntrepriseId) => `/entreprises/${entrepriseId}`

  const columns = titresColonnes.filter(({ id }) => (props.displayActivites ? true : id !== 'activites'))

  onMounted(async () => {
    try {
      const entreprises = await props.apiClient.getEntreprisesTitres(props.entreprises.map(({ id }) => id))
      data.value = { status: 'LOADED', value: entreprises }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  })

  return () => (
    <div class="dsfr">
      <PageContentHeader nom="Mes Titres" download={null} renderButton={() => <DemandeTitreButton user={props.user} />} />
      <LoadingElement
        data={data.value}
        renderItem={item => {
          return (
            <>
              {fiscaliteVisibleForAtLeastOneEntreprise(props.user, props.entreprises, item) ? (
                <Alert
                  type="info"
                  title="Découvrez l'estimation de votre fiscalité minière."
                  description={() => (
                    <>
                      {props.entreprises.length === 1 ? (
                        <>
                          <DsfrLink
                            disabled={false}
                            icon={null}
                            to={entrepriseUrl(props.entreprises[0].id)}
                            label={props.entreprises[0].nom}
                            title={`Page de l’entreprise ${props.entreprises[0].nom}`}
                          />
                        </>
                      ) : (
                        <>
                          {props.entreprises
                            .filter(entreprise =>
                              fiscaliteVisible(
                                props.user,
                                entreprise.id,
                                item.map(({ typeId }) => ({ type_id: typeId }))
                              )
                            )
                            .map(entreprise => (
                              <DsfrLink
                                disabled={false}
                                class="fr-mr-1w"
                                icon={null}
                                to={entrepriseUrl(entreprise.id)}
                                label={entreprise.nom}
                                title={`Page de l’entreprise ${props.entreprises[0].nom}`}
                              />
                            ))}
                        </>
                      )}
                    </>
                  )}
                />
              ) : null}
              <TableAuto caption={`Vos titres`} columns={columns} rows={entrepriseTitres(item)} initialSort={{ column: 'statut', order: 'asc' }} class="width-full-p" />
            </>
          )
        }}
      />
    </div>
  )
})
