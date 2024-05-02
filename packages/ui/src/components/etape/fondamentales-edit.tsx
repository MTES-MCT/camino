import { useState } from '@/utils/vue-tsx-utils'
import { DsfrTag } from '../_ui/tag'
import { HeritageEdit } from './heritage-edit'
import { AutocompleteEntreprise } from './autocomplete-entreprise'
import { CaminoDate } from 'camino-common/src/date'
import { SubstancesEdit } from './substances-edit'
import { dureeOptionalCheck as titreEtapesDureeOptionalCheck, canEditAmodiataires, canEditTitulaires, canEditDuree, canEditDates } from 'camino-common/src/permissions/titres-etapes'

import { EtapeEntreprise, EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { DomaineId } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { watch, computed, ref, DeepReadonly, defineComponent } from 'vue'
import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { DsfrInput } from '../_ui/dsfr-input'

export type EtapeFondamentaleEdit = Pick<EtapeWithHeritage, 'typeId' | 'dateDebut' | 'dateFin' | 'duree' | 'titulaires' | 'amodiataires' | 'substances' | 'duree' | 'heritageProps'>
interface Props {
  etape: DeepReadonly<EtapeFondamentaleEdit>
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  user: User
  entreprises: DeepReadonly<Entreprise[]>
  completeUpdate: (etape: Props['etape']) => void
}

const dureeToAns = (duree: number | null | undefined) => {
  return isNotNullNorUndefined(duree) && duree > 0 ? Math.floor(duree / 12) : 0
}
const dureeToMois = (duree: number | null | undefined) => {
  return isNotNullNorUndefined(duree) && duree > 0 ? Math.floor(duree % 12) : 0
}

export const FondamentalesEdit = defineComponent<Props>(props => {
  const [editedEtape, setEditedEtape] = useState(props.etape)

  const ans = ref<number>(dureeToAns(editedEtape.value.duree))
  const mois = ref<number>(dureeToMois(editedEtape.value.duree))
  // // TODO 2024-04-03 ceci devrait disparaitre le jour où on retravaille l'héritage props
  // watch(() => props.etape, () => {
  //   editedEtape.value = props.etape
  // })

  const dateDebutChanged = (dateDebut: CaminoDate | null) => {
    setEditedEtape({ ...editedEtape.value, dateDebut })
  }

  const dateFinChanged = (dateFin: CaminoDate | null) => {
    setEditedEtape({ ...editedEtape.value, dateFin })
  }
  const substancesChanged = (substances: DeepReadonly<SubstanceLegaleId[]>) => {
    setEditedEtape({ ...editedEtape.value, substances })
  }
  const updateSubstancesHeritage = (substancesHeritage: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'substances' | 'date' | 'typeId'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, substances: substancesHeritage } })
  }

  const updateDureeHeritage = (dureeHeritage: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'duree' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, duree: dureeHeritage } })
  }
  const updateDateDebutHeritage = (dateDebutHeritage: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'dateDebut' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, dateDebut: dateDebutHeritage } })
  }
  const updateDateFinHeritage = (dateFinHeritage: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'dateFin' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, dateFin: dateFinHeritage } })
  }
  const updateTitulairesHeritage = (titulairesHeritage: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'titulaires' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, titulaires: titulairesHeritage } })
  }
  const updateAmodiatairesHeritage = (amodiatairesHeritage: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'amodiataires' | 'typeId' | 'date'>>>) => {
    setEditedEtape({ ...editedEtape.value, heritageProps: { ...editedEtape.value.heritageProps, amodiataires: amodiatairesHeritage } })
  }

  const dureeOptionalCheck = computed<boolean>(() => {
    return titreEtapesDureeOptionalCheck(editedEtape.value.typeId, props.demarcheTypeId, props.titreTypeId)
  })

  watch(
    () => editedEtape.value,
    () => {
      props.completeUpdate(editedEtape.value)
    }
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

  const updateAnsDuree = (value: number | null) => {
    ans.value = value ?? 0
    updateDuree()
  }
  const updateMoisDuree = (value: number | null) => {
    mois.value = value ?? 0
    updateDuree()
  }

  return () => (
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-xl-6">
        {canEditDuree(props.titreTypeId, props.demarcheTypeId) ? (
          <HeritageEdit
            updateHeritage={updateDureeHeritage}
            hasHeritage={isNotNullNorUndefined(editedEtape.value.heritageProps.duree.etape?.duree)}
            prop={editedEtape.value.heritageProps.duree}
            propId="duree"
            write={() => (
              <div style={{ display: 'flex' }}>
                <DsfrInput legend={{ main: `Durée (années)${!dureeOptionalCheck.value ? ' *' : ''}` }} type={{ type: 'number' }} valueChanged={updateAnsDuree} initialValue={ans.value} />
                <DsfrInput
                  legend={{ main: `Durée (mois)${!dureeOptionalCheck.value ? ' *' : ''}` }}
                  type={{ type: 'number' }}
                  valueChanged={updateMoisDuree}
                  initialValue={mois.value}
                  class="fr-ml-2w"
                />
              </div>
            )}
            read={heritagePropEtape => (
              <div style={{ display: 'flex' }}>
                <DsfrInput
                  legend={{ main: `Durée (années)${!dureeOptionalCheck.value ? ' *' : ''}` }}
                  type={{ type: 'number' }}
                  valueChanged={() => {}}
                  disabled={true}
                  initialValue={dureeToAns(heritagePropEtape?.duree)}
                />
                <DsfrInput
                  legend={{ main: `Durée (mois)${!dureeOptionalCheck.value ? ' *' : ''}` }}
                  type={{ type: 'number' }}
                  valueChanged={() => {}}
                  initialValue={dureeToMois(heritagePropEtape?.duree)}
                  disabled={true}
                  class="fr-ml-2w"
                />
              </div>
            )}
          />
        ) : null}

        {canEditDates(props.titreTypeId, props.demarcheTypeId, editedEtape.value.typeId, props.user) ? (
          <HeritageEdit
            updateHeritage={updateDateDebutHeritage}
            prop={editedEtape.value.heritageProps.dateDebut}
            propId="dateDebut"
            hasHeritage={isNotNullNorUndefined(editedEtape.value.heritageProps.dateDebut.etape?.dateDebut)}
            write={() => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date de début' }} initialValue={props.etape.dateDebut} valueChanged={dateDebutChanged} />}
            read={heritagePropEtape => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date de début' }} initialValue={heritagePropEtape?.dateDebut} valueChanged={() => {}} disabled={true} />}
          />
        ) : null}

        {canEditDates(props.titreTypeId, props.demarcheTypeId, editedEtape.value.typeId, props.user) ? (
          <HeritageEdit
            updateHeritage={updateDateFinHeritage}
            prop={editedEtape.value.heritageProps.dateFin}
            propId="dateFin"
            hasHeritage={isNotNullNorUndefined(editedEtape.value.heritageProps.dateFin.etape?.dateFin)}
            write={() => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date d’échéance' }} initialValue={props.etape.dateFin} valueChanged={dateFinChanged} />}
            read={heritagePropEtape => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date d’échéance' }} initialValue={heritagePropEtape?.dateFin} valueChanged={() => {}} disabled={true} />}
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
                hasHeritage={isNotNullNorUndefinedNorEmpty(editedEtape.value.heritageProps.titulaires.etape?.titulaires)}
                write={() => (
                  <AutocompleteEntreprise
                    allEntities={props.entreprises}
                    selectedEntities={editedEtape.value.titulaires}
                    nonSelectableEntities={editedEtape.value.amodiataires.map(({ id }) => id)}
                    name="titulaires"
                    onEntreprisesUpdate={titulairesUpdate}
                  />
                )}
                read={heritagePropEtape => <div>{heritagePropEtape?.titulaires.map(t => <DsfrTag key={t.id} class="fr-mr-1w" ariaLabel={getEntrepriseNom(t)} />)}</div>}
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
                hasHeritage={isNotNullNorUndefinedNorEmpty(editedEtape.value.heritageProps.amodiataires.etape?.amodiataires)}
                propId="amodiataires"
                write={() => (
                  <AutocompleteEntreprise
                    allEntities={props.entreprises}
                    selectedEntities={editedEtape.value.amodiataires}
                    nonSelectableEntities={editedEtape.value.titulaires.map(({ id }) => id)}
                    name="amodiataires"
                    onEntreprisesUpdate={amodiatairesUpdate}
                  />
                )}
                read={heritagePropEtape => <div>{heritagePropEtape?.amodiataires.map(t => <DsfrTag key={t.id} class="fr-mr-1w" ariaLabel={getEntrepriseNom(t)} />)}</div>}
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
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
FondamentalesEdit.props = ['etape', 'demarcheTypeId', 'titreTypeId', 'user', 'entreprises', 'completeUpdate']
