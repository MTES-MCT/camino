import { entrepriseEtablissementsFormat, entrepriseFormat } from './format'
import { entreprisesFetch, entreprisesEtablissementsFetch } from './fetch'
import { IEntreprise, IEntrepriseEtablissement } from '../../types'
import { Siren } from 'camino-common/src/entreprise'
import { isNotNullNorUndefined, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'

// cherche les établissements des entreprises
// retourne des objets du modèle EntrepriseEtablissements
export const apiInseeEntreprisesEtablissementsGet = async (sirenIds: Siren[]): Promise<IEntrepriseEtablissement[]> => {
  if (!sirenIds.length) return []

  const entreprises = await entreprisesEtablissementsFetch(sirenIds)

  if (isNullOrUndefinedOrEmpty(entreprises) || !Array.isArray(entreprises)) return []

  return entreprises.filter(isNotNullNorUndefined).flatMap(e => entrepriseEtablissementsFormat(e))
}

// cherche les adresses des entreprises
// retourne des objets du modèle Entreprise
export const apiInseeEntreprisesGet = async (sirenIds: Siren[]): Promise<IEntreprise[]> => {
  const entreprises = await entreprisesFetch(sirenIds)

  if (isNullOrUndefinedOrEmpty(entreprises) || !Array.isArray(entreprises)) {
    return []
  }

  return entreprises.filter(isNotNullNorUndefined).map(e => entrepriseFormat(e))
}

export const apiInseeEntrepriseAndEtablissementsGet = async (sirenId: Siren): Promise<IEntreprise | null> => {
  const entreprises = await apiInseeEntreprisesGet([sirenId])
  if (isNullOrUndefinedOrEmpty(entreprises)) {
    throw new Error('API Insee: erreur')
  }

  const [entreprise] = entreprises
  if (isNullOrUndefined(entreprise)) return null

  entreprise.etablissements = await apiInseeEntreprisesEtablissementsGet([sirenId])

  return entreprise
}
