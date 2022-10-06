import gql from 'graphql-tag'

import { fragmentTitreType } from './metas'
import { fragmentTitreDemarche } from './titre-demarche'
import { fragmentTitreActivite } from './titre-activite'
import { fragmentTitreAdministrations } from './administrations'
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
    type {
      ...titreType
      sections
    }
    domaine {
      id
      nom
    }
    titreStatutId
    references {
      type {
        id
        nom
      }
      nom
    }
    substances
    dateDebut
    dateFin
    activitesEnConstruction
    activitesAbsentes
    activitesDeposees
    surface
    administrations {
      ...titreAdministrations
    }
    titresAdministrations {
      id
    }
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

    sdomZones {
      nom
    }

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

  ${fragmentTitreAdministrations}

  ${fragmentTitreEntreprises}

  ${fragmentTitreDemarche}

  ${fragmentTitreActivite}

  ${fragmentPoint}

  ${fragmentGeojsonPoints}

  ${fragmentGeojsonMultiPolygon}

  ${fragmentCommune}

  ${fragmentTitreType}
`

const fragmentTitres = gql`
  fragment titres on Titre {
    id
    slug
    nom
    type {
      ...titreType
    }
    domaineId
    domaine {
      id
      nom
    }
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
    references {
      type {
        nom
      }
      nom
    }
  }

  ${fragmentTitresEntreprises}

  ${fragmentTitreType}
`

const fragmentTitreGeo = gql`
  fragment titreGeo on Titre {
    id
    slug
    nom
    type {
      ...titreType
    }
    domaine {
      id
      nom
    }
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
  ${fragmentTitreType}
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
    type {
      ...titreType
    }
    domaine {
      id
      nom
    }
    titreStatutId
    references {
      type {
        nom
      }
      nom
    }
  }

  ${fragmentTitreType}
`

export {
  fragmentTitre,
  fragmentTitres,
  fragmentTitresGeo,
  fragmentTitresGeoPolygon,
  fragmentDemarchesTitre
}
