<template>
  <div>
    <div class="mb-xxl">
      <h3>Administration gestionnaire ou associée</h3>

      <div class="h6">
        <ul class="list-prefix">
          <li>
            Un utilisateur d'une <b>administration gestionnaire</b> peut créer
            et modifier les titres et leur contenu.
          </li>
          <li>
            Un utilisateur d'une <b>administration associée</b> peut voir les
            titres non-publics. Cette administration n'apparaît pas sur les
            pages des titres.
          </li>
        </ul>

        <p>Accorde ces droits par domaine / type de titre.</p>
      </div>

      <div class="line width-full" />
      <div class="width-full-p">
        <div class="overflow-scroll-x mb">
          <table>
            <tr>
              <th>Domaine</th>
              <th>Type de titre</th>
              <th>Gestionnaire</th>
              <th>Associée</th>
              <th />
            </tr>
            <tr>
              <td>
                <select
                  v-model="titreTypeNew.domaineId"
                  class="py-xs px-s mr-s"
                >
                  <option
                    v-for="domaine in domaines"
                    :key="domaine.id"
                    :value="domaine.id"
                  >
                    {{ domaine.id.toUpperCase() }} {{ domaine.nom }}
                  </option>
                </select>
              </td>
              <td>
                <select
                  v-model="titreTypeNew.titreTypeTypeId"
                  class="py-xs px-s mr-s"
                  :disabled="!titreTypeNew.domaineId"
                >
                  <option
                    v-for="titreType in titreTypeNewTypes"
                    :key="titreType.id"
                    :value="titreType.type.id"
                  >
                    {{ titreType.type.nom }}
                  </option>
                </select>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="!titreTypeNew.titreTypeTypeId"
                  @click="
                    titreTypeNew.gestionnaire = !titreTypeNew.gestionnaire
                  "
                >
                  <Icon
                    v-if="titreTypeNew.gestionnaire"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="!titreTypeNew.titreTypeTypeId"
                  @click="titreTypeNew.associee = !titreTypeNew.associee"
                >
                  <Icon v-if="titreTypeNew.associee" name="checkbox" size="M" />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <ButtonPlus
                  :disabled="!titreTypeNewActive"
                  @click="titreTypeNewUpdate"
                />
              </td>
            </tr>
            <tr
              v-for="titreType in administration.titresTypes"
              :key="titreType.id"
            >
              <td>
                <CaminoDomaine :domaineId="titreType.domaine.id" class="mt-s" />
              </td>
              <td>
                <span class="small bold cap-first mt-s">{{
                  titreType.type.nom
                }}</span>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeUpdate(
                      titreType.id,
                      titreType.gestionnaire,
                      titreType.associee,
                      'gestionnaire'
                    )
                  "
                >
                  <Icon
                    v-if="titreType.gestionnaire"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeUpdate(
                      titreType.id,
                      titreType.gestionnaire,
                      titreType.associee,
                      'associee'
                    )
                  "
                >
                  <Icon v-if="titreType.associee" name="checkbox" size="M" />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td />
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div v-if="administration.typeId" class="mb-xxl">
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
              <th />
            </tr>

            <tr>
              <td>
                <select
                  v-model="titreTypeTitreStatutNew.domaineId"
                  class="py-xs px-s mr-s"
                >
                  <option
                    v-for="domaine in domaines"
                    :key="domaine.id"
                    :value="domaine.id"
                  >
                    {{ domaine.id.toUpperCase() }} {{ domaine.nom }}
                  </option>
                </select>
              </td>
              <td>
                <select
                  v-model="titreTypeTitreStatutNew.titreTypeTypeId"
                  class="py-xs px-s mr-s"
                  :disabled="!titreTypeTitreStatutNew.domaineId"
                >
                  <option
                    v-for="titreType in titreTypeTitreStatutNewTypes"
                    :key="titreType.id"
                    :value="titreType.type.id"
                  >
                    {{ titreType.type.nom }}
                  </option>
                </select>
              </td>
              <td>
                <select
                  v-model="titreTypeTitreStatutNew.titreStatutId"
                  class="py-xs px-s mr-s"
                >
                  <option
                    v-for="titreStatut in titresStatuts"
                    :key="titreStatut.id"
                    :value="titreStatut.id"
                  >
                    {{ titreStatut.nom }}
                  </option>
                </select>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="
                    !titreTypeTitreStatutNew.titreTypeTypeId ||
                    !titreTypeTitreStatutNew.titreStatutId
                  "
                  @click="
                    titreTypeTitreStatutNew.titresModificationInterdit =
                      !titreTypeTitreStatutNew.titresModificationInterdit
                  "
                >
                  <Icon
                    v-if="titreTypeTitreStatutNew.titresModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="
                    !titreTypeTitreStatutNew.titreTypeTypeId ||
                    !titreTypeTitreStatutNew.titreStatutId
                  "
                  @click="
                    titreTypeTitreStatutNew.demarchesModificationInterdit =
                      !titreTypeTitreStatutNew.demarchesModificationInterdit
                  "
                >
                  <Icon
                    v-if="titreTypeTitreStatutNew.demarchesModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="
                    !titreTypeTitreStatutNew.titreTypeTypeId ||
                    !titreTypeTitreStatutNew.titreStatutId
                  "
                  @click="
                    titreTypeTitreStatutNew.etapesModificationInterdit =
                      !titreTypeTitreStatutNew.etapesModificationInterdit
                  "
                >
                  <Icon
                    v-if="titreTypeTitreStatutNew.etapesModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <ButtonPlus
                  :disabled="!titreTypeTitreStatutNewActive"
                  @click="titreTypeTitreStatutNewUpdate"
                />
              </td>
            </tr>

            <tr
              v-for="ttts in administration.titresTypesTitresStatuts"
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
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeTitreStatutUpdate(
                      ttts.titreType.id,
                      ttts.titreStatut.id,
                      ttts.titresModificationInterdit,
                      ttts.demarchesModificationInterdit,
                      ttts.etapesModificationInterdit,
                      'titres'
                    )
                  "
                >
                  <Icon
                    v-if="ttts.titresModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeTitreStatutUpdate(
                      ttts.titreType.id,
                      ttts.titreStatut.id,
                      ttts.titresModificationInterdit,
                      ttts.demarchesModificationInterdit,
                      ttts.etapesModificationInterdit,
                      'demarches'
                    )
                  "
                >
                  <Icon
                    v-if="ttts.demarchesModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeTitreStatutUpdate(
                      ttts.titreType.id,
                      ttts.titreStatut.id,
                      ttts.titresModificationInterdit,
                      ttts.demarchesModificationInterdit,
                      ttts.etapesModificationInterdit,
                      'etapes'
                    )
                  "
                >
                  <Icon
                    v-if="ttts.etapesModificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td />
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div v-if="administration.typeId" class="mb-xxl">
      <h3>Restrictions de la visibilité, édition et création des étapes</h3>

      <div class="h6">
        <p class="mb-s">
          Par défaut, un utilisateur d'une administration gestionnaire ou locale
          peut voir, modifier et créer des étapes des titre.
        </p>
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
              <th />
            </tr>

            <tr>
              <td>
                <select
                  v-model="titreTypeEtapeTypeNew.domaineId"
                  class="py-xs px-s mr-s"
                >
                  <option
                    v-for="domaine in domaines"
                    :key="domaine.id"
                    :value="domaine.id"
                  >
                    {{ domaine.id.toUpperCase() }} {{ domaine.nom }}
                  </option>
                </select>
              </td>
              <td>
                <select
                  v-model="titreTypeEtapeTypeNew.titreTypeTypeId"
                  class="py-xs px-s mr-s"
                  :disabled="!titreTypeEtapeTypeNew.domaineId"
                >
                  <option
                    v-for="titreType in titreTypeEtapeTypeNewTypes"
                    :key="titreType.id"
                    :value="titreType.type.id"
                  >
                    {{ titreType.type.nom }}
                  </option>
                </select>
              </td>
              <td>
                <select
                  v-model="titreTypeEtapeTypeNew.etapeTypeId"
                  class="py-xs px-s mr-s"
                >
                  <option
                    v-for="etapeType in etapesTypes"
                    :key="etapeType.id"
                    :value="etapeType.id"
                  >
                    {{ etapeType.nom }}
                  </option>
                </select>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="
                    !titreTypeEtapeTypeNew.titreTypeTypeId ||
                    !titreTypeEtapeTypeNew.etapeTypeId
                  "
                  @click="
                    titreTypeEtapeTypeNew.lectureInterdit =
                      !titreTypeEtapeTypeNew.lectureInterdit
                  "
                >
                  <Icon
                    v-if="titreTypeEtapeTypeNew.lectureInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="
                    !titreTypeEtapeTypeNew.titreTypeTypeId ||
                    !titreTypeEtapeTypeNew.etapeTypeId
                  "
                  @click="
                    titreTypeEtapeTypeNew.modificationInterdit =
                      !titreTypeEtapeTypeNew.modificationInterdit
                  "
                >
                  <Icon
                    v-if="titreTypeEtapeTypeNew.modificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="
                    !titreTypeEtapeTypeNew.titreTypeTypeId ||
                    !titreTypeEtapeTypeNew.etapeTypeId
                  "
                  @click="
                    titreTypeEtapeTypeNew.creationInterdit =
                      !titreTypeEtapeTypeNew.creationInterdit
                  "
                >
                  <Icon
                    v-if="titreTypeEtapeTypeNew.creationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <ButtonPlus
                  :disabled="!titreTypeEtapeTypeNewActive"
                  @click="titreTypeEtapeTypeNewUpdate"
                />
              </td>
            </tr>

            <tr
              v-for="ttet in administration.titresTypesEtapesTypes"
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
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeEtapeTypeUpdate(
                      ttet.titreType.id,
                      ttet.etapeType.id,
                      ttet.lectureInterdit,
                      ttet.modificationInterdit,
                      ttet.creationInterdit,
                      'lecture'
                    )
                  "
                >
                  <Icon v-if="ttet.lectureInterdit" name="checkbox" size="M" />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeEtapeTypeUpdate(
                      ttet.titreType.id,
                      ttet.etapeType.id,
                      ttet.lectureInterdit,
                      ttet.modificationInterdit,
                      ttet.creationInterdit,
                      'modification'
                    )
                  "
                >
                  <Icon
                    v-if="ttet.modificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    titreTypeEtapeTypeUpdate(
                      ttet.titreType.id,
                      ttet.etapeType.id,
                      ttet.lectureInterdit,
                      ttet.modificationInterdit,
                      ttet.creationInterdit,
                      'creation'
                    )
                  "
                >
                  <Icon v-if="ttet.creationInterdit" name="checkbox" size="M" />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td />
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div class="mb-xxl">
      <h3>Restriction de la visibilité et de l'édition des activités</h3>

      <div class="h6">
        <p class="mb-s">
          Par défaut, un utilisateur d'une administration gestionnaire ou locale
          peut voir et modifier les activités des titres.
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
              <th />
            </tr>
            <tr>
              <td>
                <select
                  v-model="activiteTypeNew.activiteTypeId"
                  class="py-xs px-s mr-s"
                >
                  <option
                    v-for="activiteType in activitesTypes"
                    :key="activiteType.id"
                    :value="activiteType.id"
                  >
                    {{ activiteType.id.toUpperCase() }} {{ activiteType.nom }}
                  </option>
                </select>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="!activiteTypeNew.activiteTypeId"
                  @click="
                    activiteTypeNew.lectureInterdit =
                      !activiteTypeNew.lectureInterdit
                  "
                >
                  <Icon
                    v-if="activiteTypeNew.lectureInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  :disabled="!activiteTypeNew.activiteTypeId"
                  @click="
                    activiteTypeNew.modificationInterdit =
                      !activiteTypeNew.modificationInterdit
                  "
                >
                  <Icon
                    v-if="activiteTypeNew.modificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <ButtonPlus
                  :disabled="!activiteTypeNewActive"
                  @click="activiteTypeNewUpdate"
                />
              </td>
            </tr>
            <tr
              v-for="activiteType in administration.activitesTypes"
              :key="activiteType.id"
            >
              <td>
                <span class="cap-first"
                  >{{ activiteType.nom }} ({{ activiteType.id.toUpperCase() }})
                </span>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    activiteTypeUpdate(
                      activiteType.id,
                      activiteType.lectureInterdit,
                      activiteType.modificationInterdit,
                      'lectureInterdit'
                    )
                  "
                >
                  <Icon
                    v-if="activiteType.lectureInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td>
                <button
                  class="btn p-xs rnd-xs"
                  @click="
                    activiteTypeUpdate(
                      activiteType.id,
                      activiteType.lectureInterdit,
                      activiteType.modificationInterdit,
                      'modificationInterdit'
                    )
                  "
                >
                  <Icon
                    v-if="activiteType.modificationInterdit"
                    name="checkbox"
                    size="M"
                  />
                  <Icon v-else name="checkbox-blank" size="M" />
                </button>
              </td>
              <td />
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CaminoDomaine from '../_common/domaine.vue'
import Statut from '../_common/statut.vue'
import ButtonPlus from '../_ui/button-plus.vue'
import Icon from '../_ui/icon.vue'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'
export default {
  components: {
    Icon,
    CaminoDomaine,
    Statut,
    ButtonPlus
  },

  props: {
    administration: { type: Object, required: true }
  },

  data() {
    return {
      titreTypeNew: {
        domaineId: null,
        titreTypeTypeId: null,
        gestionnaire: false,
        associee: false
      },
      titreTypeTitreStatutNew: {
        domaineId: null,
        titreTypeTypeId: null,
        titreStatutId: null,
        titresModificationInterdit: false,
        demarchesModificationInterdit: false,
        etapesModificationInterdit: false
      },
      titreTypeEtapeTypeNew: {
        domaineId: null,
        titreTypeTypeId: null,
        etapeTypeId: null,
        lectureInterdit: false,
        modificationInterdit: false,
        creationInterdit: false
      },
      activiteTypeNew: {
        activiteTypeId: null,
        lectureInterdit: false,
        modificationInterdit: false
      }
    }
  },

  computed: {
    user() {
      return this.$store.state.user.element
    },

    domaines() {
      return this.$store.state.administration.metas.domaines
    },

    titresStatuts() {
      return TitresStatuts
    },

    etapesTypes() {
      return this.$store.state.administration.metas.etapesTypes
    },

    activitesTypes() {
      return this.$store.state.administration.metas.activitesTypes
    },

    loaded() {
      return !!this.administration
    },

    titreTypeNewTypes() {
      if (!this.titreTypeNew.domaineId) {
        return []
      }

      const domaine = this.domaines.find(
        d => d.id === this.titreTypeNew.domaineId
      )

      return domaine.titresTypes
    },

    titreTypeTitreStatutNewTypes() {
      if (!this.titreTypeTitreStatutNew.domaineId) {
        return []
      }

      const domaine = this.domaines.find(
        d => d.id === this.titreTypeTitreStatutNew.domaineId
      )

      return domaine.titresTypes
    },

    titreTypeEtapeTypeNewTypes() {
      if (!this.titreTypeEtapeTypeNew.domaineId) {
        return []
      }

      const domaine = this.domaines.find(
        d => d.id === this.titreTypeEtapeTypeNew.domaineId
      )

      return domaine.titresTypes
    },

    titreTypeNewActive() {
      return (
        this.titreTypeNew.titreTypeTypeId &&
        this.titreTypeNew.domaineId &&
        (this.titreTypeNew.gestionnaire || this.titreTypeNew.associee)
      )
    },

    titreTypeTitreStatutNewActive() {
      return (
        this.titreTypeTitreStatutNew.domaineId &&
        this.titreTypeTitreStatutNew.titreTypeTypeId &&
        this.titreTypeTitreStatutNew.titreStatutId &&
        (this.titreTypeTitreStatutNew.titresModificationInterdit ||
          this.titreTypeTitreStatutNew.demarchesModificationInterdit ||
          this.titreTypeTitreStatutNew.etapesModificationInterdit)
      )
    },

    titreTypeEtapeTypeNewActive() {
      return (
        this.titreTypeEtapeTypeNew.domaineId &&
        this.titreTypeEtapeTypeNew.titreTypeTypeId &&
        this.titreTypeEtapeTypeNew.etapeTypeId &&
        (this.titreTypeEtapeTypeNew.lectureInterdit ||
          this.titreTypeEtapeTypeNew.modificationInterdit ||
          this.titreTypeEtapeTypeNew.creationInterdit)
      )
    },

    activiteTypeNewActive() {
      return (
        this.activiteTypeNew.activiteTypeId &&
        (this.activiteTypeNew.lectureInterdit ||
          this.activiteTypeNew.modificationInterdit)
      )
    }
  },

  created() {
    this.get()
  },

  methods: {
    async get() {
      await this.$store.dispatch('administration/permissionsInit')
    },

    getTitreStatut(statutId) {
      return TitresStatuts[statutId]
    },

    async titreTypeUpdate(titreTypeId, gestionnaire, associee, type) {
      if (type === 'gestionnaire') {
        gestionnaire = !gestionnaire
      } else if (type === 'associee') {
        associee = !associee
      }

      await this.$store.dispatch('administration/titreTypeUpdate', {
        administrationId: this.administration.id,
        titreTypeId,
        gestionnaire,
        associee
      })
    },

    async titreTypeTitreStatutUpdate(
      titreTypeId,
      titreStatutId,
      titresModificationInterdit,
      demarchesModificationInterdit,
      etapesModificationInterdit,
      type
    ) {
      if (type === 'titres') {
        titresModificationInterdit = !titresModificationInterdit
      } else if (type === 'demarches') {
        demarchesModificationInterdit = !demarchesModificationInterdit
      } else if (type === 'etapes') {
        etapesModificationInterdit = !etapesModificationInterdit
      }

      await this.$store.dispatch('administration/titreTypeTitreStatutUpdate', {
        administrationId: this.administration.id,
        titreTypeId,
        titreStatutId,
        titresModificationInterdit,
        demarchesModificationInterdit,
        etapesModificationInterdit
      })
    },

    async titreTypeEtapeTypeUpdate(
      titreTypeId,
      etapeTypeId,
      lectureInterdit,
      modificationInterdit,
      creationInterdit,
      type
    ) {
      if (type === 'lecture') {
        lectureInterdit = !lectureInterdit
      } else if (type === 'modification') {
        modificationInterdit = !modificationInterdit
      } else if (type === 'creation') {
        creationInterdit = !creationInterdit
      }

      await this.$store.dispatch('administration/titresTypeEtapeTypeUpdate', {
        administrationId: this.administration.id,
        titreTypeId,
        etapeTypeId,
        lectureInterdit,
        modificationInterdit,
        creationInterdit
      })
    },

    async activiteTypeUpdate(
      activiteTypeId,
      lectureInterdit,
      modificationInterdit,
      type
    ) {
      if (type === 'lectureInterdit') {
        lectureInterdit = !lectureInterdit
      } else if (type === 'modificationInterdit') {
        modificationInterdit = !modificationInterdit
      }

      await this.$store.dispatch('administration/activiteTypeUpdate', {
        administrationId: this.administration.id,
        activiteTypeId,
        lectureInterdit,
        modificationInterdit
      })
    },

    titreTypeNewUpdate() {
      if (this.titreTypeNewActive) {
        this.titreTypeUpdate(
          `${this.titreTypeNew.titreTypeTypeId}${this.titreTypeNew.domaineId}`,
          this.titreTypeNew.gestionnaire,
          this.titreTypeNew.associee
        )

        this.titreTypeNew = {
          domaineId: null,
          titreTypeTypeId: null,
          gestionnaire: false,
          associee: false
        }
      }
    },

    titreTypeTitreStatutNewUpdate() {
      if (this.titreTypeTitreStatutNewActive) {
        this.titreTypeTitreStatutUpdate(
          `${this.titreTypeTitreStatutNew.titreTypeTypeId}${this.titreTypeTitreStatutNew.domaineId}`,
          this.titreTypeTitreStatutNew.titreStatutId,
          this.titreTypeTitreStatutNew.titresModificationInterdit,
          this.titreTypeTitreStatutNew.demarchesModificationInterdit,
          this.titreTypeTitreStatutNew.etapesModificationInterdit
        )

        this.titreTypeTitreStatutNew = {
          domaineId: null,
          titreTypeTypeId: null,
          titreStatutId: null,
          titresModificationInterdit: false,
          demarchesModificationInterdit: false,
          etapesModificationInterdit: false
        }
      }
    },

    titreTypeEtapeTypeNewUpdate() {
      if (this.titreTypeEtapeTypeNewActive) {
        this.titreTypeEtapeTypeUpdate(
          `${this.titreTypeEtapeTypeNew.titreTypeTypeId}${this.titreTypeEtapeTypeNew.domaineId}`,
          this.titreTypeEtapeTypeNew.etapeTypeId,
          this.titreTypeEtapeTypeNew.lectureInterdit,
          this.titreTypeEtapeTypeNew.modificationInterdit,
          this.titreTypeEtapeTypeNew.creationInterdit
        )

        this.titreTypeEtapeTypeNew = {
          domaineId: null,
          titreTypeTypeId: null,
          etapeTypeId: null,
          lectureInterdit: false,
          modificationInterdit: false,
          creationInterdit: false
        }
      }
    },

    activiteTypeNewUpdate() {
      if (this.activiteTypeNewActive) {
        this.activiteTypeUpdate(
          this.activiteTypeNew.activiteTypeId,
          this.activiteTypeNew.lectureInterdit,
          this.activiteTypeNew.modificationInterdit
        )

        this.activiteTypeNew = {
          domaineId: null,
          titreTypeTypeId: null,
          lectureInterdit: false,
          modificationInterdit: false
        }
      }
    }
  }
}
</script>

<style></style>
template
