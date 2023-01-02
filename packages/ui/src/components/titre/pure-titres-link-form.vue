<template>
  <div>
    <LoadingData v-slot="{ item }" :data="titresLinks">
      <div v-if="item.amont.length || canLink">
        <h5>
          Titre{{ linkConfig && linkConfig.count === 'multiple' ? 's' : '' }} à
          l’origine de ce titre
        </h5>
        <div v-if="mode === 'edit'">
          <PureTitresLink
            v-if="titreLinkConfig"
            :config="titreLinkConfig"
            :loadLinkableTitres="
              loadLinkableTitres(titre.typeId, titre.demarches)
            "
            @onSelectedTitres="onSelectedTitres"
          />
          <div class="flex mt-m" style="flex-direction: row-reverse">
            <button
              class="btn-primary ml-s"
              style="flex: 0 1 min-content"
              @click="saveLink"
            >
              Enregistrer
            </button>
            <button
              class="btn-secondary"
              style="flex: 0 1 min-content"
              @click="mode = 'read'"
            >
              Annuler
            </button>
          </div>
        </div>

        <div v-else class="flex flex-center">
          <ul class="list-inline" style="margin-bottom: 0">
            <li
              v-for="titreFrom in item.amont"
              :key="titreFrom.id"
              class="mr-xs"
            >
              <router-link
                :to="{ name: 'titre', params: { id: titreFrom.id } }"
                class="btn-border small p-s rnd-xs mr-xs"
              >
                <span class="mr-xs">{{ titreFrom.nom }}</span>
              </router-link>
            </li>
          </ul>

          <button
            v-if="canLink"
            class="btn-alt p-xs rnd-s"
            title="modifie les titres liés"
            @click="mode = 'edit'"
          >
            <Icon size="M" name="pencil" />
          </button>
        </div>
      </div>

      <div v-if="item.aval.length">
        <h5>Titre{{ item.aval.length > 1 ? 's' : '' }} issu de ce titre</h5>
        <div class="flex flex-center">
          <ul class="list-inline" style="margin-bottom: 0">
            <li v-for="titreTo in item.aval" :key="titreTo.id" class="mr-xs">
              <router-link
                :to="{ name: 'titre', params: { id: titreTo.id } }"
                class="btn-border small p-s rnd-xs mr-xs"
              >
                <span class="mr-xs">{{ titreTo.nom }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </LoadingData>
  </div>
</template>

<script lang="ts" setup>
import {
  canLinkTitres,
  getLinkConfig
} from 'camino-common/src/permissions/titres'
import { computed, onMounted, ref, watch } from 'vue'
import {
  TitresLinkConfig,
  LoadLinkableTitres,
  LinkTitres,
  LoadTitreLinks
} from './pure-titres-link.type'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import PureTitresLink from './pure-titres-link.vue'
import { AsyncData } from '@/api/client-rest'
import LoadingData from '@/components/_ui/pure-loader.vue'
import { Icon } from '@/components/_ui/icon'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreLink, TitreLinks } from 'camino-common/src/titres'

const props = defineProps<{
  user: User
  titre: {
    id: string
    typeId: TitreTypeId
    administrations: AdministrationId[]
    demarches: { typeId: DemarcheTypeId }[]
  }
  loadTitreLinks: LoadTitreLinks
  loadLinkableTitres: (
    titreTypeId: TitreTypeId,
    demarches: { typeId: DemarcheTypeId }[]
  ) => LoadLinkableTitres
  linkTitres: LinkTitres
}>()

const emit = defineEmits<{
  (e: 'onSelectedTitre', titre: TitreLink | null): void
  (e: 'onSelectedTitres', titres: TitreLink[]): void
}>()

const mode = ref<'read' | 'edit'>('read')
const selectedTitres = ref<TitreLink[]>([])
const titresLinks = ref<AsyncData<TitreLinks>>({ status: 'LOADING' })

const linkConfig = computed(() =>
  getLinkConfig(props.titre.typeId, props.titre.demarches)
)

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
    const result = await props.loadTitreLinks(props.titre.id)
    titresLinks.value = { status: 'LOADED', value: result }
  } catch (e: any) {
    titresLinks.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
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
      selectedTitreId: titreFromIds.length === 1 ? titreFromIds[0] : null
    }
  }

  return {
    type: 'multiple',
    selectedTitreIds: titreFromIds
  }
})

const onSelectedTitres = (titres: TitreLink[]) => {
  selectedTitres.value = titres
}

const saveLink = async () => {
  titresLinks.value = { status: 'LOADING' }
  try {
    const links = await props.linkTitres(
      props.titre.id,
      selectedTitres.value.map(({ id }) => id)
    )
    mode.value = 'read'
    titresLinks.value = {
      status: 'LOADED',
      value: links
    }
  } catch (e: any) {
    titresLinks.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
}
</script>
