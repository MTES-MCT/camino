import { useState } from '@/utils/vue-tsx-utils'
import { DsfrTag } from '../_ui/tag'
import { HeritageEdit } from './heritage-edit'
import { AutocompleteEntreprises } from './autocomplete-entreprises'
import { CaminoDate } from 'camino-common/src/date'
import { SubstancesEdit } from './substances-edit'
import { canEditAmodiataires, canEditTitulaires, canEditDuree, canEditDates, InputPresence, InputAbsent, InputPresentOptional } from 'camino-common/src/permissions/titres-etapes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed, ref, DeepReadonly, defineComponent } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'
import { FlattenEtape } from 'camino-common/src/etape-form'

export type EtapeFondamentaleEdit = Pick<FlattenEtape, 'typeId' | 'dateDebut' | 'dateFin' | 'duree' | 'titulaires' | 'amodiataires' | 'substances'>
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

  const ans = ref<number>(dureeToAns(editedEtape.value.duree.value))
  const mois = ref<number>(dureeToMois(editedEtape.value.duree.value))

  const dateDebutChanged = (dateDebut: CaminoDate | null) => {
    updateEtape({ dateDebut: { ...editedEtape.value.dateDebut, value: dateDebut } })
  }

  const dateFinChanged = (dateFin: CaminoDate | null) => {
    updateEtape({ dateFin: { ...editedEtape.value.dateFin, value: dateFin } })
  }
  const substancesChanged = (substances: DeepReadonly<FlattenEtape['substances']>) => {
    updateEtape({ substances })
  }
  const updateDureeHeritage = (duree: FlattenEtape['duree']) => {
    updateEtape({ duree })
  }
  const updateDateDebutHeritage = (dateDebut: FlattenEtape['dateDebut']) => {
    updateEtape({ dateDebut })
  }
  const updateDateFinHeritage = (dateFin: FlattenEtape['dateFin']) => {
    updateEtape({ dateFin })
  }
  const updateTitulairesHeritage = (titulaires: DeepReadonly<FlattenEtape['titulaires']>) => {
    updateEtape({ titulaires })
  }
  const updateAmodiatairesHeritage = (amodiataires: DeepReadonly<FlattenEtape['amodiataires']>) => {
    updateEtape({ amodiataires })
  }

  const dureeEdit = computed<InputPresence>(() => canEditDuree(props.titreTypeId, props.demarcheTypeId, props.user))
  const dureeOptionalCheck = computed<boolean>(() => dureeEdit.value.visibility === 'present' && !dureeEdit.value.required)

  const datesEdit = computed<InputAbsent | InputPresentOptional>(() => canEditDates(props.titreTypeId, props.demarcheTypeId, props.etape.typeId, props.user))

  const titulairesEdit = computed<InputPresence>(() => canEditTitulaires(props.titreTypeId, props.demarcheTypeId, props.user))
  const titulairesLabel = computed<string>(() => {
    if (titulairesEdit.value.visibility === 'present') {
      return titulairesEdit.value.required ? 'Titulaires *' : 'Titulaires'
    }
    return ''
  })

  const amodiatairesEdit = computed<InputPresence>(() => canEditAmodiataires(props.titreTypeId, props.demarcheTypeId, props.user))
  const amodiatairesLabel = computed<string>(() => {
    if (amodiatairesEdit.value.visibility === 'present') {
      return amodiatairesEdit.value.required ? 'Amodiataires *' : 'Amodiataires'
    }
    return ''
  })

  const domaineId = computed<DomaineId>(() => getDomaineId(props.titreTypeId))

  const titulairesUpdate = (titulaireIds: DeepReadonly<EntrepriseId[]>) => {
    updateEtape({ titulaires: { ...editedEtape.value.titulaires, value: titulaireIds } })
  }

  const amodiatairesUpdate = (amodiataireIds: DeepReadonly<EntrepriseId[]>) => {
    updateEtape({ amodiataires: { ...editedEtape.value.amodiataires, value: amodiataireIds } })
  }

  const getEntrepriseNom = (entrepriseId: EntrepriseId): string => {
    const entreprise = props.entreprises.find(({ id }) => id === entrepriseId)

    if (!entreprise) {
      return ''
    }

    return entreprise.nom
  }

  const updateDuree = (): void => {
    updateEtape({ duree: { ...editedEtape.value.duree, value: mois.value + ans.value * 12 } })
  }

  const updateEtape = (partialEtape: Partial<Props['etape']>) => {
    setEditedEtape({ ...editedEtape.value, ...partialEtape })
    props.completeUpdate({ ...props.etape, ...partialEtape })
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
        {dureeEdit.value.visibility === 'present' ? (
          <HeritageEdit
            updateHeritage={updateDureeHeritage}
            hasHeritageValue={isNotNullNorUndefined(props.etape.duree.etapeHeritee?.value)}
            prop={editedEtape.value.duree}
            label="Durée"
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
                  initialValue={dureeToAns(heritagePropEtape?.value)}
                />
                <DsfrInput
                  legend={{ main: `Durée (mois)${!dureeOptionalCheck.value ? ' *' : ''}` }}
                  type={{ type: 'number' }}
                  valueChanged={() => {}}
                  initialValue={dureeToMois(heritagePropEtape?.value)}
                  disabled={true}
                  class="fr-ml-2w"
                />
              </div>
            )}
          />
        ) : null}

        {datesEdit.value.visibility === 'present' ? (
          <>
            <HeritageEdit
              updateHeritage={updateDateDebutHeritage}
              hasHeritageValue={isNotNullNorUndefined(props.etape.dateDebut.etapeHeritee?.value)}
              prop={editedEtape.value.dateDebut}
              label="Date de début"
              write={() => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date de début' }} initialValue={props.etape.dateDebut.value} valueChanged={dateDebutChanged} />}
              read={heritagePropEtape => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date de début' }} initialValue={heritagePropEtape?.value} valueChanged={() => {}} disabled={true} />}
            />
            <HeritageEdit
              updateHeritage={updateDateFinHeritage}
              hasHeritageValue={isNotNullNorUndefined(props.etape.dateFin.etapeHeritee?.value)}
              prop={editedEtape.value.dateFin}
              label="Date d’échéance"
              write={() => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date d’échéance' }} initialValue={props.etape.dateFin.value} valueChanged={dateFinChanged} />}
              read={heritagePropEtape => <DsfrInput type={{ type: 'date' }} legend={{ main: 'Date d’échéance' }} initialValue={heritagePropEtape?.value} valueChanged={() => {}} disabled={true} />}
            />
          </>
        ) : null}

        {titulairesEdit.value.visibility === 'present' ? (
          <HeritageEdit
            updateHeritage={updateTitulairesHeritage}
            hasHeritageValue={isNotNullNorUndefinedNorEmpty(props.etape.titulaires.etapeHeritee?.value)}
            prop={editedEtape.value.titulaires}
            label={titulairesLabel.value}
            write={() => (
              <div class="fr-input-group fr-mb-0">
                <label class="fr-label" for="filters_autocomplete_titulaires">
                  {titulairesLabel.value}
                </label>
                <AutocompleteEntreprises
                  class="fr-mt-1w"
                  allEntities={props.entreprises}
                  selectedEntities={editedEtape.value.titulaires.value}
                  nonSelectableEntities={editedEtape.value.amodiataires.value}
                  name="titulaires"
                  onEntreprisesUpdate={titulairesUpdate}
                />
              </div>
            )}
            read={heritagePropEtape => (
              <div class="fr-input-group fr-input-group--disabled fr-mb-0">
                <label class="fr-label">{titulairesLabel.value}</label>
                <div class="fr-mt-1w">{heritagePropEtape?.value.map(id => <DsfrTag key={id} class="fr-mr-1w" ariaLabel={getEntrepriseNom(id)} />)}</div>
              </div>
            )}
          />
        ) : null}

        {amodiatairesEdit.value.visibility === 'present' ? (
          <HeritageEdit
            updateHeritage={updateAmodiatairesHeritage}
            hasHeritageValue={isNotNullNorUndefinedNorEmpty(props.etape.amodiataires.etapeHeritee?.value)}
            prop={editedEtape.value.amodiataires}
            label={amodiatairesLabel.value}
            write={() => (
              <div class="fr-input-group fr-mb-0">
                <label class="fr-label" for="filters_autocomplete_amodiataires">
                  {amodiatairesLabel.value}
                </label>
                <AutocompleteEntreprises
                  class="fr-mt-1w"
                  allEntities={props.entreprises}
                  selectedEntities={editedEtape.value.amodiataires.value}
                  nonSelectableEntities={editedEtape.value.titulaires.value}
                  name="amodiataires"
                  onEntreprisesUpdate={amodiatairesUpdate}
                />
              </div>
            )}
            read={heritagePropEtape => (
              <div class="fr-input-group fr-input-group--disabled fr-mb-0">
                <label class="fr-label">{amodiatairesLabel.value}</label>
                <div class="fr-mt-1w">{heritagePropEtape?.value.map(id => <DsfrTag key={id} class="fr-mr-1w" ariaLabel={getEntrepriseNom(id)} />)}</div>
              </div>
            )}
          />
        ) : null}

        <SubstancesEdit substances={props.etape.substances} domaineId={domaineId.value} updateSubstances={substancesChanged} />
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
FondamentalesEdit.props = ['etape', 'demarcheTypeId', 'titreTypeId', 'user', 'entreprises', 'completeUpdate']
