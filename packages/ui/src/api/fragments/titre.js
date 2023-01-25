import gql from 'graphql-tag'

import { fragmentTitreDemarche } from './titre-demarche'
import { fragmentTitreActivite } from './titre-activite'
import {
  fragmentTitreEntreprises,
  fragmentTitresEntreprises
} from './entreprises'

import { fragmentPoint } from './point'

import { fragmentGeojsonPoints, fragmentGeojsonMultiPolygon } from './geojson'
import { fragmentCommune } from '@/api/fragments/commune'

const fragmentTitre = gql`
  fragment titre on Titre {
    id
    slug
    nom
    typeId
    type {
      sections
    }
    titreStatutId
    references {
      referenceTypeId
      nom
    }
    substances
    dateDebut
    dateFin
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
      ...commune
    }
    demarches {
      ...titreDemarche
    }
    activites {
      ...titreActivite
    }

    forets {
      nom
    }

    sdomZones
    secteursMaritime

    contenu

    modification
    suppression
    demarchesCreation
    travauxCreation
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

  ${fragmentCommune}
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
      departementId
    }
    secteursMaritime
    references {
      referenceTypeId
      nom
    }
  }

  ${fragmentTitresEntreprises}
`

const fragmentTitreGeo = gql`
  fragment titreGeo on Titre {
    id
    slug
    nom
    typeId
    titreStatutId
    titulaires {
      ...titresEntreprises
    }
    amodiataires {
      ...titresEntreprises
    }

    geojsonCentre {
      geometry {
        coordinates
      }
    }
  }
  ${fragmentTitresEntreprises}
`

const fragmentTitresGeo = gql`
  fragment titresGeo on Titre {
    ...titreGeo
  }

  ${fragmentTitreGeo}
`

const fragmentTitresGeoPolygon = gql`
  fragment titresGeoPolygon on Titre {
    ...titreGeo
    geojsonMultiPolygon {
      ...geojsonMultiPolygon
    }
  }

  ${fragmentTitreGeo}
  ${fragmentGeojsonMultiPolygon}
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

export {
  fragmentTitre,
  fragmentTitres,
  fragmentTitresGeo,
  fragmentTitresGeoPolygon,
  fragmentDemarchesTitre
}
