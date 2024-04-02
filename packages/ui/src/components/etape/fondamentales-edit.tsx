import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
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

import { Etape, EtapeEntreprise, EtapeFondamentale, EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { DomaineId } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { watch, computed, ref } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'

type EtapeFondamentaleEdit = Pick<EtapeFondamentale, 'dateDebut' | 'dateFin' | 'duree' | 'titulaires' | 'amodiataires' | 'substances' | 'duree' | 'heritageProps'>
export interface Props {
  etape: EtapeFondamentaleEdit & Pick<EtapeFondamentale, 'typeId'>
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  user: User
  entreprises: Entreprise[]
  completeUpdate: (etape: EtapeFondamentaleEdit, complete: boolean) => void
}
export const FondamentalesEdit = caminoDefineComponent<Props>(['etape', 'demarcheTypeId', 'titreTypeId', 'user', 'entreprises', 'completeUpdate'], (props) => {
  const ans = ref<number>(isNotNullNorUndefined(props.etape.duree) && props.etape.duree > 0 ? Math.floor(props.etape.duree / 12) : 0)
  const mois = ref<number>(isNotNullNorUndefined(props.etape.duree) && props.etape.duree > 0 ? Math.floor(props.etape.duree % 12) : 0)

  const editedEtape = ref<EtapeFondamentaleEdit>(structuredClone(props.etape))

  const entreprisesDisabled = computed<EntrepriseId[]>(() => [...props.etape.amodiataires, ...props.etape.titulaires].map(({ id }) => id))

  const dateDebutChanged = (dateDebut: CaminoDate | null) => {
    editedEtape.value = {...editedEtape.value, dateDebut}
  }

  const dateFinChanged = (dateFin: CaminoDate | null) => {
    editedEtape.value = {...editedEtape.value, dateFin}
  }

  const updateSubstancesHeritage = (heritage: HeritageProp<Pick<EtapeFondamentale, "substances" | "typeId" | "date">>) => {

        editedEtape.value = {...editedEtape.value, heritageProps: {...editedEtape.value.heritageProps, substances: heritage}}

  }

  const updateSubstances = () => {
    // FIXME
  }

  watch(() => editedEtape, () => {
    const complete = props.etape.typeId !== ETAPES_TYPES.demande || (props.etape.substances?.filter(substanceId => !!substanceId)?.length > 0 && (dureeOptionalCheck.value || !!ans.value || !!mois.value))

    props.completeUpdate(editedEtape.value, complete),
    {immediate: true}
  })

  const domaineId = computed<DomaineId>(() => getDomaineId(props.titreTypeId))

  const dureeOptionalCheck = computed<boolean>(() => {
    return titreEtapesDureeOptionalCheck(props.etape.typeId, props.demarcheTypeId, props.titreTypeId)
  })


  const titulairesUpdate = (titulaires: EtapeEntreprise[]) => {
    const newTitulaires = titulaires.map(titulaire => ({
      id: titulaire.id,
      operateur: titulaire.operateur,
    }))
    editedEtape.value = {...editedEtape.value, titulaires: newTitulaires}
  }

  const amodiatairesUpdate = (amodiataires: EtapeEntreprise[]) => {
    const newAmodiataires = amodiataires.map(amodiataire => ({
      id: amodiataire.id,
      operateur: amodiataire.operateur,
    }))
    editedEtape.value = {...editedEtape.value, amodiataires: newAmodiataires}
  }

  const getEntrepriseNom = (etapeEntreprise: EtapeEntreprise): string => {
    const entreprise = props.entreprises.find(({ id }) => id === etapeEntreprise.id)

    if (!entreprise) {
      return ''
    }

    return entreprise.nom
  }

  const updateDuree = (): void => {
    editedEtape.value = {...editedEtape.value, duree: mois.value + ans.value * 12}
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

      {canEditDates(props.titreTypeId, props.demarcheTypeId, props.etape.typeId, props.user) ? (
        <>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5 class="mb-0">Date de début</h5>
              <p class="h6 italic mb-0">Optionnel</p>
            </div>
            <HeritageEdit
              prop={props.etape.heritageProps.dateDebut}
              class="tablet-blob-2-3"
              propId="dateDebut"
              write={() => <InputDate initialValue={props.etape.dateDebut} dateChanged={dateDebutChanged} class="mb-s" />}
              read={heritagePropEtape => <div class="border p-s mb-s bold">{dateFormat(heritagePropEtape?.dateDebut)}</div>}
            />
          </div>
        </>
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, props.etape.typeId, props.user) ? (
        <>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5 class="mb-0">Date d'échéance</h5>
              <p class="h6 italic mb-0">Optionnel</p>
            </div>
            <HeritageEdit
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
            prop={props.etape.heritageProps.titulaires}
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
            prop={props.etape.heritageProps.amodiataires}
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

      <SubstancesEdit substances={props.etape.substances} heritageProps={props.etape.heritageProps} domaineId={domaineId.value} updateHeritage={updateSubstancesHeritage} updateSubstances={updateSubstances}/>
    </div>
  )
})
