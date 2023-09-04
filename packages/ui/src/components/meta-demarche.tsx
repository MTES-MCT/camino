import { FunctionalComponent } from 'vue'
import { MetaPageTemplate } from './metas/meta-page-template'
import { DefinitionTree } from './metas/definition-edit'

const definitionsTree = {
  id: 'demarches-types',
  foreignKey: 'demarcheTypeId',
  definitions: [
    {
      id: 'titres-types',
      foreignKey: 'titreTypeId',
      joinTable: 'titres-types--demarches-types',
      definitions: [
        {
          id: 'etapes-types',
          foreignKey: 'etapeTypeId',
          joinTable: 'titres-types--demarches-types--etapes-types',
          definitions: [
            {
              id: 'documents-types',
              foreignKey: 'documentTypeId',
              joinTable: 'titres-types--demarches-types--etapes-types--documents-types',
              definitions: [],
            },
            {
              id: 'documents-types',
              foreignKey: 'documentTypeId',
              joinTable: 'titres-types--demarches-types--etapes-types--justificatifs-types',
              definitions: [],
            },
          ],
        },
      ],
    },
  ],
} as const satisfies DefinitionTree
export const MetaDemarche: FunctionalComponent = () => <MetaPageTemplate title="Démarche" definitionsTree={definitionsTree} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
MetaDemarche.displayName = 'MetaDemarche'
