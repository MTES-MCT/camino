import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { canDeleteTitre } from 'camino-common/src/permissions/titres'
import { User } from 'camino-common/src/roles'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Icon } from '../_ui/icon'
import { RemovePopup } from './remove-popup'
import { titreApiClient, TitreApiClient } from './titre-api-client'

interface Props {
  titre: {
    id: string
    nom: string
    typeId: TitreTypeId
    abonnement: boolean
    modification: boolean
  }
}

interface PureProps extends Props {
  user: User
  apiClient: Omit<TitreApiClient, 'loadTitreSections'>
  emailSend: () => void
}
export const Header = caminoDefineComponent<Props>(['titre'], (props, context) => {
  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  const user = computed(() => {
    return store.state.user.element
  })
  const eventTrack = (event: { categorie: string; action: string; nom: string | string[] }) => {
    context.emit('titre-event-track', event)
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

  const abonne = async (titreId: string, abonner: boolean) => {
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

  return () => <PureHeader {...props} user={user.value} apiClient={{ ...titreApiClient, removeTitre, titreUtilisateurAbonne: abonne }} emailSend={emailSend} />
})

export const PureHeader = caminoDefineComponent<PureProps>(['titre', 'apiClient', 'user', 'emailSend'], props => {
  const suppression = computed(() => {
    return canDeleteTitre(props.user)
  })
  // const editPopupOpen = () => {
  //   const titre = {}
  //   titre.id = props.titre.id
  //   titre.nom = props.titre.nom
  //   titre.references = props.titre.references

  //   store.commit('popupOpen', {
  //     component: EditPopup,
  //     props: {
  //       titre,
  //     },
  //   })

  //   eventTrack({
  //     categorie: 'titre-sections',
  //     action: 'titre-editer',
  //     nom: route.params.id,
  //   })
  // }

  const removePopup = ref<boolean>(false)

  return () => (
    <div class="sticky-header width-full">
      <div class="container">
        <div class="tablet-blobs">
          <div class="tablet-blob-1-2">
            <h1 class="mt-m mb-m">{props.titre.nom}</h1>
          </div>
          <div class="tablet-blob-1-2 flex">
            <div class="flex-right flex my-s">
              {props.user ? (
                <button
                  class={`btn small rnd-0 rnd-l-xs px-m py-s lh-2 mr-px ${props.titre.abonnement ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => props.apiClient.titreUtilisateurAbonne(props.titre.id, !props.titre.abonnement)}
                >
                  <span class="mt-xs">{props.titre.abonnement ? 'Se désabonner du titre' : 'S’abonner au titre'}</span>
                </button>
              ) : null}

              <button class={`btn-border small px-m py-s lh-2 ${suppression.value || props.titre.modification ? 'mr-px' : 'rnd-r-xs'} ${!props.user ? 'rnd-l-xs' : null}`} onClick={props.emailSend}>
                <span class="mt-xs nowrap">Signaler une erreur…</span>
              </button>
              {/* {props.titre.modification ? (<button class={`btn py-s px-m mr-px ${!suppression.value ? 'rnd-r-xs' : null}`} onClick={editPopupOpen}>
            <Icon size="M" name="pencil" />
          </button>) : null} */}

              {suppression.value ? (
                <button
                  class="btn rnd-r-xs py-s px-m"
                  onClick={() => {
                    removePopup.value = true
                  }}
                >
                  <Icon size="M" name="delete" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div class="line width-full" />
      </div>
      {removePopup.value ? (
        <RemovePopup
          close={() => (removePopup.value = !removePopup.value)}
          titreId={props.titre.id}
          titreNom={props.titre.nom}
          titreTypeId={props.titre.typeId}
          deleteTitre={async () => {
            await props.apiClient.removeTitre(props.titre.id)
          }}
        />
      ) : null}
    </div>
  )
})
