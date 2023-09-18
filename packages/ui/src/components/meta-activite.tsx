import { FunctionalComponent } from 'vue'
import { MetaPageTemplate } from './metas/meta-page-template'
import { DefinitionTree } from './metas/definition-edit'

const definitionsTree = {
  id: 'activites-types',
  foreignKey: 'activiteTypeId',
} as const satisfies DefinitionTree
export const MetaActivite: FunctionalComponent = () => <MetaPageTemplate title="Activité" definitionsTree={definitionsTree} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
MetaActivite.displayName = 'MetaActivite'
