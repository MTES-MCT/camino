import gql from 'graphql-tag'
import { fragmentTitreEntreprises } from './entreprises'
import { fragmentPoint } from './point'
import { fragmentGeojsonMultiPolygon } from './geojson'
import { fragmentDocumentType } from './metas'

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
    type {
      id
      nom
    }
    statutId
    titulaires {
      ...titreEntreprises
    }
    amodiataires {
      ...titreEntreprises
    }
    points {
      ...point
    }
    substances
    contenu
  }

  ${fragmentTitreEntreprises}

  ${fragmentPoint}
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
    surface {
      ...heritageProp
    }
    points {
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
    type {
      id
      nom
      documentsTypes {
        ...documentType
      }
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

    substances

    contenu

    heritageProps {
      ...heritageProps
    }

    heritageContenu
  }

  ${fragmentTitreEntreprises}

  ${fragmentPoint}

  ${fragmentHeritageProps}

  ${fragmentDocumentType}
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
    type {
      id
      nom
      documentsTypes {
        ...documentType
      }
    }
    statutId
    titulaires {
      ...titreEntreprises
    }
    amodiataires {
      ...titreEntreprises
    }
    points {
      ...point
    }
    geojsonMultiPolygon {
      ...geojsonMultiPolygon
    }
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
  }

  ${fragmentTitreEntreprises}

  ${fragmentPoint}

  ${fragmentGeojsonMultiPolygon}

  ${fragmentDocument}

  ${fragmentHeritageProps}

  ${fragmentDocumentType}
`

export { fragmentEtapeHeritage, fragmentEtape }
