import { Domaine as CaminoDomaine } from '../_common/domaine'
import { Icon } from '../_ui/icon'
import { TitresTypes } from './titres-types'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { TitresTypes as TT } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { onMounted, ref } from 'vue'
import { ApiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { AdministrationMetas } from './administration-api-client'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { getAdministrationTitresTypesTitresStatuts } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes'
import { TitreStatut } from '../_common/titre-statut'
interface Props {
  administrationId: AdministrationId
  apiClient: Pick<ApiClient, 'administrationMetas'>
}
export const Permissions = caminoDefineComponent<Props>(['administrationId', 'apiClient'], props => {
  const administrationMetas = ref<AsyncData<AdministrationMetas>>({
    status: 'LOADING',
  })

  const titresTypesTitresStatuts = getAdministrationTitresTypesTitresStatuts(props.administrationId)
  const titresTypesEtapesTypes = getAdministrationTitresTypesEtapesTypes(props.administrationId)

  onMounted(async () => {
    try {
      administrationMetas.value = {
        status: 'LOADED',
        value: await props.apiClient.administrationMetas(props.administrationId),
      }
    } catch (e: any) {
      console.error('error', e)
      administrationMetas.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })
  return () => (
    <div>
      <TitresTypes administrationId={props.administrationId} />

      <div class="mb-xxl">
        <h3>Restrictions de l'édition des titres, démarches et étapes</h3>

        <div class="h6">
          <p class="mb-s">Par défaut :</p>
          <ul class="list-prefix mb-s">
            <li>Un utilisateur d'une administration gestionnaire peut modifier les titres, démarches et étapes.</li>
            <li>Un utilisateur d'une administration locale peut modifier les démarches et étapes.</li>
          </ul>
          <p>Restreint ces droits par domaine / type de titre / statut de titre.</p>
        </div>

        <div class="line width-full" />
        <div class="width-full-p">
          <div class="overflow-scroll-x mb">
            <table>
              <tr>
                <th>Domaine</th>
                <th>Type de titre</th>
                <th>Statut de titre</th>
                <th>Titres</th>
                <th>Démarches</th>
                <th>Étapes</th>
              </tr>

              {titresTypesTitresStatuts.map(ttts => (
                <tr key={`${ttts.titreTypeId}-${ttts.titreStatutId}`}>
                  <td class="dsfr">
                    <CaminoDomaine domaineId={TT[ttts.titreTypeId].domaineId} />
                  </td>
                  <td>
                    <span class="small bold cap-first">{TitresTypesTypes[TT[ttts.titreTypeId].typeId].nom}</span>
                  </td>
                  <td class="dsfr">
                    <TitreStatut titreStatutId={ttts.titreStatutId} />
                  </td>
                  <td>
                    <Icon
                      name={ttts.titresModificationInterdit ? 'checkbox' : 'checkbox-blank'}
                      size="M"
                      role="img"
                      aria-label={ttts.titresModificationInterdit ? 'La modification des titres est interdite' : 'La modification des titres est autorisée'}
                    />
                  </td>
                  <td>
                    <Icon
                      name={ttts.demarchesModificationInterdit ? 'checkbox' : 'checkbox-blank'}
                      size="M"
                      role="img"
                      aria-label={ttts.demarchesModificationInterdit ? 'La modification des démarches est interdite' : 'La modification des démarches est autorisée'}
                    />
                  </td>
                  <td>
                    <Icon
                      name={ttts.etapesModificationInterdit ? 'checkbox' : 'checkbox-blank'}
                      size="M"
                      role="img"
                      aria-label={ttts.etapesModificationInterdit ? 'La modification des étapes est interdite' : 'La modification des étapes est autorisée'}
                    />
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </div>

      <div class="mb-xxl">
        <h3>Restrictions de la visibilité, édition et création des étapes</h3>

        <div class="h6">
          <p class="mb-s">Par défaut, un utilisateur d'une administration gestionnaire ou locale peut voir, modifier et créer des étapes des titre.</p>
          <p>Restreint ces droits par domaine / type de titre / type d'étape.</p>
        </div>

        <div class="line width-full" />
        <div class="width-full-p">
          <div class="overflow-scroll-x mb">
            <table>
              <tr>
                <th>Domaine</th>
                <th>Type de titre</th>
                <th>Type d'étape</th>
                <th>Visibilité</th>
                <th>Modification</th>
                <th>Création</th>
              </tr>

              {titresTypesEtapesTypes.map(ttet => (
                <tr key={`${ttet.titreTypeId}-${ttet.etapeTypeId}`}>
                  <td class="dsfr">
                    <CaminoDomaine domaineId={TT[ttet.titreTypeId].domaineId} />
                  </td>
                  <td>
                    <span class="small bold cap-first">{TitresTypesTypes[TT[ttet.titreTypeId].typeId].nom}</span>
                  </td>
                  <td>
                    <span class="small bold cap-first">{EtapesTypes[ttet.etapeTypeId].nom}</span>
                  </td>
                  <td>
                    <Icon
                      name={ttet.lectureInterdit ? 'checkbox' : 'checkbox-blank'}
                      size="M"
                      role="img"
                      aria-label={ttet.lectureInterdit ? 'Le type d’étape n’est pas visible' : 'Le type d’étape est visible'}
                    />
                  </td>
                  <td>
                    <Icon
                      name={ttet.modificationInterdit ? 'checkbox' : 'checkbox-blank'}
                      size="M"
                      role="img"
                      aria-label={ttet.modificationInterdit ? 'Le type d’étape n’est pas modifiable' : 'Le type d’étape est modifiable'}
                    />
                  </td>
                  <td>
                    <Icon
                      name={ttet.creationInterdit ? 'checkbox' : 'checkbox-blank'}
                      size="M"
                      role="img"
                      aria-label={ttet.lectureInterdit ? 'Ne peut créer d’étape de ce type' : 'Peut créer une étape de ce type'}
                    />
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </div>
      <LoadingElement
        data={administrationMetas.value}
        renderItem={item => (
          <>
            <div class="mb-xxl">
              <h3>Restriction de la visibilité et de l'édition des activités</h3>

              <div class="h6">
                <p class="mb-s">Par défaut, un utilisateur d'une administration gestionnaire ou locale peut voir et modifier les activités des titres.</p>

                <p>Restreint ces droits par type d'étape.</p>
              </div>

              <div class="line width-full" />

              <div class="width-full-p">
                <div class="overflow-scroll-x mb">
                  <table>
                    <tr>
                      <th>Type d'activité</th>
                      <th>Visibilité</th>
                      <th>Modification</th>
                    </tr>

                    {item.activitesTypes.map(activiteType => (
                      <tr key={activiteType.id}>
                        <td>
                          <span class="cap-first">
                            {ActivitesTypes[activiteType.id].nom} ({activiteType.id.toUpperCase()})
                          </span>
                        </td>
                        <td>
                          <Icon
                            name={activiteType.lectureInterdit ? 'checkbox' : 'checkbox-blank'}
                            size="M"
                            role="img"
                            aria-label={activiteType.lectureInterdit ? 'Le type d’activité n’est pas visible' : 'Le type d’activité est visible'}
                          />
                        </td>
                        <td>
                          <Icon
                            name={activiteType.modificationInterdit ? 'checkbox' : 'checkbox-blank'}
                            size="M"
                            role="img"
                            aria-label={activiteType.modificationInterdit ? 'Le type d’étape n’est pas modifiable' : 'Le type d’étape est modifiable'}
                          />
                        </td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      />
    </div>
  )
})
