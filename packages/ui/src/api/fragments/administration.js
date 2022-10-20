import gql from 'graphql-tag'
import { fragmentUtilisateur } from './utilisateur'

const fragmentAdministration = gql`
  fragment administration on Administration {
    id
    emailsModification
    utilisateurs {
      ...utilisateur
    }
    titresTypesTitresStatuts {
      titreType {
        id
        domaine {
          id
          nom
        }
        type {
          id
          nom
        }
      }
      titreStatutId
      titresModificationInterdit
      demarchesModificationInterdit
      etapesModificationInterdit
    }
    titresTypesEtapesTypes {
      titreType {
        id
        type {
          id
          nom
        }
        domaine {
          id
          nom
        }
      }
      etapeType {
        id
        nom
      }
      lectureInterdit
      creationInterdit
      modificationInterdit
    }

    activitesTypes {
      id
      nom
      lectureInterdit
      modificationInterdit
    }

    modification
  }

  ${fragmentUtilisateur}
`

export { fragmentAdministration }
