<template>
  <div>
    <LoadingData v-if="linkConfig" v-slot="{ item }" :data="titresFrom">
      <div v-if="item.length || canLink">
        <h5>
          Titre{{ linkConfig.count === 'multiple' ? 's' : '' }} à l’origine de
          ce titre
        </h5>
        <div v-if="mode === 'edit'">
          <Loading :data="titresLinking">
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
          </Loading>
        </div>

        <div v-else class="flex flex-center">
          <ul class="list-inline" style="margin-bottom: 0">
            <li v-for="titreFrom in item" :key="titreFrom.id" class="mr-xs">
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
  TitreLink,
  TitresLinkConfig,
  LoadLinkableTitres,
  LinkTitres,
  LoadLinkedTitres
} from './pure-titres-link.type'
import { TitreTypeId } from 'camino-common/src/titresTypes'
import { User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/administrations'
import PureTitresLink from './pure-titres-link.vue'
import { AsyncData, AsyncProcess } from '@/api/client-rest'
import LoadingData from '@/components/_ui/pure-loader-data.vue'
import Loading from '@/components/_ui/pure-loader.vue'
import Icon from '@/components/_ui/icon.vue'
import { DemarcheTypeId } from 'camino-common/src/demarchesTypes'

const props = defineProps<{
  user: User
  titre: {
    id: string
    typeId: TitreTypeId
    administrations: { id: AdministrationId }[]
    demarches: { typeId: DemarcheTypeId }[]
  }
  loadLinkedTitres: LoadLinkedTitres
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
const titresLinking = ref<AsyncProcess>({ status: 'LOADED' })
const selectedTitres = ref<TitreLink[]>([])
const titresFrom = ref<AsyncData<TitreLink[]>>({ status: 'LOADING' })

const linkConfig = computed(() =>
  getLinkConfig(props.titre.typeId, props.titre.demarches)
)

onMounted(async () => {
  await init()
})

watch(
  () => props.titre,
  async _ => {
    titresFrom.value = { status: 'LOADED', value: [] }
    await init()
  }
)

const init = async () => {
  if (linkConfig.value) {
    try {
      const titres = await props.loadLinkedTitres(props.titre.id)
      titresFrom.value = { status: 'LOADED', value: titres }
    } catch (e: any) {
      titresFrom.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened'
      }
    }
  }
}

const canLink = computed<boolean>(() => {
  // On ne peut pas lier si ce type de titre n’accepte pas de liaison
  if (!linkConfig.value) {
    return false
  }

  // On peut lier que si on a les droits
  const administrationIds =
    props.titre.administrations?.map(({ id }) => id) ?? []
  return canLinkTitres(props.user, administrationIds)
})

const titreLinkConfig = computed<TitresLinkConfig | null>(() => {
  if (titresFrom.value.status !== 'LOADED') {
    return null
  }

  const titreFromIds = titresFrom.value.value.map(({ id }) => id)
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
  titresLinking.value = { status: 'LOADING' }
  try {
    await props.linkTitres(
      props.titre.id,
      selectedTitres.value.map(({ id }) => id)
    )
    titresLinking.value = { status: 'LOADED' }
    mode.value = 'read'
    titresFrom.value = { status: 'LOADED', value: selectedTitres.value }
  } catch (e: any) {
    titresLinking.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
}
</script>
