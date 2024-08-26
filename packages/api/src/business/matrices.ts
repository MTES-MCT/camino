import '../init'
import { FiscaliteFrance, decimalValidator, fiscaliteValidator, type Fiscalite } from 'camino-common/src/validators/fiscalite'
import { ICommune, IContenuValeur } from '../types'
import { departementIdValidator, Departements, toDepartementId } from 'camino-common/src/static/departement'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Commune, CommuneId, communeIdValidator, communeValidator } from 'camino-common/src/static/communes'
import { CaminoAnnee } from 'camino-common/src/date'

import { Decimal } from 'decimal.js'
import { Regions } from 'camino-common/src/static/region'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { GetEntreprises } from '../api/rest/entreprises.queries'
import Titres from '../database/models/titres'
import TitresActivites from '../database/models/titres-activites'
import { isGuyane } from 'camino-common/src/static/pays'
import { SubstanceFiscale, SubstanceFiscaleId, SUBSTANCES_FISCALES_IDS, substancesFiscalesBySubstanceLegale } from 'camino-common/src/static/substancesFiscales'
import { TitreId, TitreSlug } from 'camino-common/src/validators/titres'
import { z } from 'zod'
import { Unite, UniteId, Unites, fromUniteFiscaleToUnite } from 'camino-common/src/static/unites'
import {
  EntrepriseCategory,
  getCategoriesForTaxeAurifereGuyane,
  getRedevanceCommunale,
  getRedevanceDepartementale,
  taxeAurifereBrutDeductionTaux,
  taxeAurifereGuyaneDeductionMontantMax,
} from './fiscalite'

const SIP_IDS = ['cayenne', 'kourou', 'saintLaurentDuMaroni'] as const
const sipIdValidator = z.enum(SIP_IDS)
export const sips = {
  cayenne: {
    nom: 'SIP de Cayenne',
    communes: [
      '97313', // Montsinery-Tonnegrande
      '97314', // Ouanary
      '97356', // Camopi
      '97302', // Cayenne
      '97301', // Régina
      '97309', // Remire-Montjoly
      '97310', // Roura
      '97308', // Saint-Georges
      '97307', // Matoury
    ],
  },
  kourou: {
    nom: 'SIP de Kourou',
    communes: [
      '97304', // Kourou
      '97305', // Macouria
      '97303', // Iracoubo
      '97312', // Sinnamary
      '97358', // Saint-Élie
    ],
  },
  saintLaurentDuMaroni: {
    nom: 'SIP de Saint-Laurent du Maroni',
    communes: [
      '97362', //  Papaichton
      '97360', //  Apatou
      '97361', //  Awala-Yalimapo
      '97357', //  Grand-Santi
      '97306', //  Mana
      '97352', //  Saül
      '97353', //  Maripasoula
      '97311', //  Saint-Laurent-du-Maroni
    ],
  },
} as const satisfies Record<z.infer<typeof sipIdValidator>, { nom: string; communes: string[] }>
export type Sips = keyof typeof sips
export const isSip = (value: string): value is Sips => Object.keys(sips).includes(value)

const matriceTitulaireValidator = z.object({
  nom: z.string(),
  rue: z.string(),
  codepostal: z.string(),
  commune: z.string(),
  siren: z.string(),
})

export type Titulaire = z.infer<typeof matriceTitulaireValidator>

const communeWithSurfaceValidator = z.object({
  id: communeIdValidator,
  surface: decimalValidator.optional().nullable(),
})
type CommuneWithSurface = z.infer<typeof communeWithSurfaceValidator>
export const rawMatriceValidator = z.object({
  communePrincipale: communeValidator,
  commune: communeValidator,
  fiscalite: fiscaliteValidator,
  quantiteOrExtrait: z.string(),
  sip: sipIdValidator,
  index: z.number(),
  titulaire: matriceTitulaireValidator,
  departementId: departementIdValidator,
  titreLabel: z.string(),
  surfaceCommunaleProportionnee: decimalValidator,
  surfaceCommunale: decimalValidator,
})
export type RawLineMatrice = z.infer<typeof rawMatriceValidator>

