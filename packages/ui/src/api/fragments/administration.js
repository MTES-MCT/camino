import gql from 'graphql-tag'
import { fragmentUtilisateur } from './utilisateur'

const fragmentAdministration = gql`
  fragment administration on Administration {
    id
    emailsModification
    utilisateurs {
      ...utilisateur
    }
    titresTypes {
      id
      domaine {
        id
        nom
      }
      type {
        id
        nom
      }
      gestionnaire
      associee
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
      titreStatut {
        id
        nom
        couleur
      }
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
