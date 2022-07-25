export interface IApiSirenUniteLegalePeriode
  extends IApiSirenUnionUniteLegalePeriodeEtablissmentUnite {
  dateDebut: Date
  dateFin: Date
}

export interface IApiSirenUnionUniteLegalePeriodeEtablissmentUnite {
  nicSiegeUniteLegale: string | null
  denominationUniteLegale: string | null
  denominationUsuelle1UniteLegale: string | null
  nomUniteLegale: string | null
}

export interface IApiSirenUnionUniteLegaleEtablissmentUnite {
  prenomUsuelUniteLegale: string
  sexeUniteLegale: 'F' | 'M' | null
  sigleUniteLegale: string | null
}

export interface IApiSirenEtablissementUnite
  extends IApiSirenUnionUniteLegalePeriodeEtablissmentUnite,
    IApiSirenUnionUniteLegaleEtablissmentUnite {
  categorieEntreprise: string
  categorieJuridiqueUniteLegale: string
  dateCreationUniteLegale: Date | null
}

export interface IApiSirenEtablissementAdresse {
  codeCedexEtablissement: string | null
  codePaysEtrangerEtablissement: string | null
  numeroVoieEtablissement: string | null
  indiceRepetitionEtablissement: string | null
  typeVoieEtablissement: string | null
  libelleVoieEtablissement: string | null
  codePostalEtablissement: string | null
  libelleCommuneEtablissement: string
  libelleCommuneEtrangerEtablissement: string
}

export interface IApiSirenEtablissement {
  adresseEtablissement: IApiSirenEtablissementAdresse
  siren: string
  uniteLegale: IApiSirenEtablissementUnite
}

export interface IApiSirenUniteLegale
  extends IApiSirenUnionUniteLegaleEtablissmentUnite {
  siren: string
  periodesUniteLegale: IApiSirenUniteLegalePeriode[]
}

export interface IApiSirenQuery {
  fault?: {
    code: number
    description: string
    message: string
  }
  error?: {
    // eslint-disable-next-line camelcase
    error_description: string
  }
  header: {
    debut: number
    nombre: number
    message: 'OK' | string
    statut: number
    total: number
  }
}

export interface IApiSirenQueryTypes extends IApiSirenQuery {
  etablissements?: IApiSirenEtablissement[]
  unitesLegales?: IApiSirenUniteLegale[]
}

export interface IApiSirenQueryToken extends IApiSirenQuery {
  result?: {
    // eslint-disable-next-line camelcase
    access_token: string
  }
}
