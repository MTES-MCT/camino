import gql from 'graphql-tag'
import { fragmentTitresEntreprises } from './entreprises'
import { fragmentDocument } from './documents'
import { fragmentActiviteType } from './metas-activites'

const fragmentTitreActivite = gql`
  fragment titreActivite on Activite {
    id
    slug
    type {
      ...activiteType
    }
    activiteStatutId
    date
    annee
    periodeId
    dateSaisie
    sections
    contenu

    suppression
    modification
    deposable

    documents {
      ...document
    }
  }

  ${fragmentActiviteType}

  ${fragmentDocument}
`

const fragmentActivites = gql`
  fragment activites on Activite {
    id
    slug
    titre {
      id
      nom
      titulaires {
        ...titresEntreprises
      }
      amodiataires {
        ...titresEntreprises
      }
    }
    type {
      ...activiteType
    }
    activiteStatutId
    date
    annee
    periodeId
    dateSaisie
    sections
    contenu

    suppression
    modification
    deposable
  }

  ${fragmentActiviteType}

  ${fragmentTitresEntreprises}
`

const fragmentActivite = gql`
  fragment activite on Activite {
    id
    slug
    titre {
      id
      slug
      nom
      titulaires {
        ...titresEntreprises
      }
      amodiataires {
        ...titresEntreprises
      }
    }
    type {
      ...activiteType
    }
    activiteStatutId
    date
    annee
    periodeId
    dateSaisie
    sections
    contenu

    documents {
      ...document
    }

    suppression
    modification
    deposable
  }

  ${fragmentActiviteType}

  ${fragmentTitresEntreprises}

  ${fragmentDocument}
`

export { fragmentActivites, fragmentActivite, fragmentTitreActivite }
