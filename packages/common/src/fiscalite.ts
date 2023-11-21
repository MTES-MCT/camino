import { isAdministration, isEntreprise, isSuper, User } from './roles.js'
import { DomaineId, DOMAINES_IDS } from './static/domaines.js'
import { CommonRestTitre } from './titres.js'
import { EntrepriseId } from './entreprise.js'
import { getDomaineId } from './static/titresTypes.js'
import { z } from 'zod'
import { Decimal } from 'decimal.js'

const fiscaliteFranceValidator = z.object({
  redevanceCommunale: z.number(),
  redevanceDepartementale: z.number(),
})
export type FiscaliteFrance = z.infer<typeof fiscaliteFranceValidator>

const fiscaliteGuyaneValidator = fiscaliteFranceValidator.extend({
  guyane: z.object({
    taxeAurifereBrute: z.number(),
    totalInvestissementsDeduits: z.number(),
    taxeAurifere: z.number(),
  }),
})
export type FiscaliteGuyane = z.infer<typeof fiscaliteGuyaneValidator>

export const fiscaliteValidator = z.union([fiscaliteFranceValidator, fiscaliteGuyaneValidator])
export type Fiscalite = z.infer<typeof fiscaliteValidator>

export const isFiscaliteGuyane = (fiscalite: Fiscalite): fiscalite is FiscaliteGuyane => 'guyane' in fiscalite

export const montantNetTaxeAurifere = (fiscalite: Fiscalite) => (isFiscaliteGuyane(fiscalite) ? fiscalite.guyane.taxeAurifere : 0)

export const fraisGestion = (fiscalite: Fiscalite): Decimal =>
  new Decimal(fiscalite.redevanceDepartementale).add(fiscalite.redevanceCommunale).add(montantNetTaxeAurifere(fiscalite)).mul(0.08).toDecimalPlaces(2)

export const fiscaliteVisible = (user: User, entrepriseId: EntrepriseId | undefined, titres: Partial<Pick<CommonRestTitre, 'type_id'>>[]): boolean => {
  return fiscaliteVisibleByDomaines(
    user,
    entrepriseId,
    titres.filter((titre): titre is Pick<CommonRestTitre, 'type_id'> => !!titre.type_id).map(({ type_id }) => getDomaineId(type_id))
  )
}
export const fiscaliteVisibleByDomaines = (user: User, entrepriseId: EntrepriseId | undefined, domaineIds: DomaineId[]): boolean => {
  if (user && domaineIds.length > 0) {
    if (
      domaineIds.every(domaineId => {
        return [DOMAINES_IDS.GEOTHERMIE, DOMAINES_IDS.GRANULATS_MARINS, DOMAINES_IDS.SOUTERRAIN, DOMAINES_IDS.RADIOACTIF].includes(domaineId)
      })
    ) {
      return false
    }
    if (isSuper(user) || isAdministration(user)) {
      return true
    }
    if (isEntreprise(user) && user.entreprises?.find(({ id }) => entrepriseId === id)) {
      return true
    }
  }

  return false
}
