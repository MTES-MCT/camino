import gql from 'graphql-tag'
import { fragmentTitreEntreprises } from './entreprises'

import { fragmentDocument } from './documents'

// fragment qui représente l’étape dont on hérite sur une prop
const fragmentHeritageEtape = gql`
  fragment heritageEtape on Etape {
    id
    titreDemarcheId
    ordre
    date
    dateDebut
    dateFin
    duree
    surface
    typeId
    statutId
    titulaires {
      ...titreEntreprises
    }
    amodiataires {
      ...titreEntreprises
    }
    geojson4326Perimetre
    geojson4326Points
    geojsonOriginePoints
    geojsonOriginePerimetre
    geojsonOrigineGeoSystemeId
    substances
    contenu
  }

  ${fragmentTitreEntreprises}
`

const fragmentHeritageProps = gql`
  fragment heritageProps on HeritageProps {
    dateDebut {
      ...heritageProp
    }
    dateFin {
      ...heritageProp
    }
    duree {
      ...heritageProp
    }
    perimetre {
      ...heritageProp
    }
    substances {
      ...heritageProp
    }
    titulaires {
      ...heritageProp
    }
    amodiataires {
      ...heritageProp
    }
  }

  fragment heritageProp on HeritageProp {
    etape {
      ...heritageEtape
    }
    actif
  }

  ${fragmentHeritageEtape}
`

const fragmentEtapeHeritage = gql`
  fragment etapeHeritage on EtapeHeritage {
    dateDebut
    dateFin
    duree
    surface
    typeId

    titulaires {
      ...titreEntreprises
    }

    amodiataires {
      ...titreEntreprises
    }

    geojson4326Perimetre
    geojson4326Points
    geojsonOriginePoints
    geojsonOriginePerimetre
    geojsonOrigineGeoSystemeId

    substances

    contenu

    heritageProps {
      ...heritageProps
    }

    heritageContenu
  }

  ${fragmentTitreEntreprises}

  ${fragmentHeritageProps}
`

const fragmentEtape = gql`
  fragment etape on Etape {
    id
    slug
    titreDemarcheId
    demarche {
      id
      typeId
      titre {
        id
        slug
        nom
        typeId
      }
    }
    ordre
    date
    dateDebut
    dateFin
    duree
    surface
    typeId
    statutId
    titulaires {
      ...titreEntreprises
    }
    amodiataires {
      ...titreEntreprises
    }
    geojson4326Perimetre
    geojson4326Points
    geojsonOriginePoints
    geojsonOriginePerimetre
    geojsonOrigineGeoSystemeId
    substances
    documents {
      ...document
    }
    heritageProps {
      ...heritageProps
    }
    contenu
    heritageContenu
    decisionsAnnexesSections
    decisionsAnnexesContenu
    notes
  }

  ${fragmentTitreEntreprises}

  ${fragmentDocument}

  ${fragmentHeritageProps}
`

export { fragmentEtapeHeritage, fragmentEtape }
