import gql from 'graphql-tag'

export const fragmentTitreEntreprises = gql`
  fragment titreEntreprises on Entreprise {
    id
    nom
    paysId
    legalSiren
    legalEtranger
    legalForme
    adresse
    codePostal
    commune
    cedex
    url
    etablissements {
      id
      nom
      dateDebut
      dateFin
    }
    operateur
  }
`

export const fragmentTitresEntreprises = gql`
  fragment titresEntreprises on Entreprise {
    id
    nom
    adresse
    codePostal
    commune
    legalSiren
    legalEtranger
  }
`
