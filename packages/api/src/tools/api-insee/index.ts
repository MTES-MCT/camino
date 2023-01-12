import { entrepriseEtablissementsFormat, entrepriseFormat } from './format.js'
import { entreprisesFetch, entreprisesEtablissementsFetch } from './fetch.js'
import { IEntreprise, IEntrepriseEtablissement } from '../../types.js'

// cherche les établissements des entreprises
// retourne des objets du modèle EntrepriseEtablissements
export const apiInseeEntreprisesEtablissementsGet = async (
  sirenIds: string[]
) => {
  if (!sirenIds.length) return []

  const entreprises = await entreprisesEtablissementsFetch(sirenIds)

  if (!entreprises || !Array.isArray(entreprises)) return []

  return entreprises.reduce((acc: IEntrepriseEtablissement[], e) => {
    if (e) {
      acc.push(...entrepriseEtablissementsFormat(e))
    }

    return acc
  }, [])
}

// cherche les adresses des entreprises
// retourne des objets du modèle Entreprise
export const apiInseeEntreprisesGet = async (sirenIds: string[]) => {
  const entreprises = await entreprisesFetch(sirenIds)

  if (!entreprises || !Array.isArray(entreprises)) {
    return []
  }

  return entreprises.reduce((acc: IEntreprise[], e) => {
    if (e) {
      acc.push(entrepriseFormat(e))
    }

    return acc
  }, [])
}

export const apiInseeEntrepriseAndEtablissementsGet = async (
  sirenId: string
) => {
  const entreprises = await apiInseeEntreprisesGet([sirenId])
  if (!entreprises) {
    throw new Error('API Insee: erreur')
  }

  const [entreprise] = entreprises
  if (!entreprise) return null

  entreprise.etablissements = await apiInseeEntreprisesEtablissementsGet([
    sirenId
  ])

  return entreprise
}
