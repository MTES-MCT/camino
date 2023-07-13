import { HTMLAttributes } from 'vue'
import { FilterComponentProp, FilterSelect } from './all-filters'
import { Button } from './button'
import { ButtonIcon } from './button-icon'
import { Icon } from './icon'

type Props<T extends {id: Id}, Id extends string> = {
  filter: FilterComponentProp<FilterSelect<T, Id>, T, Id>
}& Pick<HTMLAttributes, 'class'>

export function FiltersSelects<Id extends string, T extends {id: Id}>(props: Props<T, Id>) {
  return (
    <div class="mb">
      <h5>{props.filter.name}</h5>
      <hr class="mb-s" />

      {props.filter.value.map((_, n) => (
        <div class="flex mb-s">
          <select v-model={props.filter.value[n]} class="p-s mr-s" key={n}>
            {props.filter.elements.map(element => (
              <option key={element.id} value={element.id} disabled={props.filter.value.includes(element.id)}>
                {element[props.filter.elementName]}
              </option>
            ))}
          </select>

          <ButtonIcon class="btn py-s px-m rnd-xs" onClick={() => props.filter.value.splice(n, 1)} icon="minus" title="Supprime le filtre" />
        </div>
      ))}

      {!props.filter.value || !props.filter.value.some(v => v === '') ? (
        <Button
          class="btn small rnd-xs py-s px-m full-x flex mb-s"
          onClick={() => props.filter.value.push('')}
          title="Ajoute le filtre"
          render={() => (
            <>
              <span class="mt-xxs">{props.filter.buttonAdd}</span>
              <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
            </>
          )}
        />
      ) : null}
    </div>
  )
}
