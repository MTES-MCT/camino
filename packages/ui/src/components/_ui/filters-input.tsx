type Props = {
  filter: {
    name: string
    placeholder: string
    value: string
  }
}

export function FiltersInput(props: Props) {
  return (
    <div class="mb">
      <h5>{props.filter.name}</h5>
      <hr class="mb-s" />

      <input v-model={props.filter.value} type="text" placeholder={props.filter.placeholder} class="p-s" />
    </div>
  )
}
