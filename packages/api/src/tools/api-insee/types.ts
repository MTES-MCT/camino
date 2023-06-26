import { Siren } from 'camino-common/src/entreprise'

export interface IApiSirenUniteLegalePeriode extends IApiSirenUnionUniteLegalePeriodeEtablissmentUnite {
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

export interface IApiSirenEtablissementUnite extends IApiSirenUnionUniteLegalePeriodeEtablissmentUnite, IApiSirenUnionUniteLegaleEtablissmentUnite {
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
  siren: Siren
  uniteLegale: IApiSirenEtablissementUnite
}

export interface IApiSirenUniteLegale extends IApiSirenUnionUniteLegaleEtablissmentUnite {
  siren: Siren
  periodesUniteLegale: IApiSirenUniteLegalePeriode[]
}

export interface IApiSirenQuery {
  fault?: {
    code: number
    description: string
    message: string
  }
  error?: {
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
  access_token: string
}
