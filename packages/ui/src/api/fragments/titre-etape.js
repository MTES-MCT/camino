import gql from 'graphql-tag'
import { fragmentTitreEntreprises } from './entreprises'
import { fragmentPoint } from './point'
import { fragmentGeojsonMultiPolygon } from './geojson'
import { fragmentDemarcheType, fragmentDocumentType } from './metas'

import { fragmentDocument } from './documents'
import { fragmentCommune } from '@/api/fragments/commune'

const fragmentIncertitudes = gql`
  fragment incertitudes on Incertitudes {
    date
    dateDebut
    dateFin
    duree
    surface
    points
    substances
    titulaires
    amodiataires
  }
`

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
    incertitudes {
      ...incertitudes
    }
    type {
      id
      nom
      sections
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

  ${fragmentIncertitudes}

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

const fragmentTitreEtape = gql`
  fragment titreEtape on Etape {
    id
    slug
    ordre
    date
    dateDebut
    dateFin
    duree
    surface
    type {
      id
      nom
      sections
      documentsTypes {
        ...documentType
      }
      justificatifsTypes {
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
    justificatifs {
      ...document
    }
    incertitudes {
      ...incertitudes
    }
    heritageProps {
      ...heritageProps
    }
    communes {
      ...commune
    }
    contenu
    heritageContenu
    decisionsAnnexesSections
    decisionsAnnexesContenu

    deposable
  }

  ${fragmentTitreEntreprises}

  ${fragmentPoint}

  ${fragmentGeojsonMultiPolygon}

  ${fragmentCommune}

  ${fragmentDocument}

  ${fragmentHeritageProps}

  ${fragmentIncertitudes}

  ${fragmentDocumentType}
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
      sections
      documentsTypes {
        ...documentType
      }
      justificatifsTypes {
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
      type {
        ...demarcheType
      }
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
    type {
      id
      nom
      sections
      documentsTypes {
        ...documentType
      }
      justificatifsTypes {
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
    justificatifs {
      ...document
    }
    incertitudes {
      ...incertitudes
    }
    heritageProps {
      ...heritageProps
    }
    communes {
      ...commune
    }
    contenu
    heritageContenu
    decisionsAnnexesSections
    decisionsAnnexesContenu
  }

  ${fragmentDemarcheType}

  ${fragmentTitreEntreprises}

  ${fragmentPoint}

  ${fragmentGeojsonMultiPolygon}

  ${fragmentCommune}

  ${fragmentDocument}

  ${fragmentHeritageProps}

  ${fragmentIncertitudes}

  ${fragmentDocumentType}
`

export { fragmentTitreEtape, fragmentEtapeHeritage, fragmentEtape }
