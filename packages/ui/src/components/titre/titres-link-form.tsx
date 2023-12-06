import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { canLinkTitres, getLinkConfig } from 'camino-common/src/permissions/titres'
import { computed, onMounted, ref, watch } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitresLink } from './titres-link'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreId, TitreLink, TitreLinks } from 'camino-common/src/titres'
import { ApiClient } from '@/api/api-client'
import { TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'
import { DsfrButton, DsfrButtonIcon } from '../_ui/dsfr-button'
import { DsfrIcon } from '../_ui/icon'
import { DsfrTag } from '../_ui/tag'

export interface Props {
  user: User
  titre: {
    id: TitreId
    typeId: TitreTypeId
    administrations: AdministrationId[]
    demarches: { demarche_type_id: DemarcheTypeId }[]
  }
  apiClient: Pick<ApiClient, 'loadTitreLinks' | 'loadLinkableTitres' | 'linkTitres'>
}
export const TitresLinkForm = caminoDefineComponent<Props>(['apiClient', 'titre', 'user'], props => {
  const mode = ref<'read' | 'edit'>('read')
  const selectedTitres = ref<TitreLink[]>([])
  const titresLinks = ref<AsyncData<TitreLinks>>({ status: 'LOADING' })

  const linkConfig = computed(() => getLinkConfig(props.titre.typeId, props.titre.demarches))

  onMounted(async () => {
    await init()
  })

  watch(
    () => props.titre,
    async _ => {
      await init()
    }
  )

  const init = async () => {
    titresLinks.value = { status: 'LOADING' }
    try {
      const result = await props.apiClient.loadTitreLinks(props.titre.id)
      titresLinks.value = { status: 'LOADED', value: result }
      selectedTitres.value = titresLinks.value.value.amont
    } catch (e: any) {
      titresLinks.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  const canLink = computed<boolean>(() => {
    // On ne peut pas lier si ce type de titre n’accepte pas de liaison
    if (!linkConfig.value) {
      return false
    }

    return canLinkTitres(props.user, props.titre.administrations ?? [])
  })

  const titreLinkConfig = computed<TitresLinkConfig | null>(() => {
    if (titresLinks.value.status !== 'LOADED') {
      return null
    }

    const titreFromIds = titresLinks.value.value.amont.map(({ id }) => id)
    if (linkConfig.value?.count === 'single') {
      return {
        type: 'single',
        selectedTitreId: titreFromIds.length === 1 ? titreFromIds[0] : null,
      }
    }

    return {
      type: 'multiple',
      selectedTitreIds: titreFromIds,
    }
  })

  const onSelectedTitres = (titres: TitreLink[]) => {
    selectedTitres.value = titres
  }

  const saveLink = async () => {
    titresLinks.value = { status: 'LOADING' }
    try {
      const links = await props.apiClient.linkTitres(
        props.titre.id,
        selectedTitres.value.map(({ id }) => id)
      )
      mode.value = 'read'
      titresLinks.value = {
        status: 'LOADED',
        value: links,
      }
    } catch (e: any) {
      titresLinks.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  const closeForm = () => (mode.value = 'read')

  return () => (
    <div>
      <LoadingElement
        data={titresLinks.value}
        renderItem={item => (
          <>
            {item.amont.length || canLink.value ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <DsfrIcon name="fr-icon-link" size="sm" color="text-title-blue-france" />
                Titre{item.amont.length > 1 ? 's' : ''} à l’origine de ce titre :
                {mode.value === 'edit' ? (
                  <>
                    {titreLinkConfig.value ? (
                      <TitresLink
                        config={titreLinkConfig.value}
                        loadLinkableTitres={props.apiClient.loadLinkableTitres(props.titre.typeId, props.titre.demarches)}
                        onSelectTitre={() => {}}
                        onSelectTitres={onSelectedTitres}
                      />
                    ) : null}
                    <>
                      <DsfrButton buttonType="primary" title="Enregistrer" onClick={saveLink} />
                      <DsfrButton buttonType="secondary" title="Annuler" onClick={closeForm} />
                    </>
                  </>
                ) : (
                  <div class="flex flex-center" style={{ gap: '0.5rem' }}>
                    {item.amont.map(titreFrom => (
                      <DsfrTag key={titreFrom.id} tagSize="sm" to={{ name: 'titre', params: { id: titreFrom.id } }} ariaLabel={titreFrom.nom} />
                    ))}

                    {canLink.value ? <DsfrButtonIcon buttonType="tertiary-no-outline" title="modifier les titres liés" onClick={() => (mode.value = 'edit')} icon="fr-icon-pencil-line" /> : null}
                  </div>
                )}
              </div>
            ) : null}

            {item.aval.length ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <DsfrIcon name="fr-icon-link" size="sm" color="text-title-blue-france" />
                Titre{item.aval.length > 1 ? 's' : ''} issu de ce titre :
                <div class="flex flex-center" style={{ gap: '0.5rem' }}>
                  {item.aval.map(titreTo => (
                    <DsfrTag key={titreTo.id} tagSize="sm" to={{ name: 'titre', params: { id: titreTo.id } }} ariaLabel={titreTo.nom} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      />
    </div>
  )
})
