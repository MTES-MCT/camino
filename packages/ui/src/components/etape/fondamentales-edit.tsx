import { caminoDefineComponent, useState } from '@/utils/vue-tsx-utils'
import { dateFormat } from '../../utils/index'
import { DsfrTag } from '../_ui/tag'
import { HeritageEdit } from './heritage-edit'
import { PropDuree } from './prop-duree'
import { AutocompleteEntreprise } from './autocomplete-entreprise'
import { CaminoDate } from 'camino-common/src/date'
import { SubstancesEdit } from './substances-edit'
import { dureeOptionalCheck as titreEtapesDureeOptionalCheck, canEditAmodiataires, canEditTitulaires, canEditDuree, canEditDates } from 'camino-common/src/permissions/titres-etapes'

import { EtapeEntreprise, FullEtapeHeritage, HeritageProp } from 'camino-common/src/etape'
import { DomaineId } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { watch, computed, ref, DeepReadonly } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { DsfrInput } from '../_ui/dsfr-input'

export type EtapeFondamentaleEdit = Pick<FullEtapeHeritage, 'typeId' | 'dateDebut' | 'dateFin' | 'duree' | 'titulaires' | 'amodiataires' | 'substances' | 'duree' | 'heritageProps'>
export interface Props {
  etape: DeepReadonly<EtapeFondamentaleEdit>
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  user: User
  entreprises: Entreprise[]
  completeUpdate: (etape: Props['etape'], complete: boolean) => void
}
export const FondamentalesEdit = caminoDefineComponent<Props>(['etape', 'demarcheTypeId', 'titreTypeId', 'user', 'entreprises', 'completeUpdate'], props => {
  const [editedEtape, setEditedEtape] = useState(props.etape)

  const ans = ref<number>(isNotNullNorUndefined(editedEtape.value.duree) && editedEtape.value.duree > 0 ? Math.floor(editedEtape.value.duree / 12) : 0)
  const mois = ref<number>(isNotNullNorUndefined(editedEtape.value.duree) && editedEtape.value.duree > 0 ? Math.floor(editedEtape.value.duree % 12) : 0)
  // // TODO 2024-04-03 ceci devrait disparaitre le jour où on retravaille l'héritage props
  // watch(() => props.etape, () => {
  //   editedEtape.value = props.etape
  // })

  const entreprisesDisabled = computed<EntrepriseId[]>(() => [...editedEtape.value.amodiataires, ...editedEtape.value.titulaires].map(({ id }) => id))

  const dateDebutChanged = (dateDebut: CaminoDate | null) => {
    setEditedEtape({ ...editedEtape.value, dateDebut })
  }

  const dateFinChanged = (dateFin: CaminoDate | null) => {
    setEditedEtape({ ...editedEtape.value, dateFin })
  }
  const substancesChanged = (substances: DeepReadonly<SubstanceLegaleId[]>) => {
    setEditedEtape({ ...editedEtape.value, substances })
  }
  const updateSubstancesHeritage = (substancesHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'substances' | 'date' | 'typeId'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, substances: substancesHeritage } })
  }

  const updateDureeHeritage = (dureeHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'duree' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, duree: dureeHeritage } })
  }
  const updateDateDebutHeritage = (dateDebutHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'dateDebut' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, dateDebut: dateDebutHeritage } })
  }
  const updateDateFinHeritage = (dateFinHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'dateFin' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, dateFin: dateFinHeritage } })
  }
  const updateTitulairesHeritage = (titulairesHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'titulaires' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, titulaires: titulairesHeritage } })
  }
  const updateAmodiatairesHeritage = (amodiatairesHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'amodiataires' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, amodiataires: amodiatairesHeritage } })
  }

  const dureeOptionalCheck = computed<boolean>(() => {
    return titreEtapesDureeOptionalCheck(editedEtape.value.typeId, props.demarcheTypeId, props.titreTypeId)
  })

  watch(
    () => editedEtape.value,
    () => {
      const complete =
        editedEtape.value.typeId !== ETAPES_TYPES.demande ||
        (editedEtape.value.substances?.filter(substanceId => !!substanceId)?.length > 0 && (dureeOptionalCheck.value || !!ans.value || !!mois.value))

      props.completeUpdate(editedEtape.value, complete)
    },
    { immediate: true }
  )

  const domaineId = computed<DomaineId>(() => getDomaineId(props.titreTypeId))

  const titulairesUpdate = (titulaires: DeepReadonly<EtapeEntreprise[]>) => {
    const newTitulaires = titulaires.map(titulaire => ({
      id: titulaire.id,
      operateur: titulaire.operateur,
    }))
    setEditedEtape({ ...editedEtape.value, titulaires: newTitulaires })
  }

  const amodiatairesUpdate = (amodiataires: DeepReadonly<EtapeEntreprise[]>) => {
    const newAmodiataires = amodiataires.map(amodiataire => ({
      id: amodiataire.id,
      operateur: amodiataire.operateur,
    }))
    setEditedEtape({ ...editedEtape.value, amodiataires: newAmodiataires })
  }

  const getEntrepriseNom = (etapeEntreprise: EtapeEntreprise): string => {
    const entreprise = props.entreprises.find(({ id }) => id === etapeEntreprise.id)

    if (!entreprise) {
      return ''
    }

    return entreprise.nom
  }

  const updateDuree = (): void => {
    setEditedEtape({ ...editedEtape.value, duree: mois.value + ans.value * 12 })
  }

  return () => (
    <div>
      {canEditDuree(props.titreTypeId, props.demarcheTypeId) ? (
        <HeritageEdit
          updateHeritage={updateDureeHeritage}
          prop={props.etape.heritageProps.duree}
          propId="duree"
          write={() => (
            <div style={{ display: 'flex' }}>
              <DsfrInput
                legend={{ main: `Durée (années)${!dureeOptionalCheck.value ? ' *' : ''}` }}
                type={{ type: 'number' }}
                valueChanged={(value: number | null) => {
                  ans.value = value ?? 0
                  updateDuree()
                }}
                initialValue={ans.value}
              />
              <DsfrInput
                legend={{ main: `Durée (mois)${!dureeOptionalCheck.value ? ' *' : ''}` }}
                type={{ type: 'number' }}
                valueChanged={(value: number | null) => {
                  mois.value = value ?? 0
                  updateDuree()
                }}
                initialValue={mois.value}
                class="fr-ml-2w"
              />
            </div>
          )}
          read={heritagePropEtape => (
            <div>
              <PropDuree duree={heritagePropEtape?.duree} />
            </div>
          )}
        />
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, editedEtape.value.typeId, props.user) ? (
        <HeritageEdit
          updateHeritage={updateDateDebutHeritage}
          prop={props.etape.heritageProps.dateDebut}
          propId="dateDebut"
          write={() => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date de début' }} initialValue={props.etape.dateDebut} valueChanged={dateDebutChanged} />}
          read={heritagePropEtape => <div>{dateFormat(heritagePropEtape?.dateDebut)}</div>}
        />
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, editedEtape.value.typeId, props.user) ? (
        <HeritageEdit
          updateHeritage={updateDateFinHeritage}
          prop={props.etape.heritageProps.dateFin}
          propId="dateFin"
          write={() => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date d’échéance' }} initialValue={props.etape.dateFin} valueChanged={dateFinChanged} />}
          read={heritagePropEtape => <div>{dateFormat(heritagePropEtape?.dateFin)}</div>}
        />
      ) : null}

      {canEditTitulaires(props.titreTypeId, props.user) ? (
        <>
          <div class="fr-input-group">
            <label class="fr-label" for="filters_autocomplete_titulaires">
              <h6>Titulaires</h6>
            </label>
            <HeritageEdit
              updateHeritage={updateTitulairesHeritage}
              prop={editedEtape.value.heritageProps.titulaires}
              propId="titulaires"
              write={() => (
                <AutocompleteEntreprise
                  allEntities={props.entreprises}
                  selectedEntities={props.etape.titulaires}
                  nonSelectableEntities={entreprisesDisabled.value}
                  name="titulaires"
                  onEntreprisesUpdate={titulairesUpdate}
                />
              )}
              read={heritagePropEtape => (
                <div>
                  {heritagePropEtape?.titulaires.map(t => (
                    <DsfrTag key={t.id} class="fr-mr-1w" ariaLabel={getEntrepriseNom(t)} />
                  ))}
                </div>
              )}
            />
          </div>
        </>
      ) : null}

      {canEditAmodiataires(props.titreTypeId, props.user) ? (
        <>
          <div class="fr-input-group">
            <label class="fr-label" for="filters_autocomplete_amodiataires">
              <h6>Amodiataires</h6>
            </label>

            <HeritageEdit
              updateHeritage={updateAmodiatairesHeritage}
              prop={editedEtape.value.heritageProps.amodiataires}
              propId="amodiataires"
              write={() => (
                <AutocompleteEntreprise
                  allEntities={props.entreprises}
                  selectedEntities={props.etape.amodiataires}
                  nonSelectableEntities={entreprisesDisabled.value}
                  name="amodiataires"
                  onEntreprisesUpdate={amodiatairesUpdate}
                />
              )}
              read={heritagePropEtape => (
                <div>
                  {heritagePropEtape?.amodiataires.map(t => (
                    <DsfrTag key={t.id} class="fr-mr-1w" ariaLabel={getEntrepriseNom(t)} />
                  ))}
                </div>
              )}
            />
          </div>
        </>
      ) : null}

      <SubstancesEdit
        substances={props.etape.substances}
        heritageSubstances={props.etape.heritageProps.substances}
        domaineId={domaineId.value}
        updateHeritage={updateSubstancesHeritage}
        updateSubstances={substancesChanged}
      />
    </div>
  )
})
