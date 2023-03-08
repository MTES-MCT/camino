import { IApiSirenEtablissement, IApiSirenUniteLegalePeriode, IApiSirenUnionUniteLegalePeriodeEtablissmentUnite, IApiSirenUnionUniteLegaleEtablissmentUnite, IApiSirenUniteLegale } from './types.js'
import { IEntrepriseEtablissement, IEntreprise } from '../../types.js'

import inseePays from './definitions/pays.js'
import inseeCategoriesJuridiques from './definitions/categories-juridiques.js'
import inseeTypesVoies from './definitions/voies.js'

import { checkCodePostal } from 'camino-common/src/static/departement.js'
import { toCaminoDate } from 'camino-common/src/date.js'

interface IApiSirenNomFormat extends IApiSirenUnionUniteLegalePeriodeEtablissmentUnite, IApiSirenUnionUniteLegaleEtablissmentUnite {}

const nomIndividuFormat = (nomUniteLegale: string, prenomUsuelUniteLegale?: string | null, sexeUniteLegale?: 'F' | 'M' | null) =>
  `${sexeUniteLegale === 'F' ? 'MADAME' : 'MONSIEUR'} ${prenomUsuelUniteLegale || ''} ${nomUniteLegale}`

const nomEntrepriseFormat = (denominationUniteLegale?: string | null, denominationUsuelle1UniteLegale?: string | null, sigleUniteLegale?: string | null) => {
  const denomination = denominationUniteLegale && denominationUniteLegale.trim()

  const denominationUsuelle = denominationUsuelle1UniteLegale && denominationUsuelle1UniteLegale.trim()

  const sigle = sigleUniteLegale && sigleUniteLegale.trim()

  // priorise la dénomination officielle
  // par rapport à la dénomination usuelle
  const nom = denomination || denominationUsuelle

  if (!nom && !sigle) return null

  // si le nom n'est pas rempli, retourne le sigle
  if (!nom) return sigle

  // si le sigle est rempli
  // et qu'il est différent du nom
  if (sigle && nom !== sigle) {
    // alors concatène le nom et le sigle (différent du nom)
    return `${nom} (${sigle})`
  }

  return nom
}

const nomFormat = (
  { denominationUniteLegale, denominationUsuelle1UniteLegale, nomUniteLegale, prenomUsuelUniteLegale, sexeUniteLegale, sigleUniteLegale }: Partial<IApiSirenNomFormat>,
  nomEntrepriseUsuel?: boolean
) =>
  (nomUniteLegale && (!nomEntrepriseUsuel || (!denominationUniteLegale && !denominationUsuelle1UniteLegale && !sigleUniteLegale))
    ? nomIndividuFormat(nomUniteLegale!, prenomUsuelUniteLegale, sexeUniteLegale)
    : nomEntrepriseFormat(denominationUniteLegale, denominationUsuelle1UniteLegale, sigleUniteLegale)) || 'Indéfini'

const entrepriseEtablissementFormat = (uniteLegale: IApiSirenUniteLegale, uniteLegalePeriode: IApiSirenUniteLegalePeriode) => {
  const entrepriseId = `fr-${uniteLegale.siren}`
  const nic = uniteLegalePeriode.nicSiegeUniteLegale || 'xxxxx'
  const dateDebut = toCaminoDate(uniteLegalePeriode.dateDebut)

  const nom = nomFormat(Object.assign({}, uniteLegale, uniteLegalePeriode))
  const legalSiret = `${uniteLegale.siren}${nic}`
  const etablissement = {
    id: `${entrepriseId}-${nic}-${dateDebut}`,
    entrepriseId,
    nom,
    dateDebut,
    legalSiret,
  } as IEntrepriseEtablissement

  if (uniteLegalePeriode.dateFin) {
    etablissement.dateFin = toCaminoDate(uniteLegalePeriode.dateFin)
  }

  return etablissement
}

export const entrepriseEtablissementsFormat = (uniteLegale: IApiSirenUniteLegale) => {
  // periodesUniteLegale est un tableau
  // classé par ordre de fin chronologique décroissant
  if (!uniteLegale.periodesUniteLegale || !uniteLegale.periodesUniteLegale.length) {
    return []
  }

  const entrepriseEtablissements = uniteLegale.periodesUniteLegale.map(uniteLegalePeriode => entrepriseEtablissementFormat(uniteLegale, uniteLegalePeriode))

  return entrepriseEtablissements
}

export const entrepriseFormat = ({ uniteLegale, adresseEtablissement: adresse, siren }: IApiSirenEtablissement) => {
  const id = `fr-${siren}`

  const entreprise = {
    id,
    legalSiren: siren,
  } as IEntreprise

  const nom = nomFormat(uniteLegale, true)
  if (nom) {
    entreprise.nom = nom
  }

  if (uniteLegale.categorieEntreprise) {
    entreprise.categorie = uniteLegale.categorieEntreprise
  }

  if (adresse.codeCedexEtablissement) {
    entreprise.cedex = adresse.codeCedexEtablissement
  }

  entreprise.adresse = ''

  if (adresse.numeroVoieEtablissement) {
    entreprise.adresse += `${adresse.numeroVoieEtablissement} `
  }

  if (adresse.indiceRepetitionEtablissement) {
    entreprise.adresse += `${adresse.indiceRepetitionEtablissement} `
  }

  if (adresse.typeVoieEtablissement) {
    const typeVoie = inseeTypesVoies.find(t => t.id === adresse.typeVoieEtablissement)
    if (typeVoie) {
      entreprise.adresse += `${typeVoie.nom} `
    }
  }

  if (adresse.libelleVoieEtablissement) {
    entreprise.adresse += `${adresse.libelleVoieEtablissement} `
  }

  // permet de ne pas avoir de comparaisons entre chaîne vide
  // et null lors des tâches business
  entreprise.adresse = entreprise.adresse ? entreprise.adresse.trim() : null

  if (adresse.codePostalEtablissement) {
    try {
      entreprise.codePostal = checkCodePostal(adresse.codePostalEtablissement)
    } catch (e) {
      console.warn(`erreur lors du formatage de l'entreprise '${entreprise.id}', ${e}`)
    }
  }

  const commune = adresse.libelleCommuneEtablissement || adresse.libelleCommuneEtrangerEtablissement

  if (commune) {
    entreprise.commune = commune
  }

  if (uniteLegale.categorieJuridiqueUniteLegale) {
    const categorie = inseeCategoriesJuridiques.find(c => c.code === uniteLegale.categorieJuridiqueUniteLegale)
    if (categorie) {
      entreprise.legalForme = categorie.nom
    } else {
      console.error(`API Insee: catégorie juridique introuvable : ${uniteLegale.categorieJuridiqueUniteLegale}`)
    }
  }

  if (adresse.codePaysEtrangerEtablissement) {
    const pays = inseePays.find(p => p.cog === adresse.codePaysEtrangerEtablissement)
    if (pays) {
      entreprise.paysId = pays.codeiso2
    } else {
      console.error(`API Insee: code pays introuvable: ${adresse.codePaysEtrangerEtablissement}`)
    }
  } else {
    entreprise.paysId = 'FR'
  }

  if (uniteLegale.dateCreationUniteLegale) {
    entreprise.dateCreation = toCaminoDate(uniteLegale.dateCreationUniteLegale)
  }

  return entreprise
}
