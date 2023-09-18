import { FunctionalComponent } from 'vue'
import { DefinitionEdit, DefinitionTree } from '@/components/metas/definition-edit'

interface Props {
  title: string
  definitionsTree: DefinitionTree
}
export const MetaPageTemplate: FunctionalComponent<Props> = props => {
  return (
    <div>
      <div class="desktop-blobs">
        <div class="desktop-blob-2-3">
          <router-link to={{ name: 'metas' }}>
            <h5>Métas</h5>
          </router-link>
          <h1>
            <span class="cap-first">{props.title}</span>
          </h1>
        </div>
      </div>

      <div class="line-neutral width-full mb-m" />

      <div class="mb-xxl">
        <DefinitionEdit definitionsTree={props.definitionsTree} />
      </div>
    </div>
  )
}
