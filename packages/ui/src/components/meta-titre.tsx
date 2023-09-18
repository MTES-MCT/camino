import { FunctionalComponent } from 'vue'
import { MetaPageTemplate } from './metas/meta-page-template'
import { DefinitionTree } from './metas/definition-edit'

const definitionsTree = {
  id: 'titres-types',
  foreignKey: 'titreTypeId',
  definitions: [
    {
      id: 'titres-statuts',
      foreignKey: 'titreStatutId',
      joinTable: 'titre-types--titres-statuts',
    },
    {
      id: 'demarches-types',
      foreignKey: 'demarcheTypeId',
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
export const MetaTitre: FunctionalComponent = () => <MetaPageTemplate title="Titre" definitionsTree={definitionsTree} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
MetaTitre.displayName = 'MetaTitre'
