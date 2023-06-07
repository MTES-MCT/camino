import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { canLinkTitres, getLinkConfig } from 'camino-common/src/permissions/titres'
import { computed, onMounted, ref, watch } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitresLink } from './titres-link'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { Icon } from '@/components/_ui/icon'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreId, TitreLink, TitreLinks } from 'camino-common/src/titres'
import { ApiClient } from '@/api/api-client'
import { TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'

export interface Props {
  user: User
  titre: {
    id: TitreId
    typeId: TitreTypeId
    administrations: AdministrationId[]
    demarches: { typeId: DemarcheTypeId }[]
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
  return () => (
    <div>
      <LoadingElement
        data={titresLinks.value}
        renderItem={item => (
          <>
            {item.amont.length || canLink.value ? (
              <div>
                <h5>Titre{linkConfig.value && linkConfig.value.count === 'multiple' ? 's' : ''} à l’origine de ce titre</h5>
                {mode.value === 'edit' ? (
                  <div>
                    {titreLinkConfig.value ? (
                      <TitresLink
                        config={titreLinkConfig.value}
                        loadLinkableTitres={props.apiClient.loadLinkableTitres(props.titre.typeId, props.titre.demarches)}
                        onSelectTitre={() => {}}
                        onSelectTitres={onSelectedTitres}
                      />
                    ) : null}

                    <div class="flex mt-m" style="flex-direction: row-reverse">
                      <button class="btn-primary ml-s" style="flex: 0 1 min-content" onClick={saveLink}>
                        Enregistrer
                      </button>
                      <button class="btn-secondary" style="flex: 0 1 min-content" onClick={() => (mode.value = 'read')}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div class="flex flex-center">
                    <ul class="list-inline" style="margin-bottom: 0">
                      {item.amont.map(titreFrom => (
                        <li key={titreFrom.id} class="mr-xs">
                          <router-link to={{ name: 'titre', params: { id: titreFrom.id } }} class="btn-border small p-s rnd-xs mr-xs">
                            <span class="mr-xs">{titreFrom.nom}</span>
                          </router-link>
                        </li>
                      ))}
                    </ul>

                    {canLink.value ? (
                      <button class="btn-alt p-xs rnd-s" title="modifie les titres liés" onClick={() => (mode.value = 'edit')}>
                        <Icon size="M" name="pencil" />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {item.aval.length ? (
              <div>
                <h5>Titre{item.aval.length > 1 ? 's' : ''} issu de ce titre</h5>
                <div class="flex flex-center">
                  <ul class="list-inline" style="margin-bottom: 0">
                    {item.aval.map(titreTo => (
                      <li key={titreTo.id} class="mr-xs">
                        <router-link to={{ name: 'titre', params: { id: titreTo.id } }} class="btn-border small p-s rnd-xs mr-xs">
                          <span class="mr-xs">{titreTo.nom}</span>
                        </router-link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </>
        )}
      />
    </div>
  )
})
