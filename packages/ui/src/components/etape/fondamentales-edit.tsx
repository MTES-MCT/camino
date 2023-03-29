import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { dateFormat } from '../../utils/index'
import { Tag } from '../_ui/tag'
import { InputDate } from '../_ui/input-date'
import InputNumber from '../_ui/input-number.vue'
import { HeritageEdit } from './heritage-edit'
import { PropDuree } from './prop-duree'
import { AutocompleteEntreprise } from './autocomplete-entreprise'
import { CaminoDate } from 'camino-common/src/date'

import { etablissementNameFind } from '@/utils/entreprise'
import { SubstancesEdit } from './substances-edit'
import { dureeOptionalCheck as titreEtapesDureeOptionalCheck, canEditAmodiataires, canEditTitulaires, canEditDuree, canEditDates } from 'camino-common/src/permissions/titres-etapes'

import { EtapeEntreprise, EtapeFondamentale } from 'camino-common/src/etape'
import { DomaineId } from 'camino-common/src/static/domaines'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { watch, computed, ref } from 'vue'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'

export interface Props {
  etape: EtapeFondamentale
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  user: User
  entreprises: Entreprise[]
}
export const FondamentalesEdit = caminoDefineComponent<Props>(['etape', 'demarcheTypeId', 'titreTypeId', 'user', 'entreprises'], (props, context) => {
  const ans = ref<number>(props.etape.duree ? Math.floor(props.etape.duree / 12) : 0)
  const mois = ref<number>(props.etape.duree ? Math.floor(props.etape.duree % 12) : 0)

  const entreprisesDisabled = computed<EntrepriseId[]>(() => [...props.etape.amodiataires, ...props.etape.titulaires].map(({ id }) => id))

  const dateDebutChanged = (date: CaminoDate) => {
    props.etape.dateDebut = date
  }

  const dateFinChanged = (date: CaminoDate) => {
    props.etape.dateFin = date
  }

  const domaineId = computed<DomaineId>(() => getDomaineId(props.titreTypeId))

  const titulairesLength = computed<number>(() => {
    return props.etape.titulaires.filter(({ id }) => id).length
  })

  const amodiatairesLength = computed<number>(() => {
    return props.etape.amodiataires?.filter(({ id }) => id).length || 0
  })

  const dureeOptionalCheck = computed<boolean>(() => {
    return titreEtapesDureeOptionalCheck(props.etape.type.id, props.demarcheTypeId, props.titreTypeId)
  })

  const complete = computed<boolean>(() => {
    return props.etape.type.id !== ETAPES_TYPES.demande || (props.etape.substances?.filter(substanceId => !!substanceId)?.length > 0 && (dureeOptionalCheck.value || !!ans.value || !!mois.value))
  })

  const completeUpdate = () => {
    context.emit('complete-update', complete.value)
  }

  watch(
    () => complete.value,
    () => completeUpdate(),
    { immediate: true }
  )
  watch<EtapeFondamentale>(
    () => props.etape,
    etape => {
      if (!etape.duree) {
        etape.incertitudes.duree = false
      }

      if (!etape.dateDebut) {
        etape.incertitudes.dateDebut = false
      }

      if (!etape.dateFin) {
        etape.incertitudes.dateFin = false
      }

      if (!etape.titulaires.length) {
        etape.incertitudes.titulaires = false
      }

      if (!etape.amodiataires?.length) {
        etape.incertitudes.amodiataires = false
      }

      if (!etape.substances?.length) {
        etape.incertitudes.substances = false
      }

      context.emit('update:etape', etape)
    },
    { deep: true }
  )

  const titulairesUpdate = (titulaires: EtapeEntreprise[]) => {
    const newTitulaires = titulaires.map(titulaire => ({
      id: titulaire.id,
      operateur: titulaire.operateur,
    }))
    props.etape.titulaires.splice(0, props.etape.titulaires.length, ...newTitulaires)
  }

  const amodiatairesUpdate = (amodiataires: EtapeEntreprise[]) => {
    const newAmodiataires = amodiataires.map(amodiataire => ({
      id: amodiataire.id,
      operateur: amodiataire.operateur,
    }))
    props.etape.amodiataires.splice(0, props.etape.amodiataires.length, ...newAmodiataires)
  }

  const getEntrepriseNom = (etapeEntreprise: EtapeEntreprise): string => {
    const entreprise = props.entreprises.find(({ id }) => id === etapeEntreprise.id)

    if (!entreprise) {
      return ''
    }

    return etablissementNameFind(entreprise.etablissements, props.etape.date) || entreprise.nom
  }

  const updateDuree = (): void => {
    props.etape.duree = mois.value + ans.value * 12
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
                    <InputNumber v-model={ans.value} integer={true} placeholder="années" class="py-s mb-s" onBlur={updateDuree} />
                  </div>
                  <div class="blob-mini-1-2">
                    <InputNumber v-model={mois.value} integer={true} placeholder="mois" class="p-s" onBlur={updateDuree} />
                  </div>
                </div>
                {ans.value || mois.value ? (
                  <div class="h6">
                    <label>
                      <input v-model={props.etape.incertitudes.duree} type="checkbox" class="mr-xs" />
                      Incertain
                    </label>
                  </div>
                ) : null}
              </>
            )}
            read={heritagePropEtape => (
              <div class="border p-s mb-s bold">
                <PropDuree duree={heritagePropEtape?.duree} />
              </div>
            )}
          />
          <hr />
        </div>
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, props.etape.type.id, props.user) ? (
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
              write={() => (
                <>
                  <InputDate initialValue={props.etape.dateDebut} dateChanged={dateDebutChanged} class="mb-s" />
                  {props.etape.dateDebut ? (
                    <div class="h6">
                      <label>
                        <input v-model={props.etape.incertitudes.dateDebut} type="checkbox" class="mr-xs" />
                        Incertain
                      </label>
                    </div>
                  ) : null}
                </>
              )}
              read={heritagePropEtape => <div class="border p-s mb-s bold">{dateFormat(heritagePropEtape?.dateDebut)}</div>}
            />
          </div>

          <hr />
        </>
      ) : null}

      {canEditDates(props.titreTypeId, props.demarcheTypeId, props.etape.type.id, props.user) ? (
        <>
          <div class="tablet-blobs">
            <hr />
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5 class="mb-0">Date d'échéance</h5>
              <p class="h6 italic mb-0">Optionnel</p>
            </div>
            <HeritageEdit
              prop={props.etape.heritageProps.dateFin}
              class="tablet-blob-2-3"
              propId="dateFin"
              write={() => (
                <>
                  <InputDate initialValue={props.etape.dateFin} dateChanged={dateFinChanged} class="mb-s" />
                  {props.etape.dateFin ? (
                    <div class="h6">
                      <label>
                        <input v-model={props.etape.incertitudes.dateFin} type="checkbox" class="mr-xs" />
                        Incertain
                      </label>
                    </div>
                  ) : null}
                </>
              )}
              read={heritagePropEtape => <div class="border p-s mb-s bold">{dateFormat(heritagePropEtape?.dateFin)}</div>}
            />
          </div>
          <hr />
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
              <>
                <AutocompleteEntreprise
                  allEntities={props.entreprises}
                  selectedEntities={props.etape.titulaires}
                  nonSelectableEntities={entreprisesDisabled.value}
                  placeholder="Sélectionner un titulaire"
                  onEntreprisesUpdate={titulairesUpdate}
                />
                <div class="h6 mt-s">
                  {titulairesLength.value ? (
                    <label>
                      <input v-model={props.etape.incertitudes.titulaires} type="checkbox" class="mr-xs" />
                      Incertain
                    </label>
                  ) : null}
                </div>
              </>
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
          <hr />
        </>
      ) : null}

      {canEditAmodiataires(props.titreTypeId, props.user) ? (
        <>
          <hr />

          <h3 class="mb-s">Amodiataires</h3>
          <p class="h6 italic">Optionnel</p>

          <HeritageEdit
            prop={props.etape.heritageProps.amodiataires}
            propId="amodiataires"
            write={() => (
              <>
                <AutocompleteEntreprise
                  allEntities={props.entreprises}
                  selectedEntities={props.etape.amodiataires}
                  nonSelectableEntities={entreprisesDisabled.value}
                  placeholder="Sélectionner un amodiataire"
                  onEntreprisesUpdate={amodiatairesUpdate}
                />
                <div class="h6 mt-s">
                  {amodiatairesLength.value ? (
                    <label>
                      <input v-model={props.etape.incertitudes.amodiataires} type="checkbox" class="mr-xs" />
                      Incertain
                    </label>
                  ) : null}
                </div>
              </>
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

          <hr />
        </>
      ) : null}

      <SubstancesEdit substances={props.etape.substances} heritageProps={props.etape.heritageProps} incertitudes={props.etape.incertitudes} domaineId={domaineId.value} />

      <hr />
    </div>
  )
})
