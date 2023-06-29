import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { SubstancesLegales, SubstancesLegale, SubstanceLegaleId, SubstanceLegale } from 'camino-common/src/static/substancesLegales'
import { computed } from 'vue'
import { HeritageEdit } from '@/components/etape/heritage-edit'
import { TagList } from '@/components/_ui/tag-list'
import { Icon } from '@/components/_ui/icon'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EtapeFondamentale, EtapeWithIncertitudesAndHeritage } from 'camino-common/src/etape'
import { ButtonIcon } from '../_ui/button-icon'
import { Button } from '../_ui/button'

export type Props = {
  substances: (SubstanceLegaleId | undefined)[]
  heritageProps: EtapeWithIncertitudesAndHeritage<Pick<EtapeFondamentale, 'substances' | 'type' | 'date'>>['heritageProps']
  incertitudes: { substances: boolean }
  domaineId: DomaineId
}
export const SubstancesEdit = caminoDefineComponent<Props>(['substances', 'heritageProps', 'incertitudes', 'domaineId'], props => {
  const substancesLength = computed<number>(() => props.substances?.filter(substanceId => substanceId).length)

  const substancesByDomaine = computed<SubstanceLegale[]>(() => SubstancesLegales.filter(({ domaineIds }) => domaineIds.includes(props.domaineId)).sort((a, b) => a.nom.localeCompare(b.nom)))

  const substanceNoms = computed<string[]>(() => {
    return props.heritageProps.substances.etape?.substances.filter((substanceId): substanceId is SubstanceLegaleId => !!substanceId).map(substanceId => SubstancesLegale[substanceId].nom) || []
  })

  const substanceAdd = (): void => {
    props.substances.push(undefined)
  }

  const substanceRemove = (index: number): SubstanceLegaleId | undefined => {
    return props.substances.splice(index, 1)[0]
  }

  const substanceMoveDown = (index: number): void => {
    const substance = substanceRemove(index)
    props.substances.splice(index + 1, 0, substance)
  }

  const substanceMoveUp = (index: number): void => {
    const substance = substanceRemove(index)
    props.substances.splice(index - 1, 0, substance)
  }
  return () => (
    <div>
      <h3 class="mb-s">Substances</h3>
      <HeritageEdit
        prop={props.heritageProps.substances}
        propId="substances"
        write={() => (
          <>
            {props.substances.map((_substance, n) => (
              <div key={n}>
                <div class="flex mb-s">
                  <select v-model={props.substances[n]} class="p-s mr-s">
                    {substancesByDomaine.value.map(s => (
                      <option key={s.id} value={s.id} disabled={props.substances.some(substanceId => substanceId === s.id)}>
                        {s.nom}
                      </option>
                    ))}
                  </select>
                  {substancesLength.value && n + 1 < substancesLength.value ? (
                    <ButtonIcon class="btn-border py-s px-m rnd-l-xs" onClick={() => substanceMoveDown(n)} title="Diminuer l’importance de la substance" icon="move-down" />
                  ) : null}

                  {substancesLength.value && n > 0 && props.substances[n] ? (
                    <ButtonIcon
                      class={['btn-border', 'py-s', 'px-m', !(substancesLength.value && n + 1 < substancesLength.value) ? 'rnd-l-xs' : null]}
                      onClick={() => substanceMoveUp(n)}
                      title="Augmenter l’importance de la substances"
                      icon="move-up"
                    />
                  ) : null}

                  <ButtonIcon
                    class={['btn', 'py-s', 'px-m', 'rnd-r-xs', !props.substances[n] || substancesLength.value === 1 ? 'rnd-l-xs' : null]}
                    onClick={() => substanceRemove(n)}
                    title="Supprimer la substance"
                    icon="minus"
                  />
                </div>
              </div>
            ))}

            {props.substances?.every(substanceId => !!substanceId) ? (
              <Button
                class="btn small rnd-xs py-s px-m full-x flex mb-s"
                onClick={substanceAdd}
                title="Ajouter une substance"
                render={() => (
                  <>
                    <span class="mt-xxs">Ajouter une substance</span>
                    <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
                  </>
                )}
              />
            ) : null}

            {substancesLength.value ? (
              <div class="h6">
                <label>
                  <input v-model={props.incertitudes.substances} type="checkbox" class="mr-xs" />
                  Incertain
                </label>
              </div>
            ) : null}
          </>
        )}
        read={() => <TagList class="mb-s" elements={substanceNoms.value} />}
      />
    </div>
  )
})
