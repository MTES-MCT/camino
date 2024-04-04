import { caminoDefineComponent, useState } from '@/utils/vue-tsx-utils'
import { dateFormat } from '../../utils/index'
import { Tag } from '../_ui/tag'
import { InputDate } from '../_ui/input-date'
import { InputNumber } from '../_ui/input-number'
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

export type EtapeFondamentaleEdit = Pick<FullEtapeHeritage, 'typeId' | 'dateDebut' | 'dateFin' | 'duree' | 'titulaires' | 'amodiataires' | 'substances' | 'duree' | 'heritageProps'>
export interface Props {
  etape: DeepReadonly<EtapeFondamentaleEdit>
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  user: User
  entreprises: Entreprise[]
  completeUpdate: (etape: Props['etape'], complete: boolean) => void
}
export const FondamentalesEdit = caminoDefineComponent<Props>(['etape', 'demarcheTypeId', 'titreTypeId', 'user', 'entreprises', 'completeUpdate'], (props) => {

  const [editedEtape, setEditedEtape] = useState(props.etape)

  const ans = ref<number>(isNotNullNorUndefined(editedEtape.value.duree) && editedEtape.value.duree > 0 ? Math.floor(editedEtape.value.duree / 12) : 0)
  const mois = ref<number>(isNotNullNorUndefined(editedEtape.value.duree) && editedEtape.value.duree > 0 ? Math.floor(editedEtape.value.duree % 12) : 0)
  // // TODO 2024-04-03 ceci devrait disparaitre le jour où on retravaille l'héritage props
  // watch(() => props.etape, () => {
  //   editedEtape.value = props.etape
  // })

  const entreprisesDisabled = computed<EntrepriseId[]>(() => [...editedEtape.value.amodiataires, ...editedEtape.value.titulaires].map(({ id }) => id))

  const dateDebutChanged = (dateDebut: CaminoDate | null) => {
    setEditedEtape({...editedEtape.value, dateDebut})
  }

  const dateFinChanged = (dateFin: CaminoDate | null) => {
    setEditedEtape({...editedEtape.value, dateFin})
  }
  const substancesChanged = (substances: DeepReadonly<SubstanceLegaleId[]>) => {
    setEditedEtape({...editedEtape.value, substances})
  }
  const updateSubstancesHeritage = (substancesHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, "substances" |  "date" | "typeId">>>) => {
        setEditedEtape({...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, substances: substancesHeritage}})
  }

  const updateDureeHeritage = (dureeHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, "duree" | "typeId" | "date">>>) => {
        setEditedEtape({...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, duree: dureeHeritage}})
  }
  const updateDateDebutHeritage = (dateDebutHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, "dateDebut" | "typeId" | "date">>>) => {
        setEditedEtape({...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, dateDebut: dateDebutHeritage}})
  }
  const updateDateFinHeritage = (dateFinHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, "dateFin" | "typeId" | "date">>>) => {
        setEditedEtape({...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, dateFin: dateFinHeritage}})
  }
  const updateTitulairesHeritage = (titulairesHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, "titulaires" | "typeId" | "date">>>) => {
        setEditedEtape({...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, titulaires: titulairesHeritage}})
  }
  const updateAmodiatairesHeritage = (amodiatairesHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, "amodiataires" | "typeId" | "date">>>) => {
        setEditedEtape({...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, amodiataires: amodiatairesHeritage}})
  }



  watch(() => editedEtape.value, () => {
    const complete = editedEtape.value.typeId !== ETAPES_TYPES.demande || (editedEtape.value.substances?.filter(substanceId => !!substanceId)?.length > 0 && (dureeOptionalCheck.value || !!ans.value || !!mois.value))

    props.completeUpdate(editedEtape.value, complete),
    {immediate: true}
  })

  const domaineId = computed<DomaineId>(() => getDomaineId(props.titreTypeId))

  const dureeOptionalCheck = computed<boolean>(() => {
    return titreEtapesDureeOptionalCheck(editedEtape.value.typeId, props.demarcheTypeId, props.titreTypeId)
  })


  const titulairesUpdate = (titulaires: DeepReadonly<EtapeEntreprise[]>) => {
    const newTitulaires = titulaires.map(titulaire => ({
      id: titulaire.id,
      operateur: titulaire.operateur,
    }))
    setEditedEtape({...editedEtape.value, titulaires: newTitulaires})
  }

  const amodiatairesUpdate = (amodiataires: DeepReadonly<EtapeEntreprise[]>) => {
    const newAmodiataires = amodiataires.map(amodiataire => ({
      id: amodiataire.id,
      operateur: amodiataire.operateur,
    }))
    setEditedEtape({...editedEtape.value, amodiataires: newAmodiataires})
  }

  const getEntrepriseNom = (etapeEntreprise: EtapeEntreprise): string => {
    const entreprise = props.entreprises.find(({ id }) => id === etapeEntreprise.id)

    if (!entreprise) {
      return ''
    }

    return entreprise.nom
  }

  const updateDuree = (): void => {
    setEditedEtape({...editedEtape.value, duree: mois.value + ans.value * 12})
  }

  return () => (
    <div>
      {canEditDuree(props.titreTypeId, props.demarcheTypeId) ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5 class="mb-0">Durée (années / mois)</h5>
            {dureeOptionalCheck.value ? <p class="h6 italic mb-0">Optionnel</p> : null}
          </div>

          <HeritageEdit
            updateHeritage={updateDureeHeritage}
            prop={props.etape.heritageProps.duree}
            class="tablet-blob-2-3"
            propId="duree"
            write={() => (
              <>
                <div class="blobs-mini">
                  <div class="blob-mini-1-2">
                    <InputNumber
                      initialValue={ans.value}
                      integer={true}
                      placeholder="années"
                      class="py-s mb-s"
                      numberChanged={value => {
                        ans.value = value ?? 0
                        updateDuree()
                      }}
                    />
                  </div>
                  <div class="blob-mini-1-2">
                    <InputNumber
                      initialValue={mois.value}
                      integer={true}
                      placeholder="mois"
                      class="p-s"
                      numberChanged={value => {
                        mois.value = value ?? 0
                        updateDuree()
                      }}
                    />
                  </div>
                </div>
              </>
            )}
            read={heritagePropEtape => (
              <div class="border p-s mb-s bold">
                <PropDuree duree={heritagePropEtape?.duree} />
              </div>
            )}
          />
        </div>
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, editedEtape.value.typeId, props.user) ? (
        <>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5 class="mb-0">Date de début</h5>
              <p class="h6 italic mb-0">Optionnel</p>
            </div>
            <HeritageEdit
              updateHeritage={updateDateDebutHeritage}
              prop={props.etape.heritageProps.dateDebut}
              class="tablet-blob-2-3"
              propId="dateDebut"
              write={() => <InputDate initialValue={props.etape.dateDebut} dateChanged={dateDebutChanged} class="mb-s" />}
              read={heritagePropEtape => <div class="border p-s mb-s bold">{dateFormat(heritagePropEtape?.dateDebut)}</div>}
            />
          </div>
        </>
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, editedEtape.value.typeId, props.user) ? (
        <>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5 class="mb-0">Date d'échéance</h5>
              <p class="h6 italic mb-0">Optionnel</p>
            </div>
            <HeritageEdit
              updateHeritage={updateDateFinHeritage}
              prop={props.etape.heritageProps.dateFin}
              class="tablet-blob-2-3"
              propId="dateFin"
              write={() => <InputDate initialValue={props.etape.dateFin} dateChanged={dateFinChanged} class="mb-s" />}
              read={heritagePropEtape => <div class="border p-s mb-s bold">{dateFormat(heritagePropEtape?.dateFin)}</div>}
            />
          </div>
        </>
      ) : null}

      {canEditTitulaires(props.titreTypeId, props.user) ? (
        <>
          <h3 class="mb-s">Titulaires</h3>
          <p class="h6 italic">Optionnel</p>
          <HeritageEdit
            updateHeritage={updateTitulairesHeritage}
            prop={editedEtape.value.heritageProps.titulaires}
            propId="titulaires"
            write={() => (
              <AutocompleteEntreprise
                allEntities={props.entreprises}
                selectedEntities={props.etape.titulaires}
                nonSelectableEntities={entreprisesDisabled.value}
                placeholder="Sélectionner un titulaire"
                onEntreprisesUpdate={titulairesUpdate}
              />
            )}
            read={heritagePropEtape => (
              <ul class="list-prefix">
                {heritagePropEtape?.titulaires.map(t => (
                  <li key={t.id}>
                    {getEntrepriseNom(t)}
                    {t.operateur ? <Tag mini={true} color="bg-info" class="ml-xs" text="Opérateur" /> : null}
                  </li>
                ))}
              </ul>
            )}
          />
        </>
      ) : null}

      {canEditAmodiataires(props.titreTypeId, props.user) ? (
        <>
          <h3 class="mb-s">Amodiataires</h3>
          <p class="h6 italic">Optionnel</p>

          <HeritageEdit
            updateHeritage={updateAmodiatairesHeritage}
            prop={editedEtape.value.heritageProps.amodiataires}
            propId="amodiataires"
            write={() => (
              <AutocompleteEntreprise
                allEntities={props.entreprises}
                selectedEntities={props.etape.amodiataires}
                nonSelectableEntities={entreprisesDisabled.value}
                placeholder="Sélectionner un amodiataire"
                onEntreprisesUpdate={amodiatairesUpdate}
              />
            )}
            read={heritagePropEtape => (
              <ul class="list-prefix">
                {heritagePropEtape?.amodiataires.map(t => (
                  <li key={t.id}>
                    {getEntrepriseNom(t)}
                    {t.operateur ? <Tag mini={true} color="bg-info" class="ml-xs" text="Opérateur" /> : null}
                  </li>
                ))}
              </ul>
            )}
          />
        </>
      ) : null}

      <SubstancesEdit substances={props.etape.substances} heritageSubstances={props.etape.heritageProps.substances} domaineId={domaineId.value} updateHeritage={updateSubstancesHeritage} updateSubstances={substancesChanged}/>
    </div>
  )
})
