import { FunctionalComponent, HTMLAttributes } from 'vue'

interface Props {
  title: () => JSX.Element
  content: () => JSX.Element
  buttons?: () => JSX.Element
}

export const Card: FunctionalComponent<Props & HTMLAttributes['class']> = props => {
  const Title = props.title
  const Content = props.content
  const Buttons = props.buttons ?? null

  return (
    <div class="flex flex-direction-column rnd-s border bg-bg">
      {props.buttons ? (
        <div class="accordion-header flex  border-b-s">
          <div class="py-s px-m">
            <Title />
          </div>

          <div class="overflow-hidden flex flex-end flex-right">
            <Buttons />
            <div class="py-s" style="width: calc(2.5 * var(--unit))" />
          </div>
        </div>
      ) : (
        <div class="py-s px-m border-b-s">
          <Title />
        </div>
      )}

      <div class="border-b-s">
        <Content />
      </div>
    </div>
  )
}
