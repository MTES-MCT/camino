import { useState } from '@/utils/vue-tsx-utils'
import { SubstancesLegales, SubstancesLegale, SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { DeepReadonly, computed, defineComponent, watch } from 'vue'
import { HeritageEdit } from '@/components/etape/heritage-edit'
import { DomaineId } from 'camino-common/src/static/domaines'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { SubstanceLegaleTypeahead } from '../_common/substance-legale-typeahead'
import { DsfrTag } from '../_ui/tag'
import { capitalize } from 'camino-common/src/strings'
import { FlattenEtape } from 'camino-common/src/etape-form'

type Props = {
  substances: DeepReadonly<FlattenEtape['substances']>
  domaineId: DomaineId
  updateSubstances: (substances: DeepReadonly<FlattenEtape['substances']>) => void
}

type SubstancesEditables = Pick<FlattenEtape['substances'], 'heritee' | 'etapeHeritee'> & { value: (SubstanceLegaleId | undefined)[] }
export const SubstancesEdit = defineComponent<Props>(props => {
  const [editedSubstances, setEditedSubstances] = useState<DeepReadonly<SubstancesEditables>>(
    isNullOrUndefinedOrEmpty(props.substances.value) ? { ...props.substances, value: [undefined] } : props.substances
  )

  const substancesLength = computed<number>(() => editedSubstances.value.value.filter(substanceId => substanceId).length)

  const updateHeritage = (substanceHeritageValue: DeepReadonly<FlattenEtape['substances']>) => {
    setEditedSubstances(substanceHeritageValue)
  }

  watch(
    () => editedSubstances.value,
    () => {
      props.updateSubstances({ ...editedSubstances.value, value: editedSubstances.value.value.filter(isNotNullNorUndefined) })
    },
    { deep: true }
  )

  const substancesToDisplay = computed<SubstanceLegaleId[]>(() => {
    return SubstancesLegales.filter(({ domaineIds }) => domaineIds.includes(props.domaineId))
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .filter(({ id }) => !editedSubstances.value.value.some(substanceId => substanceId === id))
      .map(({ id }) => id)
  })

  const substanceNoms = computed<string[]>(() => {
    return props.substances.etapeHeritee?.value.filter((substanceId): substanceId is SubstanceLegaleId => !!substanceId).map(substanceId => SubstancesLegale[substanceId].nom) || []
  })

  const substanceAdd = (): void => {
    setEditedSubstances({ ...editedSubstances.value, value: [...editedSubstances.value.value, undefined] })
  }

  const substanceRemove = (index: number) => (): void => {
    setEditedSubstances({ ...editedSubstances.value, value: editedSubstances.value.value.filter((_, myIndex) => index !== myIndex) })
  }

  const substanceMoveDown = (index: number) => () => {
    const mySubstance = editedSubstances.value.value[index]
    const myPrevious = editedSubstances.value.value[index + 1]

    setEditedSubstances({
      ...editedSubstances.value,
      value: editedSubstances.value.value.map((substance, myIndex) => {
        if (myIndex === index) {
          return myPrevious
        } else if (myIndex === index + 1) {
          return mySubstance
        }

        return substance
      }),
    })
  }

  const substanceMoveUp = (index: number) => () => {
    const mySubstance = editedSubstances.value.value[index]
    const myPrevious = editedSubstances.value.value[index - 1]

    setEditedSubstances({
      ...editedSubstances.value,
      value: editedSubstances.value.value.map((substance, myIndex) => {
        if (myIndex === index) {
          return myPrevious
        } else if (myIndex === index - 1) {
          return mySubstance
        }

        return substance
      }),
    })
  }

  const substanceUpdate = (index: number) => (id: SubstanceLegaleId | null) => {
    if (id !== null) {
      setEditedSubstances({
        ...editedSubstances.value,
        value: editedSubstances.value.value.map((substance, myIndex) => {
          if (myIndex === index) {
            return id
          }

          return substance
        }),
      })
    }
  }

  return () => (
    <HeritageEdit
      prop={{ ...editedSubstances.value, value: editedSubstances.value.value.filter(isNotNullNorUndefined) }}
      hasHeritageValue={isNotNullNorUndefinedNorEmpty(editedSubstances.value.etapeHeritee?.value)}
      label="Substances"
      write={() => (
        <div class="fr-input-group fr-mb-0">
          <label class="fr-label" for={`typeahead_substances_${editedSubstances.value.value.length - 1}`}>
            Substances
          </label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {editedSubstances.value.value.map((substance, n) => (
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

            {editedSubstances.value.value.every(substanceId => isNotNullNorUndefined(substanceId)) ? (
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
