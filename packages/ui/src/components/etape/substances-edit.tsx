import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { SubstancesLegales, SubstancesLegale, SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { computed, ref } from 'vue'
import { HeritageEdit } from '@/components/etape/heritage-edit'
import { TagList } from '@/components/_ui/tag-list'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EtapeFondamentale, EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import {isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { SubstanceLegaleTypeahead } from '../_common/substance-legale-typeahead'

export type Props = {
  substances: SubstanceLegaleId[]
  heritageProps: EtapeWithHeritage<'substances', Pick<EtapeFondamentale, 'substances' | 'typeId' | 'date'>>['heritageProps']
  domaineId: DomaineId
  updateSubstances: (substances: SubstanceLegaleId[]) => void
  updateHeritage: (subtances: Props['heritageProps']['substances']) => void
}
export const SubstancesEdit = caminoDefineComponent<Props>(['substances', 'heritageProps', 'domaineId', 'updateSubstances', 'updateHeritage'], props => {

  const editedSubstances = ref<(SubstanceLegaleId | undefined)[]>(structuredClone(props.substances))
  const heritageActif = ref<Props['heritageProps']['substances']>(props.heritageProps.substances)

  const substancesLength = computed<number>(() => editedSubstances.value.filter(substanceId => substanceId).length)

  const updateHeritage = (actif: Props['heritageProps']['substances']) => {
    heritageActif.value = actif
    props.updateHeritage(actif)
  }



  const substancesToDisplay = computed<SubstanceLegaleId[]>( ()=> {
    return SubstancesLegales
    .filter(({ domaineIds }) => domaineIds.includes(props.domaineId)).sort((a, b) => a.nom.localeCompare(b.nom))
    .filter(({id}) => !editedSubstances.value.some(substanceId => substanceId === id))
    .map(({id}) => id)

  })

  const substanceNoms = computed<string[]>(() => {
    return props.heritageProps.substances.etape?.substances.filter((substanceId): substanceId is SubstanceLegaleId => !!substanceId).map(substanceId => SubstancesLegale[substanceId].nom) || []
  })

  const substanceAdd = (): void => {
    editedSubstances.value.push(undefined)
  }

  const substanceRemove = (index: number) => (): SubstanceLegaleId | undefined =>  {
    return editedSubstances.value.splice(index, 1)[0]
  }

  const substanceMoveDown = (index: number) => () => {
    const substance = substanceRemove(index)()
    editedSubstances.value.splice(index + 1, 0, substance)
  }

  const substanceMoveUp = (index: number) => () => {
    const substance = substanceRemove(index)()
    editedSubstances.value.splice(index - 1, 0, substance)
  }

  const substanceUpdate = (index: number) => (id: SubstanceLegaleId | null) => {
    if (id !== null) {
      editedSubstances.value[index] = id
    }
  }

  return () => (
    <div class='dsfr'>
      <h3>Substances</h3>
      <HeritageEdit
        prop={heritageActif.value}
        propId="substances"
        write={() => (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {editedSubstances.value.map((substance, n) => (
              <div key={substance ?? ''}>
                <div style={{display: 'flex'}} class='fr-mt-2w'>
                  <SubstanceLegaleTypeahead initialValue={substance} substanceLegaleIds={isNotNullNorUndefined(substance) ? [...substancesToDisplay.value, substance] : substancesToDisplay.value} substanceLegaleSelected={substanceUpdate(n)} />
                  {substancesLength.value && n + 1 < substancesLength.value ? (
                    <DsfrButtonIcon onClick={substanceMoveDown(n)}
                    title={`Diminuer l’importance de la substance ${isNotNullNorUndefined(substance) ? SubstancesLegale[substance].nom : ''}`}
                    buttonType='secondary'
                    class='fr-ml-2w'
                    icon="fr-icon-arrow-down-fill"/>
                  ) : null}

                  {substancesLength.value && n > 0 &&isNotNullNorUndefined(substance) ? (
                    <DsfrButtonIcon
                      onClick={substanceMoveUp(n)}
                      title={`Augmenter l’importance de la substance ${ SubstancesLegale[substance].nom}`}
                      buttonType='secondary'
                      icon="fr-icon-arrow-up-fill"
                      class='fr-ml-2w'
                    />
                  ) : null}

                  <DsfrButtonIcon
                    onClick={substanceRemove(n)}
                    title={`Supprimer la substance ${isNotNullNorUndefined(substance) ? SubstancesLegale[substance].nom : ''}`}
                    buttonType='secondary'
                    icon="fr-icon-delete-bin-line"
                    class='fr-ml-2w'
                  />
                </div>
              </div>
            ))}

            {editedSubstances.value.every(substanceId => isNotNullNorUndefined(substanceId)) ? (
              <DsfrButtonIcon
                onClick={substanceAdd}
                buttonType='primary'
                icon='fr-icon-add-line'
                title="Ajouter une substance"
                class='fr-mt-2w'
                style={{alignSelf: 'end'}}
              />
            ) : null}
          </div>
        )}
        read={() => <TagList class="mb-s" elements={substanceNoms.value} />}
        updateHeritage={updateHeritage}
      />
    </div>
  )
})
