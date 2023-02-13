import { defineComponent } from "vue";
import { Icon } from '@/components/_ui/icon'


type ColumnIds = Props['columns'][number]['id']
interface Props {
  columns: {id: string, noSort: boolean, class: string, name: string}[]
  update: (column: ColumnIds, order: 'asc' | 'desc') => void
  column: ColumnIds
  order: 'asc' | 'desc'
}

export const Table = defineComponent<Props>({setup(props) {

  const sort = (colId: ColumnIds) => {
    if (!props.columns.find(c => c.id === colId)?.noSort) {
      if (props.column === colId) {
        const order = props.order === 'asc' ? 'desc' : 'asc'
        props.update(props.column, order)
      } else {
        props.update(colId, props.order)
      }
    }
  },
  return () => (<div>
    <div class="overflow-scroll-x mb">
      <div class="table">
        <div class="tr">
          {props.columns.map(col => (<div
            key={col.id}
            class={`th nowrap ${col.class}`}
            onClick={() => sort(col.id)}
          >
            <button
              class={`${col.noSort ? 'disabled': ''} btn-menu full-x p-0`}
            >
              { col.name || (props.column === col.id ? '' : '–') }
              {!col.noSort && props.column === col.id ? (<Icon
                v-if="!col.noSort && column === col.id"
                class="right"
                size="M"
                name={props.order === 'asc' ? 'chevron-bas' : 'chevron-haut'}
              />) : null}
              
            </button>
          </div>))}
        </div>

        // <router-link
        //   v-for="row in rows"
        //   :key="row.id"
        //   :to="row.link"
        //   class="tr tr-link text-decoration-none"
        // >
        //   <div
        //     v-for="col in columns"
        //     :key="col.id"
        //     class="td"
        //     :class="col.class"
        //   >
        //     <component
        //       :is="row.columns[col.id].component"
        //       v-if="
        //         row.columns[col.id] &&
        //         row.columns[col.id].component &&
        //         row.columns[col.id].slot
        //       "
        //       v-bind="row.columns[col.id].props"
        //       :class="row.columns[col.id].class"
        //       >{{ row.columns[col.id].value }}</component
        //     >
        //     <component
        //       :is="row.columns[col.id].component"
        //       v-else-if="row.columns[col.id] && row.columns[col.id].component"
        //       v-bind="row.columns[col.id].props"
        //       :class="row.columns[col.id].class"
        //     />
        //     <span
        //       v-else-if="row.columns[col.id] && row.columns[col.id].value"
        //       :class="row.columns[col.id].class"
        //       >{{ row.columns[col.id].value }}</span
        //     >
        //   </div>
        // </router-link>
      </div>
    </div>
  </div>)
}})

{
/* <template>
  
</template>

<script>
import { Icon } from '@/components/_ui/icon'
export default {
  name: 'UiTable',
  components: { Icon },
  props: {
    rows: { type: Array, required: true },
    columns: { type: Array, required: true },
    order: { type: String, default: 'asc' },
    column: { type: String, default: '' }
  },

  emits: ['params-update'],

  watch: {
    columns: 'columnInit'
  },

  methods: {
    update(params) {
      this.$emit('params-update', params)
    },

    

    columnInit() {
      if (this.rows.length && !this.columns.some(c => c.id === this.column)) {
        this.sort(this.columns[0].id)
      }
    }
  }
}
</script> */}
