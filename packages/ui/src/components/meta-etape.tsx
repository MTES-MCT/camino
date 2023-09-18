import { FunctionalComponent } from 'vue'
import { MetaPageTemplate } from './metas/meta-page-template'
import { DefinitionTree } from './metas/definition-edit'

const definitionsTree = {
  id: 'etapes-types',
  foreignKey: 'etapeTypeId',
  definitions: [
    {
      id: 'etapes-statuts',
      foreignKey: 'etapeStatutId',
      joinTable: 'etapes-types--etapes-statuts',
      definitions: [],
    },
    {
      id: 'documents-types',
      foreignKey: 'documentTypeId',
      joinTable: 'etapes-types--documents-types',
      definitions: [],
    },
    {
      id: 'documents-types',
      foreignKey: 'documentTypeId',
      joinTable: 'etapes-types--justificatifs-types',
      definitions: [],
    },
    {
      id: 'titres-types',
      foreignKey: 'titreTypeId',
      definitions: [
        {
          id: 'demarches-types',
          foreignKey: 'demarcheTypeId',
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
export const MetaEtape: FunctionalComponent = () => <MetaPageTemplate title="Étape" definitionsTree={definitionsTree} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
MetaEtape.displayName = 'MetaEtape'
