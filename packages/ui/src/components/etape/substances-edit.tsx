import { useState } from '@/utils/vue-tsx-utils'
import { SubstancesLegales, SubstancesLegale, SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { DeepReadonly, computed, defineComponent, watch } from 'vue'
import { HeritageEdit } from '@/components/etape/heritage-edit'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EtapePropsFromHeritagePropName, EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { SubstanceLegaleTypeahead } from '../_common/substance-legale-typeahead'
import { DsfrTag } from '../_ui/tag'
import { capitalize } from 'camino-common/src/strings'

export type Props = {
  substances: DeepReadonly<SubstanceLegaleId[]>
  heritageSubstances: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'typeId' | 'date' | EtapePropsFromHeritagePropName<'substances'>>>>
  domaineId: DomaineId
  updateSubstances: (substances: DeepReadonly<SubstanceLegaleId[]>) => void
  updateHeritage: (subtances: Props['heritageSubstances']) => void
}
export const SubstancesEdit = defineComponent<Props>(props => {
  const [editedSubstances, setEditedSubstances] = useState<DeepReadonly<(SubstanceLegaleId | undefined)[]>>(isNullOrUndefinedOrEmpty(props.substances) ? [undefined] : props.substances)
  const [heritageActif, setHeritageActif] = useState<Props['heritageSubstances']>(props.heritageSubstances)

  const substancesLength = computed<number>(() => editedSubstances.value.filter(substanceId => substanceId).length)

  const updateHeritage = (actif: Props['heritageSubstances']) => {
    setHeritageActif(actif)
    props.updateHeritage(actif)
  }

  watch(
    () => editedSubstances.value,
    () => {
      props.updateSubstances(editedSubstances.value.filter(isNotNullNorUndefined))
    },
    { deep: true }
  )

  const substancesToDisplay = computed<SubstanceLegaleId[]>(() => {
    return SubstancesLegales.filter(({ domaineIds }) => domaineIds.includes(props.domaineId))
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .filter(({ id }) => !editedSubstances.value.some(substanceId => substanceId === id))
      .map(({ id }) => id)
  })

  const substanceNoms = computed<string[]>(() => {
    return props.heritageSubstances.etape?.substances.filter((substanceId): substanceId is SubstanceLegaleId => !!substanceId).map(substanceId => SubstancesLegale[substanceId].nom) || []
  })

  const substanceAdd = (): void => {
    setEditedSubstances([...editedSubstances.value, undefined])
  }

  const substanceRemove = (index: number) => (): void => {
    setEditedSubstances(editedSubstances.value.filter((_, myIndex) => index !== myIndex))
  }

  const substanceMoveDown = (index: number) => () => {
    const mySubstance = editedSubstances.value[index]
    const myPrevious = editedSubstances.value[index + 1]

    setEditedSubstances(
      editedSubstances.value.map((substance, myIndex) => {
        if (myIndex === index) {
          return myPrevious
        } else if (myIndex === index + 1) {
          return mySubstance
        }

        return substance
      })
    )
  }

  const substanceMoveUp = (index: number) => () => {
    const mySubstance = editedSubstances.value[index]
    const myPrevious = editedSubstances.value[index - 1]

    setEditedSubstances(
      editedSubstances.value.map((substance, myIndex) => {
        if (myIndex === index) {
          return myPrevious
        } else if (myIndex === index - 1) {
          return mySubstance
        }

        return substance
      })
    )
  }

  const substanceUpdate = (index: number) => (id: SubstanceLegaleId | null) => {
    if (id !== null) {
      setEditedSubstances(
        editedSubstances.value.map((substance, myIndex) => {
          if (myIndex === index) {
            return id
          }

          return substance
        })
      )
    }
  }

  return () => (
    <HeritageEdit
      prop={heritageActif.value}
      propId="substances"
      label="Substances"
      hasHeritage={isNotNullNorUndefinedNorEmpty(heritageActif.value.etape?.substances)}
      write={() => (
        <div class="fr-input-group fr-mb-0">
          <label class="fr-label" for={`typeahead_substances_${editedSubstances.value.length - 1}`}>
            Substances
          </label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {editedSubstances.value.map((substance, n) => (
              <div key={substance ?? ''}>
                <div style={{ display: 'flex' }} class="fr-mt-1w">
                  <SubstanceLegaleTypeahead
                    id={`typeahead_substances_${n}`}
                    initialValue={substance}
                    substanceLegaleIds={isNotNullNorUndefined(substance) ? [...substancesToDisplay.value, substance] : substancesToDisplay.value}
                    substanceLegaleSelected={substanceUpdate(n)}
                  />
                  {substancesLength.value && n + 1 < substancesLength.value ? (
                    <DsfrButtonIcon
                      onClick={substanceMoveDown(n)}
                      title={`Diminuer l’importance de la substance ${isNotNullNorUndefined(substance) ? SubstancesLegale[substance].nom : ''}`}
                      buttonType="secondary"
                      class="fr-ml-2w"
                      icon="fr-icon-arrow-down-fill"
                    />
                  ) : null}

                  {substancesLength.value && n > 0 && isNotNullNorUndefined(substance) ? (
                    <DsfrButtonIcon
                      onClick={substanceMoveUp(n)}
                      title={`Augmenter l’importance de la substance ${SubstancesLegale[substance].nom}`}
                      buttonType="secondary"
                      icon="fr-icon-arrow-up-fill"
                      class="fr-ml-2w"
                    />
                  ) : null}

                  <DsfrButtonIcon
                    onClick={substanceRemove(n)}
                    title={`Supprimer la substance ${isNotNullNorUndefined(substance) ? SubstancesLegale[substance].nom : ''}`}
                    buttonType="secondary"
                    icon="fr-icon-delete-bin-line"
                    class="fr-ml-2w"
                  />
                </div>
              </div>
            ))}

            {editedSubstances.value.every(substanceId => isNotNullNorUndefined(substanceId)) ? (
              <DsfrButtonIcon onClick={substanceAdd} buttonType="primary" icon="fr-icon-add-line" title="Ajouter une substance" class="fr-mt-2w" style={{ alignSelf: 'end' }} />
            ) : null}
          </div>
        </div>
      )}
      read={() => (
        <div class="fr-input-group fr-input-group--disabled fr-mb-0">
          <label class="fr-label">Substances</label>
          <div class="fr-mt-1w">
            {substanceNoms.value.map(sub => (
              <DsfrTag class="fr-mr-1w" ariaLabel={capitalize(sub)} />
            ))}
          </div>
        </div>
      )}
      updateHeritage={updateHeritage}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SubstancesEdit.props = ['substances', 'heritageSubstances', 'domaineId', 'updateSubstances', 'updateHeritage']
