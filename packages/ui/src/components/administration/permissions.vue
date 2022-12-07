<template>
  <div>
    <PureTitresTypes :administrationId="administrationId" />

    <LoadingElement v-slot="{ item }" :data="administrationMetas">
      <div class="mb-xxl">
        <h3>Restrictions de l'édition des titres, démarches et étapes</h3>

        <div class="h6">
          <p class="mb-s">Par défaut :</p>
          <ul class="list-prefix mb-s">
            <li>
              Un utilisateur d'une administration gestionnaire peut modifier les
              titres, démarches et étapes.
            </li>
            <li>
              Un utilisateur d'une administration locale peut modifier les
              démarches et étapes.
            </li>
          </ul>
          <p>
            Restreint ces droits par domaine / type de titre / statut de titre.
          </p>
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

              <tr
                v-for="ttts in item.titresTypesTitresStatuts"
                :key="`${ttts.titreType.id}-${ttts.titreStatutId}`"
              >
                <td>
                  <CaminoDomaine
                    :domaineId="ttts.titreType.domaine.id"
                    class="mt-s"
                  />
                </td>
                <td>
                  <span class="small bold cap-first mt-s">{{
                    ttts.titreType.type.nom
                  }}</span>
                </td>
                <td>
                  <Statut
                    :color="getTitreStatut(ttts.titreStatutId).couleur"
                    :nom="getTitreStatut(ttts.titreStatutId).nom"
                    class="mt-s"
                  />
                </td>
                <td>
                  <Icon
                    v-if="ttts.titresModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
                <td>
                  <Icon
                    v-if="ttts.demarchesModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
                <td>
                  <Icon
                    v-if="ttts.etapesModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="mb-xxl">
        <h3>Restrictions de la visibilité, édition et création des étapes</h3>

        <div class="h6">
          <p class="mb-s">
            Par défaut, un utilisateur d'une administration gestionnaire ou
            locale peut voir, modifier et créer des étapes des titre.
          </p>
          <p>
            Restreint ces droits par domaine / type de titre / type d'étape.
          </p>
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

              <tr
                v-for="ttet in item.titresTypesEtapesTypes"
                :key="`${ttet.titreType.id}-${ttet.etapeType.id}`"
              >
                <td>
                  <CaminoDomaine
                    :domaineId="ttet.titreType.domaine.id"
                    class="mt-s"
                  />
                </td>
                <td>
                  <span class="small bold cap-first mt-s">{{
                    ttet.titreType.type.nom
                  }}</span>
                </td>
                <td>
                  <span class="small bold cap-first mt-s">{{
                    ttet.etapeType.nom
                  }}</span>
                </td>
                <td>
                  <Icon v-if="ttet.lectureInterdit" name="checkbox" size="M" />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
                <td>
                  <Icon
                    v-if="ttet.modificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
                <td>
                  <Icon v-if="ttet.creationInterdit" name="checkbox" size="M" />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="mb-xxl">
        <h3>Restriction de la visibilité et de l'édition des activités</h3>

        <div class="h6">
          <p class="mb-s">
            Par défaut, un utilisateur d'une administration gestionnaire ou
            locale peut voir et modifier les activités des titres.
          </p>

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

              <tr
                v-for="activiteType in item.activitesTypes"
                :key="activiteType.id"
              >
                <td>
                  <span class="cap-first"
                    >{{ activiteType.nom }} ({{
                      activiteType.id.toUpperCase()
                    }})
                  </span>
                </td>
                <td>
                  <Icon
                    v-if="activiteType.lectureInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
                <td>
                  <Icon
                    v-if="activiteType.modificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </LoadingElement>
  </div>
</template>

<script setup lang="ts">
import CaminoDomaine from '../_common/domaine.vue'
import Statut from '../_common/statut.vue'
import Icon from '../_ui/icon.vue'
import {
  TitresStatuts,
  TitreStatutId
} from 'camino-common/src/static/titresStatuts'
import PureTitresTypes from './pure-titres-types.vue'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { onMounted, ref } from 'vue'
import { ApiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import LoadingElement from '../_ui/pure-loader.vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'

const props = defineProps<{
  administrationId: AdministrationId
  apiClient: Pick<ApiClient, 'administrationMetas'>
}>()

const administrationMetas = ref<AsyncData<>>({ status: 'LOADING' })

const getTitreStatut = (titreStatutId: TitreStatutId) =>
  TitresStatuts[titreStatutId]

onMounted(async () => {
  try {
    administrationMetas.value = {
      status: 'LOADED',
      value: await props.apiClient.administrationMetas(props.administrationId)
    }
  } catch (e: any) {
    console.error('error', e)
    administrationMetas.value = {
      status: 'ERROR',
      message: e.message ?? "Une erreur s'est produite"
    }
  }
})
</script>
