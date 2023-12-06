import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { canDeleteTitre } from 'camino-common/src/permissions/titres'
import { User } from 'camino-common/src/roles'
import { ReferenceTypeId } from 'camino-common/src/static/referencesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { EditableTitre, TitreId } from 'camino-common/src/titres'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { titreApiClient, TitreApiClient } from './titre-api-client'
import { AsyncData } from '@/api/client-rest'
import { CaminoDate, dateFormat } from 'camino-common/src/date'
import { LoadingElement } from '../_ui/functional-loader'
import { Button } from '../_ui/button'

interface Props {
  titre: {
    id: TitreId
    nom: string
    typeId: TitreTypeId
    abonnement: boolean
    modification: boolean
    references: { referenceTypeId: ReferenceTypeId; nom: string }[]
  }
  titreEventTrack: (event: { categorie: string; action: string; nom: string | string[] }) => void
}

interface PureProps extends Props {
  user: User
  apiClient: Pick<TitreApiClient, 'titreUtilisateurAbonne' | 'editTitre' | 'removeTitre' | 'getLastModifiedDate'>
  emailSend: () => void
}
export const Header = caminoDefineComponent<Props>(['titre', 'titreEventTrack'], props => {
  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  const user = computed(() => {
    return store.state.user.element
  })
  const eventTrack = (event: { categorie: string; action: string; nom: string | string[] }) => {
    props.titreEventTrack(event)
  }

  const removeTitre = async () => {
    eventTrack({
      categorie: 'titre-sections',
      action: 'titre-supprimer',
      nom: route.params.id,
    })
    await titreApiClient.removeTitre(props.titre.id)
    store.dispatch(
      'messageAdd',
      {
        value: `le titre a été supprimé`,
        type: 'success',
      },
      { root: true }
    )
    router.push({ name: 'titres' })
  }

  const editTitre = async (titre: EditableTitre) => {
    eventTrack({
      categorie: 'titre-sections',
      action: 'titre-enregistrer',
      nom: titre.id,
    })
    await titreApiClient.editTitre(titre)
    await store.dispatch('reload', { name: 'titre', id: titre.id }, { root: true })
    store.dispatch('messageAdd', { value: 'le titre a été mis à jour', type: 'success' }, { root: true })
  }

  const abonne = async (titreId: TitreId, abonner: boolean) => {
    await titreApiClient.titreUtilisateurAbonne(titreId, abonner)
    store.commit('titre/set', { ...props.titre, abonnement: abonner })

    store.dispatch(
      'messageAdd',
      {
        value: `Vous êtes ${abonner ? 'abonné à ce titre' : 'désabonné de ce titre'}`,
        type: 'success',
      },
      { root: true }
    )
  }

  const emailSend = () => {
    eventTrack({
      categorie: 'titre-sections',
      action: 'titre-erreur_signaler',
      nom: route.params.id,
    })
    window.location.href = `mailto:camino@beta.gouv.fr?subject=Erreur ${route.params.id}&body=Bonjour, j'ai repéré une erreur sur le titre ${window.location.href} : `
  }

  return () => <PureHeader titre={props.titre} user={user.value} apiClient={{ ...titreApiClient, editTitre, removeTitre, titreUtilisateurAbonne: abonne }} emailSend={emailSend} />
})

export const PureHeader = caminoDefineComponent<Omit<PureProps, 'titreEventTrack'>>(['titre', 'apiClient', 'user', 'emailSend'], props => {
  const suppression = computed(() => {
    return canDeleteTitre(props.user)
  })

  const lastModifiedDate = ref<AsyncData<CaminoDate | null>>({ status: 'LOADING' })

  watch(
    () => props.titre.id,
    async () => {
      lastModifiedDate.value = { status: 'LOADING' }
      try {
        lastModifiedDate.value = { status: 'LOADED', value: await props.apiClient.getLastModifiedDate(props.titre.id) }
      } catch (e: any) {
        console.error('error', e)
        lastModifiedDate.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened',
        }
      }
    },
    { immediate: true }
  )

  return () => (
    <>
      <div class="sticky-header width-full">
        <div class="container">
          <div class="tablet-blobs">
            <div class="tablet-blob-1-2">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                <h1 class="mt-m mb-m">{props.titre.nom}</h1>
                <div class="pl-s color-neutral">
                  <LoadingElement data={lastModifiedDate.value} renderItem={item => (item ? <>Modifié le {dateFormat(item)}</> : null)} />
                </div>
              </div>
            </div>
            <div class="tablet-blob-1-2 flex">
              <div class="flex-right flex my-s">
                {props.user ? (
                  <Button
                    class={`btn small rnd-0 rnd-l-xs px-m py-s lh-2 mr-px ${props.titre.abonnement ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => props.apiClient.titreUtilisateurAbonne(props.titre.id, !props.titre.abonnement)}
                    title={props.titre.abonnement ? 'Se désabonner du titre' : 'S’abonner au titre'}
                    render={() => <span class="mt-xs">{props.titre.abonnement ? 'Se désabonner du titre' : 'S’abonner au titre'}</span>}
                  />
                ) : null}

                <Button
                  class={`btn-border small px-m py-s lh-2 ${suppression.value || props.titre.modification ? 'mr-px' : 'rnd-r-xs'} ${!props.user ? 'rnd-l-xs' : null}`}
                  onClick={props.emailSend}
                  title="Signaler une erreur"
                  render={() => <span class="mt-xs nowrap">Signaler une erreur…</span>}
                />
              </div>
            </div>
          </div>

          <div class="line width-full" />
        </div>
      </div>
    </>
  )
})
