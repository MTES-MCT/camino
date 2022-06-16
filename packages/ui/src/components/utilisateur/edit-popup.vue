<template>
  <Popup :messages="messages">
    <template #header>
      <h2>
        {{
          action === 'create'
            ? "Création d'un compte utilisateur"
            : 'Modification du compte utilisateur'
        }}
      </h2>
    </template>

    <Loader v-if="!loaded" />
    <div v-else>
      <div v-if="action === 'create'">
        <p>
          Renseignez au moins l'email, le mot de passe, le prénom et le nom.
        </p>
        <hr />
      </div>
      <div v-if="formIsVisible" class="tablet-blobs">
        <div class="mb tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Email</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            v-model="utilisateur.email"
            type="email"
            class="p-s"
            placeholder="Email"
          />
        </div>
      </div>

      <div v-if="action === 'create'">
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Mot de passe</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <input
              v-model="utilisateur.motDePasse"
              type="password"
              class="p-s mb-s"
              placeholder="Mot de passe"
            />
            <p class="h6 mb-0">8 caractères minimum.</p>
          </div>
        </div>
      </div>

      <hr />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Prénom</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            v-model="utilisateur.prenom"
            type="text"
            class="p-s"
            placeholder="Prénom"
          />
        </div>
      </div>

      <hr />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Nom</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            v-model="utilisateur.nom"
            type="text"
            class="p-s"
            placeholder="Nom"
          />
        </div>
      </div>

      <hr />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Téléphone fixe</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            v-model="utilisateur.telephoneFixe"
            type="text"
            class="p-s"
            placeholder="0100000000"
          />
        </div>
      </div>

      <hr />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Téléphone mobile</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <input
            v-model="utilisateur.telephoneMobile"
            type="text"
            class="p-s"
            placeholder="0100000000"
          />
        </div>
      </div>

      <div v-if="utilisateur.permissionModification">
        <hr />
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Rôles</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <ul class="list-inline mb-0 tablet-pt-s">
              <li v-for="role in roles" :key="role" class="mb-xs">
                <button
                  :class="{
                    active: utilisateur.role === role
                  }"
                  class="btn-flash small py-xs px-s pill cap-first mr-xs"
                  @click="roleToggle(role)"
                >
                  {{ role }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="utilisateurIsEntrepriseOuBureauDEtude">
          <hr />
          <h3 class="mb-s">Entreprises</h3>
          <div v-for="(entreprise, n) in utilisateur.entreprises" :key="n">
            <div
              class="flex full-x"
              :class="{
                'mb-s': utilisateurEntreprisesLength,
                mb: !utilisateurEntreprisesLength
              }"
            >
              <select
                id="cmn-utilisateur-edit-popup-entreprise-select"
                v-model="utilisateur.entreprises[n]"
                class="p-s mr-s"
              >
                <option
                  v-for="e in entreprises"
                  :key="e.id"
                  :value="{ id: e.id }"
                  :disabled="
                    utilisateur.entreprises.find(({ id }) => id === e.id)
                  "
                >
                  {{ e.nom }}
                </option>
              </select>
              <div class="flex-right">
                <button
                  class="btn py-s px-m rnd-xs"
                  @click="entrepriseRemove(n)"
                >
                  <Icon name="minus" size="M" />
                </button>
              </div>
            </div>
          </div>

          <button
            v-if="!utilisateur.entreprises.some(({ id }) => id === '')"
            id="cmn-utilisateur-edit-popup-entreprise-button-ajouter"
            class="btn small rnd-xs py-s px-m full-x flex mb"
            @click="entrepriseAdd"
          >
            <span class="mt-xxs">Ajouter une entreprise</span>
            <Icon name="plus" size="M" class="flex-right" />
          </button>
        </div>

        <div v-if="utilisateurIsAdministration">
          <hr />
          <h3 class="mb-s">Administration</h3>

          <div class="flex full-x mb">
            <select v-model="utilisateur.administrationId" class="p-s mr-s">
              <option v-for="a in administrations" :key="a.id" :value="a.id">
                {{ `${a.abreviation}` }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <hr />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Newsletter</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <label class="tablet-pt-s">
            <input
              v-model="utilisateur.newsletter"
              type="checkbox"
              class="p-s mt-s mb-s mr-xs"
            />
            <span v-if="utilisateur.newsletter">Inscrit</span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="!loading" class="tablet-blobs">
        <div class="tablet-blob-1-3 mb tablet-mb-0">
          <button class="btn-border rnd-xs p-s full-x" @click="cancel">
            Annuler
          </button>
        </div>
        <div class="tablet-blob-2-3">
          <button
            id="cmn-utilisateur-edit-popup-button-enregistrer"
            ref="save-button"
            :disabled="!complete"
            :class="{ disabled: !complete }"
            class="btn btn-primary"
            @click="save"
          >
            Enregistrer
          </button>
        </div>
      </div>
      <div v-else class="p-s full-x bold">Enregistrement en cours…</div>
    </template>
  </Popup>
</template>

<script>
import Popup from '../_ui/popup.vue'
import Loader from '../_ui/loader.vue'
import { sortedAdministrations } from 'camino-common/src/administrations'
import Icon from '../_ui/icon.vue'
import {
  isAdministration,
  isAdministrationAdmin,
  isBureauDEtudes,
  isEntreprise,
  isSuper,
  ROLES
} from 'camino-common/src/roles'

export default {
  name: 'CaminoUtilisateurEditPopup',

  components: { Icon, Popup, Loader },

  props: {
    utilisateur: {
      type: Object,
      default: () => ({})
    },

    action: {
      type: String,
      default: 'edit',
      validator: val => ['edit', 'create'].includes(val)
    }
  },

  data() {
    return {
      cgu: null
    }
  },

  computed: {
    loading() {
      return this.$store.state.popup.loading
    },

    loaded() {
      return this.$store.state.utilisateur.metasLoaded
    },

    messages() {
      return this.$store.state.popup.messages
    },

    roles() {
      return ROLES
    },

    entreprises() {
      return this.$store.state.utilisateur.metas.entreprises
    },

    administrations() {
      return sortedAdministrations
    },

    user() {
      return this.$store.state.user.element
    },

    complete() {
      const formComplete =
        this.action === 'create'
          ? this.utilisateur.nom &&
            this.utilisateur.prenom &&
            this.utilisateur.email &&
            this.utilisateur.motDePasse
          : this.utilisateur.nom &&
            this.utilisateur.prenom &&
            this.utilisateur.id &&
            this.utilisateur.email

      if (!formComplete) {
        return false
      }

      if (
        this.utilisateurIsEntrepriseOuBureauDEtude &&
        !this.utilisateurEntreprisesLength
      ) {
        return false
      }

      if (
        this.utilisateurIsAdministration &&
        !this.utilisateur.administrationId
      ) {
        return false
      }

      return true
    },

    utilisateurEntreprisesLength() {
      return this.utilisateur.entreprises.filter(({ id }) => id).length
    },

    utilisateurIsEntrepriseOuBureauDEtude() {
      return isEntreprise(this.utilisateur) || isBureauDEtudes(this.utilisateur)
    },

    utilisateurIsAdministration() {
      return isAdministration(this.utilisateur)
    }
  },

  created() {
    this.get()
    document.addEventListener('keyup', this.keyup)
  },

  beforeUnmount() {
    document.removeEventListener('keyup', this.keyup)
  },

  unmounted() {
    this.$store.commit('utilisateur/metasReset')
  },

  methods: {
    async get() {
      await this.$store.dispatch('utilisateur/init')
    },

    async save() {
      if (this.complete) {
        const utilisateur = JSON.parse(JSON.stringify(this.utilisateur))

        delete utilisateur.permissionModification
        delete utilisateur.entreprisesCreation
        delete utilisateur.utilisateursCreation

        if (!this.utilisateurIsAdministration) {
          utilisateur.administrationId = undefined
        }

        if (this.utilisateurIsEntrepriseOuBureauDEtude) {
          utilisateur.entreprises = utilisateur.entreprises.filter(
            ({ id }) => id
          )
        } else {
          utilisateur.entreprises = []
        }

        if (this.action === 'create') {
          if (!utilisateur.role) {
            utilisateur.role = 'defaut'
          }

          await this.$store.dispatch('utilisateur/add', utilisateur)
        } else {
          await this.$store.dispatch('utilisateur/update', utilisateur)
        }
      }
    },

    cancel() {
      this.errorsRemove()
      this.$store.commit('popupClose')
    },

    keyup(e) {
      if ((e.which || e.keyCode) === 27) {
        this.cancel()
      } else if ((e.which || e.keyCode) === 13) {
        if (this.complete) {
          this.$refs['save-button'].focus()
          this.save()
        }
      }
    },

    errorsRemove() {
      this.$store.commit('popupMessagesRemove')
    },

    roleToggle(role) {
      this.utilisateur.role = role
    },

    entrepriseAdd() {
      this.utilisateur.entreprises.push({ id: '' })
    },

    entrepriseRemove(index) {
      this.utilisateur.entreprises.splice(index, 1)
    },

    formIsVisible(user) {
      return isSuper(user) || isAdministrationAdmin(user)
    }
  }
}
</script>