const fiscaliteSubstanceFiscaleUnite = (substanceFiscale: SubstanceFiscale): Unite => {
  const unite = substanceFiscale.calculFiscalite?.unite ? Unites[substanceFiscale.calculFiscalite.unite] : Unites[substanceFiscale.uniteId]
  if (!unite.uniteFiscaliteId) {
    throw new Error(`l'unité ${unite.id} pour la substance ${substanceFiscale.id} n'est pas connue par notre système de fiscalité`)
  }

  return unite
}

const conversion = (substanceFiscale: SubstanceFiscale, quantite: IContenuValeur): { value: Decimal; uniteId: UniteId } => {
  if (typeof quantite !== 'number') {
    return { uniteId: substanceFiscale.uniteId, value: new Decimal(0) }
  }

  const unite = fiscaliteSubstanceFiscaleUnite(substanceFiscale)

  return { uniteId: unite.id, value: new Decimal(quantite).div(unite.referenceUniteRatio ?? 1).toDecimalPlaces(3) }
}

type ProductionBySubstance = {
  substanceFiscaleId: SubstanceFiscaleId
  production: { value: Decimal; uniteId: UniteId }
}

type TitreBuild = {
  titre: {
    slug: TitreSlug
    id: TitreId
    titulaireIds: EntrepriseId[]
  }
  commune_principale_exploitation: CommuneWithSurface
  surface_totale: Decimal
  surface_communale: Record<CommuneId, { commune: CommuneWithSurface; surface: Decimal }>
  investissement: Decimal
  categorie: 'pme' | 'autre'
  substances: { [key in SubstanceFiscaleId]?: ProductionBySubstance }
}
export const getRawLines = (
  activitesAnnuelles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  activitesTrimestrielles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<Titres, 'titulaireIds' | 'amodiataireIds' | 'substances' | 'communes' | 'id' | 'slug'>[],
  annee: CaminoAnnee,
  communes: Commune[],
  entreprises: GetEntreprises[]
): RawLineMatrice[] => {
  const titresToBuild: Record<TitreId, TitreBuild> = {}
  for (const activite of activitesAnnuelles) {
    const titre = titres.find(({ id }) => id === activite.titreId)
    const activiteTrimestresTitre = activitesTrimestrielles.filter(({ titreId }) => titreId === activite.titreId)

    if (isNullOrUndefined(titre)) {
      throw new Error(`le titre ${activite.titreId} n’est pas chargé`)
    }

    if (isNullOrUndefined(titre.communes)) {
      throw new Error(`les communes du titre ${activite.titreId} ne sont pas chargées`)
    }
    if (isNullOrUndefined(titre.titulaireIds)) {
      throw new Error(`les titulaires du titre ${activite.titreId} ne sont pas chargées`)
    }
    if (isNullOrUndefined(titre.amodiataireIds)) {
      throw new Error(`les amodiataires du titre ${activite.titreId} ne sont pas chargés`)
    }

    // si N titulaires et UN amodiataire le titre appartient fiscalement à l'amodiataire
    // https://trello.com/c/2WJcnFRw/321-featfiscalit%C3%A9-les-titres-avec-un-seul-titulaire-et-un-seul-amodiataire-sont-g%C3%A9r%C3%A9s
    let entrepriseId: null | string = null
    let amodiataire = false
    if (titre.amodiataireIds.length === 1) {
      entrepriseId = titre.amodiataireIds[0]
      amodiataire = true
    } else if (titre.titulaireIds.length === 1) {
      entrepriseId = titre.titulaireIds[0]
    } else {
      throw new Error(`plusieurs entreprises liées au titre ${activite.titreId}, cas non géré`)
    }

    const entreprise = entreprises.find(({ id }) => id === entrepriseId)

    if (!entreprise && !amodiataire) {
      throw new Error(`pas d'entreprise trouvée pour le titre ${activite.titreId}`)
    } else if (!entreprise && amodiataire) {
      console.warn(`le titre ${activite.titreId} appartient à l'entreprise amodiataire et n'est pas dans la liste des entreprises à analyser`)
    } else if (entreprise) {
      if (!titre.substances) {
        throw new Error(`les substances du titre ${activite.titreId} ne sont pas chargées`)
      }

      if (titre.substances.length > 0 && activite.contenu) {
        const substanceLegalesWithFiscales = titre.substances.filter(isNotNullNorUndefined).filter(substanceId => substancesFiscalesBySubstanceLegale(substanceId).length)

        if (substanceLegalesWithFiscales.length > 1) {
          // TODO 2022-07-25 on fait quoi ? On calcule quand même ?
          console.error('BOOM, titre avec plusieurs substances légales possédant plusieurs substances fiscales ', titre.id)
        }

        const substancesFiscales = substanceLegalesWithFiscales.flatMap(substanceId => substancesFiscalesBySubstanceLegale(substanceId))

        for (const substancesFiscale of substancesFiscales) {
          const production = conversion(substancesFiscale, activite.contenu.substancesFiscales[substancesFiscale.id])

          if (production.value.greaterThan(0)) {
            const communes: DeepReadonly<ICommune[]> = titre.communes
            if (isNullOrUndefined(titresToBuild[titre.id])) {
              const surfaceTotale = titre.communes.reduce((value, commune) => value.add(commune.surface ?? 0), new Decimal(0))

              let communePrincipale: ICommune | null = null
              for (const commune of communes) {
                if (communePrincipale === null) {
                  communePrincipale = commune
                } else if ((communePrincipale?.surface ?? 0) < (commune?.surface ?? 0)) {
                  communePrincipale = commune
                }
              }
              if (communePrincipale === null) {
                throw new Error(`Impossible de trouver une commune principale pour le titre ${titre.id}`)
              }
              const investissement = activiteTrimestresTitre.reduce((investissement, activite) => {
                if (typeof activite?.contenu?.renseignements?.environnement === 'number') {
                  return investissement.add(activite?.contenu?.renseignements?.environnement)
                }

                return investissement
              }, new Decimal(0))
              titresToBuild[titre.id] = {
                titre: {
                  slug: titre.slug!,
                  id: titre.id,
                  titulaireIds: titre.titulaireIds,
                },
                commune_principale_exploitation: communeWithSurfaceValidator.parse(communePrincipale),
                surface_totale: surfaceTotale,
                surface_communale: communes.reduce(
                  (acc, commune) => {
                    acc[commune.id] = { commune: communeWithSurfaceValidator.parse(commune), surface: new Decimal(commune.surface ?? 0) }

                    return acc
                  },
                  {} as Record<CommuneId, { commune: CommuneWithSurface; surface: Decimal }>
                ),
                investissement,
                categorie: entreprise.categorie === 'PME' ? 'pme' : 'autre',
                substances: {},
              }
            }

            titresToBuild[titre.id].substances[substancesFiscale.id] = {
              substanceFiscaleId: substancesFiscale.id,
              production,
            }
          }
        }
      }
    }
  }

  let count = 0
  const rawLines: RawLineMatrice[] = titres
    .filter(({ id }) => isNotNullNorUndefined(titresToBuild[id]))
    .flatMap(titre => {
      const titreBuild = titresToBuild[titre.id]
      const communePrincipale = titreBuild.commune_principale_exploitation

      const isTitreGuyannais = (titre.communes ?? [])
        .map(({ id }) => toDepartementId(id))
        .filter(isNotNullNorUndefined)
        .some(departementId => isGuyane(Regions[Departements[departementId].regionId].paysId))

      return Object.values(titreBuild.substances)
        .filter(substance => substance.substanceFiscaleId === SUBSTANCES_FISCALES_IDS.or)
        .flatMap(productionBySubstance => {
          return Object.values(titreBuild.surface_communale).map(({ commune, surface }) => {
            count++
            const surfaceCommunaleProportionnee = surface.div(titreBuild.surface_totale)
            const quantiteOrExtrait = new Decimal(productionBySubstance.production.value).mul(surfaceCommunaleProportionnee).toDecimalPlaces(3)

            const fiscalite = toNewFiscalite(
              { ...productionBySubstance, production: { uniteId: productionBySubstance.production.uniteId, value: quantiteOrExtrait } },
              annee,
              isTitreGuyannais,
              titreBuild.categorie,
              titreBuild.investissement,
              surfaceCommunaleProportionnee
            )

            const titreLabel = titreBuild.titre.slug ?? ''

            let sip: Sips = 'saintLaurentDuMaroni'
            if (sips.saintLaurentDuMaroni.communes.includes(commune.id)) {
              sip = 'saintLaurentDuMaroni'
            } else if (sips.cayenne.communes.includes(commune.id)) {
              sip = 'cayenne'
            } else if (sips.kourou.communes.includes(commune.id)) {
              sip = 'kourou'
            }

            if (titreBuild.titre.titulaireIds?.length !== 1) {
              throw new Error(`Un seul titulaire doit être présent sur le titre ${titreBuild.titre.slug}`)
            }
            const titulaireTitre = entreprises.find(({ id }) => titreBuild.titre.titulaireIds[0] === id)

            const result: RawLineMatrice = {
              communePrincipale: communes.find(({ id }) => id === communePrincipale.id) ?? { id: communePrincipale.id, nom: communePrincipale.id },
              commune: communes.find(({ id }) => commune.id === id) ?? { id: commune.id, nom: commune.id },
              fiscalite,
              quantiteOrExtrait: `${quantiteOrExtrait}`,
              sip,
              index: count,
              titulaire: {
                nom: titulaireTitre?.nom ?? '',
                rue: titulaireTitre?.adresse ?? '',
                codepostal: titulaireTitre?.code_postal ?? '',
                commune: titulaireTitre?.commune ?? '',
                siren: titulaireTitre?.legal_siren ?? '',
              },
              titreLabel,
              departementId: toDepartementId(commune.id),
              surfaceCommunaleProportionnee,
              surfaceCommunale: surface,
            }

            return result
          })
        })
    })

  return rawLines
}

