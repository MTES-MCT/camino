import { GetResultatMiseEnConcurrence } from 'camino-common/src/demarche'
import { computed, defineComponent, watch } from 'vue'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { useState } from '@/utils/vue-tsx-utils'
import { DsfrButton, DsfrLink } from '../_ui/dsfr-button'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { DsfrPerimetre, TabId } from '../_common/dsfr-perimetre'
import { DsfrInput } from '../_ui/dsfr-input'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { KM2 } from 'camino-common/src/number'
import { FeatureMultiPolygon, FeatureCollectionPoints, FeatureCollectionForages, equalGeojson } from 'camino-common/src/perimetre'
import { GEO_SYSTEME_IDS, GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { Alert } from '../_ui/alert'
import { ETAPES_TYPES, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { CaminoDate, getCurrent } from 'camino-common/src/date'
import { ApiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { capitalize } from 'camino-common/src/strings'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { ETAPES_STATUTS, EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { User } from 'camino-common/src/roles'
import { ETAPE_IS_NOT_BROUILLON, EtapeDocument, TempEtapeDocument } from 'camino-common/src/etape'
import { EtapeDocumentsEdit } from '../etape/etape-documents-edit'

export type Props = {
  apiClient: Pick<ApiClient, 'getEtapesTypesEtapesStatuts' | 'etapeCreer' | 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  initTab?: TabId
  entreprises: Entreprise[]
  initDate?: CaminoDate
  initDecision?: 'acc' | 'rej'
  pivot: GetResultatMiseEnConcurrence
  user: User
}

export const ResultatMiseEnConcurrence = defineComponent<Props>(props => {
  const [decision, setDecision] = useState<'acc' | 'rej' | null>(props.initDecision ?? null)
  const [updatePerimetre, setUpdatePerimetre] = useState<'origin' | 'origin_without_satellite' | 'custom' | null>(null)
  const [date, setDate] = useState<CaminoDate | null>(props.initDate ?? getCurrent())
  const [possibleEtapes, setPossibleEtapes] = useState<AsyncData<boolean>>({ status: 'LOADING' })
  const [etapeCreation, setEtapeCreation] = useState<AsyncData<boolean>>({ status: 'LOADED', value: true })
  const [document, setDocument] = useState<(EtapeDocument | TempEtapeDocument)[]>([])
  const entreprisesIndex = props.entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom
    return acc
  }, {})

  const onDocumentUpdate = (documents: (EtapeDocument | TempEtapeDocument)[]): void => {
    setDocument(documents)
  }

  const perimetre = computed<{
    geojson4326_perimetre: FeatureMultiPolygon
    geojson4326_points: FeatureCollectionPoints | null
    geojson_origine_geo_systeme_id: GeoSystemeId
    geojson_origine_perimetre: FeatureMultiPolygon
    geojson_origine_points: FeatureCollectionPoints | null
    geojson4326_forages: FeatureCollectionForages | null
    geojson_origine_forages: FeatureCollectionForages | null
    surface: KM2 | null
  }>(() => {
    const toPerimetre = ({ geojson4326_perimetre, surface }: { geojson4326_perimetre: FeatureMultiPolygon; surface: KM2 }) => ({
      geojson4326_perimetre,
      geojson4326_points: null,
      geojson_origine_geo_systeme_id: GEO_SYSTEME_IDS.WGS84,
      geojson_origine_perimetre: geojson4326_perimetre,
      geojson_origine_points: null,
      geojson4326_forages: null,
      geojson_origine_forages: null,
      surface,
    })

    if (updatePerimetre.value === 'origin_without_satellite') {
      const { geojson4326_perimetre } = props.pivot.perimetreSansSatellite
      if (isNotNullNorUndefined(geojson4326_perimetre)) {
        return toPerimetre({ ...props.pivot.perimetreSansSatellite, geojson4326_perimetre })
      } else {
        throw Error("L'option Sans satellite n'est pas possible car le périmètre est vide")
      }
    }

    return toPerimetre(props.pivot.perimetreTotal)
  })

  watch(
    date,
    async () => {
      setPossibleEtapes({ status: 'LOADING' })
      if (isNullOrUndefined(date.value)) {
        setPossibleEtapes({ status: 'ERROR', message: 'Veuiller sélectionner une date valide' })
      } else {
        const newEtapeTypesAndStatuts = await props.apiClient.getEtapesTypesEtapesStatuts(props.pivot.demarcheId, null, date.value)
        if ('message' in newEtapeTypesAndStatuts) {
          setPossibleEtapes({
            status: 'NEW_ERROR',
            error: newEtapeTypesAndStatuts,
          })
        } else {
          if (isNotNullNorUndefined(newEtapeTypesAndStatuts[ETAPES_TYPES.resultatMiseEnConcurrence])) {
            setPossibleEtapes({ status: 'LOADED', value: true })
          } else {
            setPossibleEtapes({ status: 'ERROR', message: `La date sélectionnée ne permet pas de créer l'étape ${EtapesTypes[ETAPES_TYPES.resultatMiseEnConcurrence].nom}` })
          }
        }
      }
    },
    { immediate: true }
  )

  const creerEtape = async () => {
    if (isNullOrUndefined(date.value) || isNullOrUndefined(decision.value)) {
      return
    }

    setEtapeCreation({ status: 'LOADING' })
    try {
      await props.apiClient.etapeCreer({
        statutId: decision.value,
        date: date.value,
        typeId: ETAPES_TYPES.resultatMiseEnConcurrence,
        amodiataireIds: [],
        contenu: {},
        dateDebut: null,
        dateFin: null,
        duree: null,
        entrepriseDocumentIds: [],
        etapeAvis: [],
        etapeDocuments: document.value.filter(isNotNullNorUndefined).filter(value => 'temp_document_name' in value),
        substances: [],
        titulaireIds: [],
        titreDemarcheId: props.pivot.demarcheId,
        note: { valeur: '', is_avertissement: false },
        heritageProps: {
          amodiataires: { actif: true },
          dateDebut: { actif: true },
          dateFin: { actif: true },
          duree: { actif: true },
          perimetre: { actif: decision.value === 'rej' },
          substances: { actif: true },
          titulaires: { actif: true },
        },
        heritageContenu: {},
        geojsonOriginePoints: perimetre.value.geojson_origine_points,
        geojsonOrigineForages: perimetre.value.geojson_origine_forages,
        geojson4326Perimetre: perimetre.value.geojson4326_perimetre,
        geojson4326Points: perimetre.value.geojson4326_points,
        geojsonOrigineGeoSystemeId: perimetre.value.geojson_origine_geo_systeme_id,
        geojsonOriginePerimetre: perimetre.value.geojson_origine_perimetre,
      })
      setEtapeCreation({ status: 'LOADED', value: true })
    } catch (e: any) {
      console.error('error', e)
      setEtapeCreation({
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      })
    }
  }
  // FIXMACHINE 2024-10-15 intégrer ça dans etape-edit-form.ts
  return () => (
    <div>
      <div>
        <DsfrLink to={{ name: 'titre', params: { id: props.pivot.titreSlug } }} disabled={false} title={props.pivot.titreNom} icon={null} />
        <span> {'>'} </span>

        <DsfrLink to={{ name: 'demarche', params: { demarcheId: props.pivot.demarcheId } }} disabled={false} title={capitalize(DemarchesTypes[props.pivot.demarcheTypeId].nom)} icon={null} />
      </div>

      <h1 class="fr-mt-4w">{capitalize(EtapesTypes[ETAPES_TYPES.resultatMiseEnConcurrence].nom)}</h1>

      <DsfrInput
        id="mise_en_concurrence_date"
        required={true}
        class="fr-pb-2w"
        legend={{ main: 'Date' }}
        type={{ type: 'date' }}
        initialValue={date.value}
        valueChanged={(newDate: CaminoDate | null) => setDate(newDate)}
      />
      <LoadingElement
        data={possibleEtapes.value}
        renderItem={() => (
          <>
            <span>
              Pour la demande {props.pivot.titreNom} du titulaire {entreprisesIndex[props.pivot.titulaireId]} quelle est la décision ?
            </span>
            <DsfrInputRadio
              id="mise_en_concurrence_decision"
              legend={{ main: 'Décision' }}
              initialValue={decision.value}
              required={true}
              elements={[ETAPES_STATUTS.ACCEPTE, ETAPES_STATUTS.REJETE].map(status => ({ itemId: status, legend: { main: capitalize(EtapesStatuts[status].nom) } }))}
              valueChanged={setDecision}
            />
            <>
              {decision.value === 'acc' ? (
                <div>
                  <DsfrInputRadio
                    id="mise_en_concurrence_perimetre"
                    required={true}
                    legend={{ main: 'Quel périmètre acceptez-vous ?' }}
                    elements={[
                      { itemId: 'origin', legend: { main: 'Celui de la demande' } },
                      {
                        itemId: 'origin_without_satellite',
                        legend: { main: 'Celui de la demande en excluant celui des concurrents' },
                        disabled:
                          isNullOrUndefined(props.pivot.perimetreSansSatellite.geojson4326_perimetre) ||
                          equalGeojson(props.pivot.perimetreTotal.geojson4326_perimetre.geometry, props.pivot.perimetreSansSatellite.geojson4326_perimetre.geometry),
                      },
                      { itemId: 'custom', legend: { main: 'Personnalisé' } },
                    ]}
                    valueChanged={setUpdatePerimetre}
                  />

                  {isNotNullNorUndefined(updatePerimetre.value) && updatePerimetre.value !== 'custom' ? (
                    <>
                      <DsfrPerimetre
                        class="fr-mt-2w"
                        calculateNeighbours={false}
                        perimetre={perimetre.value}
                        id="perimetre_final"
                        titreSlug={props.pivot.titreSlug}
                        titreTypeId={props.pivot.titreTypeId}
                        initTab={props.initTab ?? 'carte'}
                      />
                    </>
                  ) : null}
                </div>
              ) : null}
              {decision.value === 'acc' && updatePerimetre.value === 'custom' ? (
                <>
                  <Alert
                    title="Personnaliser"
                    type="info"
                    description={
                      <>
                        Pour personnaliser le {EtapesTypes[ETAPES_TYPES.resultatMiseEnConcurrence].nom}, vous pouvez directement éditer l'étape{' '}
                        <DsfrLink
                          to={{ name: 'etapeCreation', params: {}, query: { 'demarche-id': props.pivot.demarcheId } }}
                          title={EtapesTypes[ETAPES_TYPES.resultatMiseEnConcurrence].nom}
                          icon={null}
                          disabled={false}
                        />
                      </>
                    }
                  />
                </>
              ) : null}
            </>
            <EtapeDocumentsEdit
              apiClient={props.apiClient}
              contenu={{}}
              isBrouillon={ETAPE_IS_NOT_BROUILLON}
              user={props.user}
              sdomZoneIds={[]}
              tde={{
                demarcheId: props.pivot.demarcheId,
                demarcheTypeId: props.pivot.demarcheTypeId,
                titreTypeId: props.pivot.titreTypeId,
                firstEtapeDate: props.pivot.firstEtapeDate,
                etapeTypeId: ETAPES_TYPES.resultatMiseEnConcurrence,
              }}
              completeUpdate={onDocumentUpdate}
              etapeId={null}
            />
            {decision.value === 'rej' || (decision.value === 'acc' && updatePerimetre.value !== 'custom' && updatePerimetre.value !== null) ? (
              <div class="fr-mt-2w" style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: '1rem' }}>
                <LoadingElement data={etapeCreation.value} renderItem={() => <></>} />
                <DsfrButton title="Enregistrer" onClick={creerEtape} disabled={etapeCreation.value.status === 'LOADING'} />
              </div>
            ) : null}
          </>
        )}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ResultatMiseEnConcurrence.props = ['initTab', 'pivot', 'entreprises', 'apiClient', 'initDate', 'initDecision', 'user']
