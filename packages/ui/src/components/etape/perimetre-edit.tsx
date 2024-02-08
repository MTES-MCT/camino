import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { HeritageEdit } from './heritage-edit'
import { PerimetreImportPopup } from './perimetre-import-popup'
import { FunctionalComponent, HTMLAttributes, computed, onMounted, ref, watch } from 'vue'
import { DsfrButton } from '../_ui/dsfr-button'
import { ApiClient } from '@/api/api-client'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DsfrPerimetre } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Alert } from '../_ui/alert'
import { KM2 } from 'camino-common/src/number'
import { EtapeWithHeritage, EtapeFondamentale } from 'camino-common/src/etape'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId'>
  etape: {
    typeId: EtapeTypeId
    heritageProps: { perimetre: EtapeWithHeritage<'perimetre', Pick<EtapeFondamentale, 'geojson4326Perimetre' | 'surface' | 'geojson4326Points' | 'type' | 'date'>>['heritageProps']['perimetre'] }
    geojson4326Perimetre: FeatureMultiPolygon | null
    geojson4326Points: FeatureCollectionPoints | null
    surface: KM2 | null
  }
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  completeUpdate: (complete: boolean) => void
  onEtapeChange: (geojsonInformations: GeojsonInformations) => void
  initTab?: 'points' | 'carte'
}

type DisplayPerimetreProps = {
  apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>
  etape: {
    geojson4326Perimetre: FeatureMultiPolygon | null | undefined
    geojson4326Points: FeatureCollectionPoints | null
  }
  surface: KM2 | null
  titreSlug: TitreSlug
  initTab?: 'points' | 'carte'
  class?: HTMLAttributes['class']
}

const DisplayPerimetre: FunctionalComponent<DisplayPerimetreProps> = props => {
  if (isNotNullNorUndefined(props.etape.geojson4326Perimetre)) {
    return (
      <div>
        <DsfrPerimetre
          calculateNeighbours={false}
          apiClient={props.apiClient}
          perimetre={{ geojson4326_points: props.etape.geojson4326Points, geojson4326_perimetre: props.etape.geojson4326Perimetre }}
          titreSlug={props.titreSlug}
          initTab={props.initTab ?? 'carte'}
        />

        {props.surface ? <div class="fr-text--md">Surface : {props.surface} Km²</div> : null}
      </div>
    )
  }

  return null
}

export const PerimetreEdit = caminoDefineComponent<Props>(['etape', 'apiClient', 'titreTypeId', 'titreSlug', 'completeUpdate', 'onEtapeChange', 'initTab'], props => {
  const importPopup = ref<boolean>(false)
  const importError = ref<boolean>(false)

  const complete = computed(() => {
    return props.etape.typeId !== 'mfr' || props.etape.geojson4326Perimetre !== null
  })

  const completeUpdate = () => {
    props.completeUpdate(complete.value)
  }

  watch(complete, () => completeUpdate())

  onMounted(() => {
    completeUpdate()
  })

  const openPopup = () => {
    importPopup.value = true
  }

  const closePopup = () => {
    importPopup.value = false
  }

  const surface = ref<KM2 | null>(props.etape.surface)

  const result = (value: GeojsonInformations | Error) => {
    if ('geojson4326_perimetre' in value) {
      importError.value = false
      surface.value = value.surface
      props.onEtapeChange(value)
    } else {
      importError.value = true
      console.error(value)
    }
  }

  return () => (
    <div class="dsfr">
      <HeritageEdit
        prop={props.etape.heritageProps.perimetre}
        propId="perimetre"
        write={() => (
          <div>
            <DsfrButton onClick={openPopup} title="Importer depuis un fichier…" />
            {importError.value ? <Alert class="fr-mt-2w" title="Une erreur est survenue lors de l’import de votre fichier." type="error" description="Vérifiez le contenu de votre fichier" /> : null}

            <DisplayPerimetre class="fr-mt-2w" apiClient={props.apiClient} etape={props.etape} titreSlug={props.titreSlug} initTab={props.initTab} surface={surface.value} />
          </div>
        )}
        read={heritage => (
          <DisplayPerimetre
            apiClient={props.apiClient}
            etape={{ ...props.etape, geojson4326Perimetre: heritage?.geojson4326Perimetre ?? null, geojson4326Points: heritage?.geojson4326Points ?? null }}
            titreSlug={props.titreSlug}
            initTab={props.initTab}
            surface={heritage?.surface ?? null}
          />
        )}
      />

      {importPopup.value ? <PerimetreImportPopup close={closePopup} result={result} apiClient={props.apiClient} titreTypeId={props.titreTypeId} titreSlug={props.titreSlug} /> : null}
    </div>
  )
})