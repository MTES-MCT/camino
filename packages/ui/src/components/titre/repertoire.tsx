import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Entreprise, TitreEntreprise } from '../titre/entreprise'
import { Administration } from '../titre/administration'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { isAssociee } from 'camino-common/src/static/administrationsTitresTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed } from 'vue'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from 'camino-common/src/roles'

interface Props {
  titreTypeId: TitreTypeId
  titulaires: TitreEntreprise[]
  amodiataires: TitreEntreprise[]
  administrations: AdministrationId[]
  user: User
  eventTrack: (event: unknown) => void
}

export const Repertoire = caminoDefineComponent<Props>(['titreTypeId', 'titulaires', 'amodiataires', 'administrations', 'user', 'eventTrack'], props => {
  const mustFilterOutAssociee = () => {
    return !(isSuper(props.user) || isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user))
  }

  const admins = computed(() => {
    if (mustFilterOutAssociee()) {
      return props.administrations.filter(id => !isAssociee(id, props.titreTypeId))
    } else {
      return props.administrations
    }
  })

  return () => (
    <div class="tablet-blobs mb-xl">
      <div class="tablet-blob-1-2">
        {props.titulaires.length ? (
          <div class="mb">
            <h5>Titulaire{props.titulaires.length > 1 ? 's' : ''}</h5>
            {props.titulaires.map(titulaire => (
              <Entreprise key={titulaire.id} entreprise={titulaire} class="mb-s" onEventTrack={props.eventTrack} />
            ))}
          </div>
        ) : null}

        {props.amodiataires.length ? (
          <div class="mb">
            <h5>Amodiataire{props.amodiataires.length > 1 ? 's' : ''}</h5>
            {props.amodiataires.map(amodiataire => (
              <Entreprise key={amodiataire.id} entreprise={amodiataire} class="mb-s" onEventTrack={props.eventTrack} />
            ))}
          </div>
        ) : null}
      </div>

      <div class="tablet-blob-1-2">
        {props.administrations.length ? (
          <div class="mb">
            <h5>Administrations</h5>
            {admins.value.map(administrationId => (
              <Administration key={administrationId} administrationId={administrationId} class="mb-s" onEventTrack={props.eventTrack} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
})
