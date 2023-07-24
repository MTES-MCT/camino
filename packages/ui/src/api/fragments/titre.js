import gql from 'graphql-tag'

import { fragmentTitreDemarche } from './titre-demarche'
import { fragmentTitreActivite } from './titre-activite'
import { fragmentTitreEntreprises, fragmentTitresEntreprises } from './entreprises'

import { fragmentPoint } from './point'

import { fragmentGeojsonPoints, fragmentGeojsonMultiPolygon } from './geojson'

const fragmentTitre = gql`
  fragment titre on Titre {
    id
    slug
    nom
    typeId
    titreStatutId
    references {
      referenceTypeId
      nom
    }
    substances
    activitesEnConstruction
    activitesAbsentes
    activitesDeposees
    surface
    administrations
    titulaires {
      ...titreEntreprises
    }
    amodiataires {
      ...titreEntreprises
    }
    points {
      ...point
    }
    geojsonPoints {
      ...geojsonPoints
    }
    geojsonMultiPolygon {
      ...geojsonMultiPolygon
    }
    communes {
      id
    }
    demarches {
      ...titreDemarche
    }
    activites {
      ...titreActivite
    }

    forets
    sdomZones
    secteursMaritime

    modification
    doublonTitre {
      id
      nom
    }
    abonnement
  }

  ${fragmentTitreEntreprises}

  ${fragmentTitreDemarche}

  ${fragmentTitreActivite}

  ${fragmentPoint}

  ${fragmentGeojsonPoints}

  ${fragmentGeojsonMultiPolygon}
`

const fragmentTitres = gql`
  fragment titres on Titre {
    id
    slug
    nom
    typeId
    coordonnees {
      x
      y
    }
    titreStatutId
    substances
    activitesEnConstruction
    activitesAbsentes
    activitesDeposees
    titulaires {
      ...titresEntreprises
    }
    amodiataires {
      ...titresEntreprises
    }
    communes {
      id
    }
    secteursMaritime
    references {
      referenceTypeId
      nom
    }
  }

  ${fragmentTitresEntreprises}
`

const fragmentDemarchesTitre = gql`
  fragment demarchesTitre on Titre {
    id
    slug
    nom
    typeId
    titreStatutId
    references {
      referenceTypeId
      nom
    }
  }
`

export { fragmentTitre, fragmentTitres, fragmentDemarchesTitre }
