import { FunctionalComponent } from 'vue'

interface Props {
  total: number
  active: number
  visibles: number
  pageChange: (page: number) => void
}
export const Pagination: FunctionalComponent<Props> = props => {
  const total = props.total ?? 2
  const active = props.active ?? 1
  const visibles = props.visibles ?? 1

  const delta = () => {
    return Math.round((visibles - 1) / 2)
  }
  const pages = () => {
    let filter
    if (active <= delta()) {
      filter = (n: number) => n <= delta() * 2 + 1
    } else if (active >= total - delta()) {
      filter = (n: number) => n >= total - delta() * 2
    } else {
      filter = (n: number) => n >= active - delta() && n <= active + delta()
    }
    return Array.from(Array(total).keys())
      .map(n => n + 1)
      .filter(filter)
  }

  if (total <= 1) {
    return null
  }
  return (
    <ul class="list-inline">
      <li class="mr-xs">
        <button
          disabled={active === 1}
          class="btn-border rnd-xs px-m py-s"
          onClick={() => props.pageChange(1)}
        >
          «
        </button>
      </li>
      <li class="mr-xs">
        <button
          disabled={active === 1}
          class="btn-border rnd-xs px-m py-s"
          onClick={() => props.pageChange(active - 1)}
        >
          ‹
        </button>
      </li>
      {active > delta() + 1 ? (
        <li class="mr-xs">
          <div class="px-m py-s">…</div>
        </li>
      ) : null}

      {pages().map(page => (
        <li key={page} class={`mr-xs ${active === page ? 'active' : ''}`}>
          <button
            class="btn-border rnd-xs px-m py-s"
            onClick={() => props.pageChange(page)}
          >
            {page}
          </button>
        </li>
      ))}

      {active < total - delta() ? (
        <li class="mr-xs">
          <div class="px-m py-s">…</div>
        </li>
      ) : null}

      <li class="mr-xs">
        <button
          disabled={active === total}
          class="btn-border rnd-xs px-m py-s"
          onClick={() => props.pageChange(active + 1)}
        >
          ›
        </button>
      </li>
      <li class="mr-xs">
        <button
          disabled={active === total}
          class="btn-border rnd-xs px-m py-s"
          onClick={() => props.pageChange(total)}
        >
          »
        </button>
      </li>
    </ul>
  )
}
