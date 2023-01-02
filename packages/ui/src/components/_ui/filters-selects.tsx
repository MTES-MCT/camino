import { Icon } from './icon'

type Props = {
  filter: {
    name: string
    placeholder: string
    value: any[]
    buttonAdd: boolean
    elementName: string
    elements: Record<string, any>[]
  }
}

export function FiltersSelects(props: Props) {
  return (
    <div class="mb">
      <h5>{props.filter.name}</h5>
      <hr class="mb-s" />

      {props.filter.value.map((_, n) => (
        <div class="flex mb-s">
          <select v-model={props.filter.value[n]} class="p-s mr-s" key={n}>
            {props.filter.elements.map(element => (
              <option
                key={element.id}
                value={element.id}
                disabled={props.filter.value.includes(element.id)}
              >
                {element[props.filter.elementName]}
              </option>
            ))}
          </select>

          <button
            class="btn py-s px-m rnd-xs"
            onClick={() => props.filter.value.splice(n, 1)}
          >
            <Icon name="minus" size="M" />
          </button>
        </div>
      ))}

      {!props.filter.value || !props.filter.value.some(v => v === '') ? (
        <button
          class="btn small rnd-xs py-s px-m full-x flex mb-s"
          onClick={() => props.filter.value.push('')}
        >
          <span class="mt-xxs">{props.filter.buttonAdd}</span>
          <Icon name="plus" size="M" class="flex-right" />
        </button>
      ) : null}
    </div>
  )
}
