import { Error } from './error'
import { apiClient, ApiClient, Utilisateur } from '@/api/api-client'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

import { Card } from './_ui/card'
import { TableAuto } from './_ui/table-auto'
import { LoadingElement } from './_ui/functional-loader'
import { Permissions } from './administration/permissions'
import { ActivitesTypesEmails } from './administration/activites-types-emails'

import { utilisateursColonnes, utilisateursLignesBuild } from './utilisateurs/table'
import { ADMINISTRATION_TYPES, Administrations, AdministrationId, Administration as Adm, AdministrationType, isAdministrationId } from 'camino-common/src/static/administrations'
import { isSuper, User } from 'camino-common/src/roles'
import { canReadActivitesTypesEmails } from 'camino-common/src/permissions/administrations'
import { Departement, Departements } from 'camino-common/src/static/departement'
import { Region, Regions } from 'camino-common/src/static/region'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { AsyncData } from '@/api/client-rest'
import { ActiviteTypeEmail } from './administration/administration-api-client'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export const Administration = defineComponent(() => {
  const store = useStore()
  const route = useRoute()

  const user = computed<User>(() => store.state.user.element)

  const administrationId = computed<AdministrationId | null>(() => {
    if (isAdministrationId(route.params.id)) {
      return route.params.id
    }
    return null
  })
  return () => (
    <>
      {administrationId.value ? <PureAdministration administrationId={administrationId.value} user={user.value} apiClient={apiClient} /> : <Error message="Administration inconnue" couleur="error" />}
    </>
  )
})

