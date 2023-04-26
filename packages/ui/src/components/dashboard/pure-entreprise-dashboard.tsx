import { onMounted, ref } from 'vue'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { User } from 'camino-common/src/roles'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { TitreEntreprise, titresColonnes, titresLignesBuild } from '@/components/titres/table-utils'
import { Icon } from '@/components/_ui/icon'
import { useRouter } from 'vue-router'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export interface Props {
  user: User
  entreprises: Pick<Entreprise, 'id' | 'nom'>[]
  // TODO 2022-03-22: type the graphql
  getEntreprisesTitres: () => Promise<TitreEntreprise[]>
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

export const PureEntrepriseDashboard = caminoDefineComponent<Props>(['user', 'entreprises', 'getEntreprisesTitres', 'displayActivites'], props => {
  const data = ref<AsyncData<TitreEntreprise[]>>({ status: 'LOADING' })

  const entrepriseTitres = (entreprises: TitreEntreprise[]): TableRow[] => titresLignesBuild(entreprises, props.displayActivites)
  const entrepriseUrl = (entrepriseId: EntrepriseId) => `/entreprises/${entrepriseId}`

  const columns = titresColonnes.filter(({ id }) => (props.displayActivites ? true : id !== 'activites'))

  const router = useRouter()

  const titreDemandeOpen = () => {
    router.push({ name: 'titre-creation' })
  }

  onMounted(async () => {
    try {
      const entreprises = await props.getEntreprisesTitres()
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
      <div class="desktop-blobs">
        <div class="desktop-blob-2-3">
          <h1 class="mt-xs mb-m">Mes Titres</h1>
        </div>

        <div class="desktop-blob-1-3">
          <button class="btn btn-primary small flex" onClick={titreDemandeOpen}>
            <span class="mt-xxs">Demander un titre…</span>
            <Icon name="plus" size="M" class="flex-right" />
          </button>
        </div>
      </div>

      <LoadingElement
        data={data.value}
        renderItem={item => {
          return (
            <>
              {fiscaliteVisibleForAtLeastOneEntreprise(props.user, props.entreprises, item) ? (
                <div class="p-s bg-info color-bg mb">
                  Découvrez l'estimation de votre fiscalité minière pour
                  {props.entreprises.length === 1 ? (
                    <>
                      <router-link to={entrepriseUrl(props.entreprises[0].id)} target="_blank" class="p-s color-bg mb">
                        {props.entreprises[0].nom}
                      </router-link>
                    </>
                  ) : (
                    <>
                      {' '}
                      vos entreprises :
                      {props.entreprises
                        .filter(entreprise =>
                          fiscaliteVisible(
                            props.user,
                            entreprise.id,
                            item.map(({ typeId }) => ({ type_id: typeId }))
                          )
                        )
                        .map(entreprise => (
                          <router-link to={entrepriseUrl(entreprise.id)} target="_blank" class="p-s color-bg mb">
                            {entreprise.nom}
                          </router-link>
                        ))}
                    </>
                  )}
                </div>
              ) : null}
              <TableAuto columns={columns} rows={entrepriseTitres(item)} initialSort={{ column: 'statut', order: 'asc' }} class="width-full-p" />
            </>
          )
        }}
      />
    </div>
  )
})
