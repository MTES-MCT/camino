import { apiClient, ApiClient } from '@/api/api-client'
import { useRoute } from 'vue-router'

import { TableAuto } from './_ui/table-auto'
import { LoadingElement } from './_ui/functional-loader'
import { Permissions } from './administration/permissions'
import { ActivitesTypesEmails } from './administration/activites-types-emails'

import { utilisateursColonnes, utilisateursLignesBuild } from './utilisateurs/table'
import { ADMINISTRATION_TYPES, Administrations, AdministrationId, Administration as Adm, AdministrationType, isAdministrationId } from 'camino-common/src/static/administrations'
import { AdministrationActiviteTypeEmail } from 'camino-common/src/administrations'
import { AdminUserNotNull, isSuper, User } from 'camino-common/src/roles'
import { canReadActivitesTypesEmails, canReadAdministrations } from 'camino-common/src/permissions/administrations'
import { Departement, Departements } from 'camino-common/src/static/departement'
import { Region, Regions } from 'camino-common/src/static/region'
import { computed, defineComponent, inject, onMounted, ref } from 'vue'
import { AsyncData } from '@/api/client-rest'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { userKey } from '@/moi'
import { capitalize } from 'camino-common/src/strings'
import { Alert } from './_ui/alert'
import { DsfrLink } from './_ui/dsfr-button'
import { LabelWithValue } from './_ui/label-with-value'

export const Administration = defineComponent(() => {
  const route = useRoute<'administration'>()

  const user = inject(userKey)

  const administrationId = computed<AdministrationId | null>(() => {
    if (isAdministrationId(route.params.id)) {
      return route.params.id
    }

    return null
  })

  return () => (
    <>
      {administrationId.value ? (
        <PureAdministration administrationId={administrationId.value} user={user} apiClient={apiClient} />
      ) : (
        <Alert title="Administration inconnue" type="error" small={true} />
      )}
    </>
  )
})

interface Props {
  administrationId: AdministrationId
  user: User
  apiClient: Pick<ApiClient, 'administrationActivitesTypesEmails' | 'administrationUtilisateurs' | 'administrationActiviteTypeEmailUpdate' | 'administrationActiviteTypeEmailDelete'>
}

export const PureAdministration = defineComponent<Props>(props => {
  const administration = computed<Adm>(() => Administrations[props.administrationId])
  const type = computed<AdministrationType>(() => ADMINISTRATION_TYPES[administration.value.typeId])
  const departement = computed<Departement | undefined>(() => {
    return administration.value.departementId ? Departements[administration.value.departementId] : undefined
  })
  const region = computed<Region | undefined>(() => {
    return administration.value.regionId ? Regions[administration.value.regionId] : undefined
  })
  const activitesTypesEmails = ref<AsyncData<AdministrationActiviteTypeEmail[]>>({
    status: 'LOADING',
  })
  const utilisateurs = ref<AsyncData<AdminUserNotNull[]>>({ status: 'LOADING' })

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
    if (canReadAdministrations(props.user)) {
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
    }
  })

  return () => (
    <div>
      <DsfrLink to={{ name: 'administrations', params: {} }} disabled={false} title="Administrations" icon={null} />

      <div class="fr-grid-row fr-mt-4w" style={{ alignItems: 'center' }}>
        <h1 class="fr-m-0">{capitalize(administration.value.nom)}</h1>
        <span class="fr-h4 fr-m-0 fr-ml-2w">({capitalize(administration.value.abreviation)})</span>
      </div>

      <div class="fr-pt-8w fr-pb-4w" style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        <LabelWithValue title="Type" text={type.value.nom} />
        <LabelWithValue title="Service" text={administration.value.service ?? ''} />
        <LabelWithValue
          title="Adresse"
          item={
            <p>
              {administration.value.adresse1}
              {isNotNullNorUndefined(administration.value.adresse2) ? (
                <span>
                  <br />
                  {administration.value.adresse2}
                </span>
              ) : null}
              <br />
              {administration.value.codePostal} {administration.value.commune}
            </p>
          }
        />
        <LabelWithValue title="Téléphone" text={administration.value.telephone ?? '–'} />
        <LabelWithValue
          title="Email"
          item={
            isNotNullNorUndefined(administration.value.email) ? (
              <DsfrLink href={`mailto:${administration.value.email}`} title={administration.value.email} disabled={false} icon={null} />
            ) : (
              <span>–</span>
            )
          }
        />
        <LabelWithValue
          title="Site"
          item={
            isNotNullNorUndefined(administration.value.url) ? (
              <DsfrLink href={administration.value.url} disabled={false} icon={null} title={administration.value.url} target="_blank" rel="noopener noreferrer" />
            ) : (
              <span>–</span>
            )
          }
        />

        {departement.value ? <LabelWithValue title="Département" text={departement.value.nom} /> : null}
        {region.value ? <LabelWithValue title="Région" text={region.value.nom} /> : null}

        {isSuper(props.user) && (isNotNullNorUndefined(region.value) || isNotNullNorUndefined(departement.value)) ? (
          <p class="fr-text--lg">
            Un utilisateur d'une <b>administration locale</b> peut créer et modifier le contenu des titres du territoire concerné.
          </p>
        ) : null}
      </div>
      {canReadAdministrations(props.user) ? (
        <LoadingElement
          data={utilisateurs.value}
          renderItem={item => (
            <div>
              <TableAuto caption="Utilisateurs" columns={utilisateursColonnes} rows={utilisateursLignesBuild(item)} initialSort={'firstColumnAsc'} />
            </div>
          )}
        />
      ) : null}

      {canReadActivitesTypesEmails(props.user, props.administrationId) ? (
        <LoadingElement
          data={activitesTypesEmails.value}
          renderItem={item => (
            <>
              <h2>Emails</h2>
              <ActivitesTypesEmails
                user={props.user}
                administrationId={props.administrationId}
                activitesTypesEmails={item}
                emailUpdate={async (administrationId, administrationActiviteTypeEmail) => {
                  await props.apiClient.administrationActiviteTypeEmailUpdate(administrationId, administrationActiviteTypeEmail)
                  await loadActivitesTypesEmails()
                }}
                emailDelete={async (administrationId, administrationActiviteTypeEmail) => {
                  await props.apiClient.administrationActiviteTypeEmailDelete(administrationId, administrationActiviteTypeEmail)
                  await loadActivitesTypesEmails()
                }}
              />
            </>
          )}
        />
      ) : null}
      {canReadAdministrations(props.user) ? (
        <div>
          <h2>Permissions</h2>

          <Permissions administrationId={props.administrationId} />
        </div>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureAdministration.props = ['administrationId', 'user', 'apiClient']