interface Props {
  administrationId: AdministrationId
  user: User
  apiClient: Pick<
    ApiClient,
    'administrationActivitesTypesEmails' | 'administrationUtilisateurs' | 'administrationMetas' | 'administrationActiviteTypeEmailUpdate' | 'administrationActiviteTypeEmailDelete'
  >
}
export const PureAdministration = caminoDefineComponent<Props>(['administrationId', 'user', 'apiClient'], props => {
  const administration = computed<Adm>(() => Administrations[props.administrationId])
  const type = computed<AdministrationType>(() => ADMINISTRATION_TYPES[administration.value.typeId])
  const departement = computed<Departement | undefined>(() => {
    return administration.value.departementId ? Departements[administration.value.departementId] : undefined
  })
  const region = computed<Region | undefined>(() => {
    return administration.value.regionId ? Regions[administration.value.regionId] : undefined
  })
  const activitesTypesEmails = ref<AsyncData<ActiviteTypeEmail[]>>({
    status: 'LOADING',
  })
  const utilisateurs = ref<AsyncData<Utilisateur[]>>({ status: 'LOADING' })

  const loadActivitesTypesEmails = async () => {
    if (canReadActivitesTypesEmails(props.user, props.administrationId)) {
      activitesTypesEmails.value = {
        status: 'LOADING',
      }
      try {
        activitesTypesEmails.value = {
          status: 'LOADED',
          value: await props.apiClient.administrationActivitesTypesEmails(props.administrationId),
        }
      } catch (e: any) {
        console.error('error', e)
        activitesTypesEmails.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }
  onMounted(async () => {
    await loadActivitesTypesEmails()
    try {
      utilisateurs.value = {
        status: 'LOADED',
        value: await props.apiClient.administrationUtilisateurs(props.administrationId),
      }
    } catch (e: any) {
      console.error('error', e)
      utilisateurs.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })
  return () => (
    <div>
      <h5>Administration</h5>
      <h1>{administration.value.abreviation}</h1>
      <Card
        class="mb-xxl"
        title={() => <span class="cap-first">{administration.value.nom}</span>}
        content={() => (
          <div class="px-m pt-m border-b-s">
            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Type</h5>
              </div>
              <div class="tablet-blob-3-4">
                <p class="word-break">{type.value.nom}</p>
              </div>
            </div>

            {administration.value.service ? (
              <div class="tablet-blobs">
                <div class="tablet-blob-1-4">
                  <h5>Service</h5>
                </div>
                <div class="tablet-blob-3-4">
                  <p class="word-break">{administration.value.service}</p>
                </div>
              </div>
            ) : null}

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Adresse</h5>
              </div>
              <div class="tablet-blob-3-4">
                <p>
                  {administration.value.adresse1}
                  {administration.value.adresse2 ? (
                    <span>
                      <br />
                      {administration.value.adresse2}
                    </span>
                  ) : null}
                  <br />
                  {administration.value.codePostal}
                  {administration.value.commune}
                </p>
              </div>
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Téléphone</h5>
              </div>
              <div class="tablet-blob-3-4">
                <p class="word-break">
                  <span>{administration.value.telephone ?? '–'}</span>
                </p>
              </div>
            </div>

            <div class="tablet-blobs">
              <div class="tablet-blob-1-4">
                <h5>Email</h5>
              </div>
              <div class="tablet-blob-3-4">
                <p class="word-break">
                  {administration.value.email ? (
                    <a href={`mailto:${administration.value.email}`} class="btn small bold py-xs px-s rnd">
                      {administration.value.email}
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
                  {administration.value.url ? (
                    <a href={administration.value.url} class="btn small bold py-xs px-s rnd">
                      {administration.value.url}
                    </a>
                  ) : (
                    <span>–</span>
                  )}
                </p>
              </div>
            </div>

            {departement.value ? (
              <div class="tablet-blobs">
                <div class="tablet-blob-1-4">
                  <h5>Département</h5>
                </div>
                <div class="tablet-blob-3-4">
                  <p>{departement.value?.nom}</p>
                </div>
              </div>
            ) : null}

            {region.value ? (
              <div class="tablet-blobs">
                <div class="tablet-blob-1-4">
                  <h5>Région</h5>
                </div>
                <div class="tablet-blob-3-4">
                  <p>{region.value?.nom}</p>
                </div>
              </div>
            ) : null}

            {isSuper(props.user) && (region.value || departement) ? (
              <div class="tablet-blobs">
                <div class="tablet-blob-1-4" />
                <div class="tablet-blob-3-4">
                  <p class="h6 mb">
                    Un utilisateur d'une <b>administration locale</b> peut créer et modifier le contenu des titres du territoire concerné.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      />

      <LoadingElement
        data={utilisateurs.value}
        renderItem={item => (
          <div class="mb-xxl">
            <div class="line-neutral width-full mb-xxl" />
            <h2>Utilisateurs</h2>
            <div class="line width-full" />
            <TableAuto class="width-full-p" columns={utilisateursColonnes} rows={utilisateursLignesBuild(item)} />
          </div>
        )}
      />

      {canReadActivitesTypesEmails(props.user, props.administrationId) ? (
        <LoadingElement
          data={activitesTypesEmails.value}
          renderItem={item => (
            <>
              {' '}
              <div class="line-neutral width-full mb-xxl" />
              <h2>Emails</h2>
              <ActivitesTypesEmails
                user={props.user}
                administrationId={props.administrationId}
                activitesTypesEmails={item}
                emailUpdate={(administrationId, activiteTypeId, email) => {
                  props.apiClient.administrationActiviteTypeEmailUpdate({
                    activiteTypeId,
                    email,
                    administrationId,
                  })
                  loadActivitesTypesEmails()
                }}
                emailDelete={(administrationId, activiteTypeId, email) => {
                  props.apiClient.administrationActiviteTypeEmailDelete({
                    activiteTypeId,
                    email,
                    administrationId,
                  })
                  loadActivitesTypesEmails()
                }}
              />
            </>
          )}
        />
      ) : null}
      <div class="mb-xxl">
        <div class="line-neutral width-full mb-xxl" />
        <h2>Permissions</h2>

        <Permissions administrationId={props.administrationId} apiClient={props.apiClient} />
      </div>
    </div>
  )
})