export const getSimpleFiscalite = (productionBySubstance: ProductionBySubstance, annee: CaminoAnnee): FiscaliteFrance => {
  const production = fromUniteFiscaleToUnite(productionBySubstance.production.uniteId, productionBySubstance.production.value)
  const fiscalite: FiscaliteFrance = {
    redevanceCommunale: production.mul(getRedevanceCommunale(annee, productionBySubstance.substanceFiscaleId)).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN),
    redevanceDepartementale: production.mul(getRedevanceDepartementale(annee, productionBySubstance.substanceFiscaleId)).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN),
  }

  return fiscalite
}

const toNewFiscalite = (
  productionBySubstance: ProductionBySubstance,
  annee: CaminoAnnee,
  isTitreGuyannais: boolean,
  category: EntrepriseCategory,
  investissement: Decimal,
  surfaceCommunaleProportionnee: Decimal
): Fiscalite => {
  const fiscalite: Fiscalite = getSimpleFiscalite(productionBySubstance, annee)

  if (isTitreGuyannais) {
    const taxeAurifereBrute = productionBySubstance.production.value.mul(getCategoriesForTaxeAurifereGuyane(annee, category)).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)

    const totalInvestissementsDeduits = Decimal.min(taxeAurifereGuyaneDeductionMontantMax, investissement, taxeAurifereBrute.mul(taxeAurifereBrutDeductionTaux))
      .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)
      .mul(surfaceCommunaleProportionnee)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)

    return {
      ...fiscalite,
      guyane: {
        taxeAurifereBrute,
        totalInvestissementsDeduits,
        taxeAurifere: taxeAurifereBrute.minus(totalInvestissementsDeduits),
      },
    }
  }

  return fiscalite
}
