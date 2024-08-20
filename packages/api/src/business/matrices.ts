import '../init'
import { titresGet } from '../database/queries/titres'
import { titresActivitesGet } from '../database/queries/titres-activites'
import { openfiscaSubstanceFiscaleUnite } from '../tools/api-openfisca/index'
import { userSuper } from '../database/user-super'
import { fraisGestion } from 'camino-common/src/fiscalite'
import { decimalValidator, fiscaliteValidator, type Fiscalite } from 'camino-common/src/validators/fiscalite'
import { ICommune, IContenuValeur } from '../types'
import { departementIdValidator, Departements, toDepartementId } from 'camino-common/src/static/departement'
import fs from 'fs'
import carbone from 'carbone'
import { Pool } from 'pg'
import { getCommunes } from '../database/queries/communes.queries'
import { DeepReadonly, isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { Commune, CommuneId, communeIdValidator, communeValidator } from 'camino-common/src/static/communes'
import { CaminoAnnee, anneePrecedente as previousYear, anneeSuivante, getCurrentAnnee, toCaminoAnnee } from 'camino-common/src/date'

import { Decimal } from 'decimal.js'
import { REGION_IDS, Regions } from 'camino-common/src/static/region'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { GetEntreprises, getEntreprises } from '../api/rest/entreprises.queries'
import Titres from '../database/models/titres'
import TitresActivites from '../database/models/titres-activites'
import { isGuyane } from 'camino-common/src/static/pays'
import { SubstanceFiscale, SubstanceFiscaleId, SUBSTANCES_FISCALES_IDS, substancesFiscalesBySubstanceLegale } from 'camino-common/src/static/substancesFiscales'
import { TitreId, TitreSlug } from 'camino-common/src/validators/titres'
import { z } from 'zod'

const SIP_IDS = ['cayenne', 'kourou', 'saintLaurentDuMaroni'] as const
const sipIdValidator = z.enum(SIP_IDS)
const sips = {
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
} as const satisfies Record<z.infer<typeof sipIdValidator>, {nom: string, communes: string[]}>
type Sips = keyof typeof sips
const isSip = (value: string): value is Sips => Object.keys(sips).includes(value)
type Matrice1403 = {
  circonscriptionDe: string
  redevanceDepartementale: Decimal
  redevanceCommunale: Decimal
  taxeMiniereSurLOrDeGuyane: Decimal
  sommesRevenantALaRegionDeGuyane: Decimal
  sommesRevenantAuConservatoireDeBioDiversite: Decimal
  sommesRevenantALEtatFraisAssietteEtRecouvrement: Decimal
  sommesRevenantALEtatDegrevementsEtNonValeurs: Decimal
  sommesRevenantALEtatTotal: Decimal
  totalColonnes: Decimal
  nombreDArticlesDesRoles: number
}

type Matrice1404 = {
  circonscriptionDe: string
  articlesDeRoles: number
  designationDesExploitants: string
  departements: string
  communes: string
  elementsDeBase_revenusImposablesALaTFPB: number
  elementsDeBase_tonnagesExtraits: string
  redevanceDepartementale_produitNetDeLaRedevance: Decimal
  redevanceDepartementale_sommesRevenantAuxDepartements: Decimal
  redevanceCommunale_produitNetDeLaRedevance: Decimal
  redevanceCommunale_repartition_1ereFraction: Decimal
  redevanceCommunale_repartition_2emeFraction: Decimal
  redevanceCommunale_repartition_3emeFraction: Decimal
  redevanceCommunale_revenantAuxCommunes_1ereFraction: Decimal
  redevanceCommunale_revenantAuxCommunes_2emeFraction: Decimal
  redevanceCommunale_revenantAuxCommunes_total: Decimal
  taxeMiniereSurLOrDeGuyane_produitNet: Decimal
  taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: Decimal
  taxeMiniereSurLOrDeGuyane_repartition_conservatoire: number
}

type Matrice1121 = {
  numeroOrdreMatrice: number
  communeDuLieuPrincipalDExploitation: string | undefined
  designationEtAdresseDesConcessionnaires: string
  natureDesSubstancesExtraites: string
  baseDesRedevancesNature: string
  baseDesRedevancesQuantités: any
  redevanceDepartementaleTarifs: Decimal
  redevanceDepartementaleMontantNet: Decimal
  redevanceCommunaleTarifs: Decimal
  redevanceCommunaleMontantNetRedevanceDesMines: Decimal
  totalRedevanceDesMines: Decimal
  taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesPME: Decimal
  taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesAutresEntreprises: Decimal
  taxeMiniereSurLOrDeGuyaneMontantDesInvestissementsDeduits: Decimal
  taxeMiniereSurLOrDeGuyaneMontantNetDeTaxeMinièreSurLOrDeGuyane: Decimal
  fraisDeGestionDeLaFiscaliteDirecteLocale: Decimal
  serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement: string
  numeroDeLArticleDuRole: string | undefined
}

const matriceTitulaireValidator = z.object({
  nom: z.string(),
  rue: z.string(),
  codepostal: z.string(),
  commune: z.string(),
  siren: z.string(),
})

type Titulaire = z.infer<typeof matriceTitulaireValidator>

const communeWithSurfaceValidator = z.object({
  id: communeIdValidator,
  surface: decimalValidator.optional().nullable()
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
export type Matrices = z.infer<typeof rawMatriceValidator>

type Matrice1122 = {
  numeroOrdreMatrice: number
  designationDesConcessionnaires: string
  designationDesConcessions: string | undefined
  departementsSurLeTerritoireDesquelsFonctionnentLesExploitations: string
  communesSurLeTerritoireDesquelsFonctionnentLesExploitations: string | undefined
  tonnagesExtraitsAuCoursDeLAnneePrecedenteParDepartement: any
  tonnagesExtraitsAuCoursDeLAnneePrecedenteParCommune: any
  observations: string
}

const titulaireToString = (titulaire: Titulaire): string => {
  return `${titulaire.nom} - ${titulaire.rue} - ${titulaire.siren} SIREN`
}

export type BuildedMatrices = {
  matrice1121: Matrice1121[]
  matrice1122: Matrice1122[]
  matrice1403: Matrice1403[]
  matrice1404: Record<Sips, Matrice1404[]>
  rawLines: Matrices[]
}
const conversion = (substanceFiscale: SubstanceFiscale, quantite: IContenuValeur): Decimal => {
  if (typeof quantite !== 'number') {
    return new Decimal(0)
  }

  const unite = openfiscaSubstanceFiscaleUnite(substanceFiscale)

  return new Decimal(quantite).div(unite.referenceUniteRatio ?? 1).toDecimalPlaces(3)
}


type ProductionBySubstance = {
  substanceFiscaleId: SubstanceFiscaleId
  production: Decimal
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
): Matrices[] => {
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

          if (production.greaterThan(0)) {
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
  const rawLines: Matrices[] = titres
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
            const quantiteOrExtrait = new Decimal(productionBySubstance.production).mul(surfaceCommunaleProportionnee).toDecimalPlaces(3)

            const fiscalite = toNewFiscalite({ ...productionBySubstance , production: quantiteOrExtrait}, annee, isTitreGuyannais, titreBuild.categorie, titreBuild.investissement, surfaceCommunaleProportionnee)

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

            const result: Matrices = {
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

const redevanceCommunale = {
  [toCaminoAnnee('2017')]: {
    auru: new Decimal(141.2),
    anti: new Decimal(11.20),
    arge: new Decimal(229.40),
    arse: new Decimal(621.30),
    aloh: new Decimal(540.30),
    bism: new Decimal(54.40),
    hydb: new Decimal(46.40),
    hyda: new Decimal(1388.30),
    hydd: new Decimal(8.00),
    cfxa: new Decimal(215.70),
    cuiv: new Decimal(18.10),
    hyde: new Decimal(7.30),
    etai: new Decimal(112.40),
    ferb: new Decimal(319.00),
    fera: new Decimal(463.00),
    fluo: new Decimal(702.40),
    coox: new Decimal(302.50),
    hydf: new Decimal(298.40),
    cfxb: new Decimal(826.00),
    cfxc: new Decimal(200.70),
    lith: new Decimal(46.30),
    mang: new Decimal(345.00),
    moly: new Decimal(229.40),
    hydc: new Decimal(1067.00),
    plom: new Decimal(582.80),
    kclx: new Decimal(243.30),
    naca: new Decimal(668.00),
    nacc: new Decimal(135.80),
    nacb: new Decimal(406.60),
    souf: new Decimal(2.60),
    wolf: new Decimal(126.20),
    uran: new Decimal(274.80),
    zinc: new Decimal(463.00),
    reference: 'https://beta.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2018-01-01',
  },
  [toCaminoAnnee('2018')]: {
    auru: new Decimal(145.3),
    anti: new Decimal(11.50),
    arge: new Decimal(236.10),
    arse: new Decimal(639.30),
    aloh: new Decimal(556.00),
    bism: new Decimal(56.00),
    hydb: new Decimal(47.60),
    hyda: new Decimal(1428.60),
    hydd: new Decimal(8.20),
    cfxa: new Decimal(222.00),
    cuiv: new Decimal(18.60),
    hyde: new Decimal(7.50),
    etai: new Decimal(115.70),
    ferb: new Decimal(328.30),
    fera: new Decimal(476.40),
    fluo: new Decimal(722.80),
    coox: new Decimal(311.30),
    hydf: new Decimal(307.10),
    cfxb: new Decimal(850.00),
    cfxc: new Decimal(206.50),
    lith: new Decimal(47.60),
    mang: new Decimal(355.00),
    moly: new Decimal(236.10),
    hydc: new Decimal(1067.00),
    plom: new Decimal(599.70),
    kclx: new Decimal(250.40),
    naca: new Decimal(687.40),
    nacc: new Decimal(139.70),
    nacb: new Decimal(418.40),
    souf: new Decimal(2.70),
    wolf: new Decimal(129.90),
    uran: new Decimal(282.80),
    zinc: new Decimal(476.40),
    reference: 'https://beta.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2019-01-01',
  },
  [toCaminoAnnee('2019')]: {
    auru: new Decimal(149.7),
    anti: new Decimal(11.80),
    arge: new Decimal(243.20),
    arse: new Decimal(658.50),
    aloh: new Decimal(572.70),
    bism: new Decimal(57.70),
    hydb: new Decimal(49.00),
    hyda: new Decimal(1471.50),
    hydd: new Decimal(8.40),
    cfxa: new Decimal(228.70),
    cuiv: new Decimal(19.20),
    hyde: new Decimal(7.70),
    etai: new Decimal(119.20),
    ferb: new Decimal(338.10),
    fera: new Decimal(490.70),
    fluo: new Decimal(744.50),
    coox: new Decimal(320.60),
    hydf: new Decimal(316.30),
    cfxb: new Decimal(875.50),
    cfxc: new Decimal(212.70),
    lith: new Decimal(49.00),
    mang: new Decimal(365.70),
    moly: new Decimal(243.20),
    hydc: new Decimal(1099.00),
    plom: new Decimal(617.70),
    kclx: new Decimal(257.90),
    naca: new Decimal(708.00),
    nacc: new Decimal(143.90),
    nacb: new Decimal(431.00),
    souf: new Decimal(2.80),
    wolf: new Decimal(133.80),
    uran: new Decimal(291.30),
    zinc: new Decimal(490.70),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2020-01-01',
  },
  [toCaminoAnnee('2020')]: {
    auru: new Decimal(153.6),
    anti: new Decimal(12.10),
    arge: new Decimal(249.50),
    arse: new Decimal(675.60),
    aloh: new Decimal(587.60),
    bism: new Decimal(59.20),
    hydb: new Decimal(50.30),
    hyda: new Decimal(1509.80),
    hydd: new Decimal(8.60),
    cfxa: new Decimal(234.60),
    cuiv: new Decimal(19.70),
    hyde: new Decimal(7.90),
    etai: new Decimal(122.30),
    ferb: new Decimal(346.90),
    fera: new Decimal(503.50),
    fluo: new Decimal(763.90),
    coox: new Decimal(328.90),
    hydf: new Decimal(324.50),
    cfxb: new Decimal(898.30),
    cfxc: new Decimal(218.20),
    lith: new Decimal(50.30),
    mang: new Decimal(375.20),
    moly: new Decimal(249.50),
    hydc: new Decimal(1127.60),
    plom: new Decimal(633.80),
    kclx: new Decimal(264.60),
    naca: new Decimal(726.40),
    nacc: new Decimal(147.60),
    nacb: new Decimal(442.20),
    souf: new Decimal(2.90),
    wolf: new Decimal(137.30),
    uran: new Decimal(298.90),
    zinc: new Decimal(503.50),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2020-07-25',
  },
  [toCaminoAnnee('2021')]: {
    auru: new Decimal(166.3),
    anti: new Decimal(13.10),
    arge: new Decimal(270.20),
    arse: new Decimal(731.70),
    aloh: new Decimal(636.40),
    bism: new Decimal(64.10),
    hydb: new Decimal(54.50),
    hyda: new Decimal(1635.10),
    hydd: new Decimal(9.30),
    cfxa: new Decimal(254.10),
    cuiv: new Decimal(21.30),
    hyde: new Decimal(8.60),
    etai: new Decimal(132.50),
    ferb: new Decimal(375.70),
    fera: new Decimal(545.30),
    fluo: new Decimal(827.30),
    coox: new Decimal(356.20),
    hydf: new Decimal(351.40),
    cfxb: new Decimal(972.90),
    cfxc: new Decimal(236.30),
    lith: new Decimal(54.50),
    mang: new Decimal(406.30),
    moly: new Decimal(270.20),
    hydc: new Decimal(1221.20),
    plom: new Decimal(686.40),
    kclx: new Decimal(286.60),
    naca: new Decimal(786.70),
    nacc: new Decimal(159.90),
    nacb: new Decimal(478.90),
    souf: new Decimal(3.10),
    wolf: new Decimal(148.70),
    uran: new Decimal(323.70),
    zinc: new Decimal(545.30),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663105/2021-06-12/',
  },
  [toCaminoAnnee('2022')]: {
    auru: new Decimal(175.4),
    anti: new Decimal(13.80),
    arge: new Decimal(285.10),
    arse: new Decimal(771.90),
    aloh: new Decimal(671.40),
    bism: new Decimal(67.60),
    hydb: new Decimal(57.50),
    hyda: new Decimal(1725.0),
    hydd: new Decimal(9.80),
    cfxa: new Decimal(268.10),
    cuiv: new Decimal(22.50),
    hyde: new Decimal(9.10),
    etai: new Decimal(139.80),
    ferb: new Decimal(396.40),
    fera: new Decimal(575.30),
    fluo: new Decimal(872.80),
    coox: new Decimal(375.80),
    hydf: new Decimal(370.70),
    cfxb: new Decimal(1026.40),
    cfxc: new Decimal(249.30),
    lith: new Decimal(57.50),
    mang: new Decimal(428.60),
    moly: new Decimal(285.10),
    hydc: new Decimal(1288.40),
    plom: new Decimal(724.20),
    kclx: new Decimal(302.40),
    naca: new Decimal(830.0),
    nacc: new Decimal(168.70),
    nacb: new Decimal(505.20),
    souf: new Decimal(3.30),
    wolf: new Decimal(156.90),
    uran: new Decimal(341.50),
    zinc: new Decimal(575.30),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045765025/2022-05-07/',
  },
  [toCaminoAnnee('2023')]: {
    auru: new Decimal(183.5),
    anti: new Decimal(14.40),
    arge: new Decimal(298.20),
    arse: new Decimal(807.40),
    aloh: new Decimal(702.30),
    bism: new Decimal(70.70),
    hydb: new Decimal(60.10),
    hyda: new Decimal(1804.30),
    hydd: new Decimal(10.20),
    cfxa: new Decimal(280.40),
    cuiv: new Decimal(23.50),
    hyde: new Decimal(9.50),
    etai: new Decimal(146.20),
    ferb: new Decimal(414.60),
    fera: new Decimal(601.80),
    fluo: new Decimal(912.90),
    coox: new Decimal(393.10),
    hydf: new Decimal(387.70),
    cfxb: new Decimal(1073.60),
    cfxc: new Decimal(260.80),
    lith: new Decimal(60.10),
    mang: new Decimal(448.30),
    moly: new Decimal(298.20),
    hydc: new Decimal(1347.70),
    plom: new Decimal(757.50),
    kclx: new Decimal(316.30),
    naca: new Decimal(868.20),
    nacc: new Decimal(176.50),
    nacb: new Decimal(528.40),
    souf: new Decimal(3.40),
    wolf: new Decimal(164.10),
    uran: new Decimal(357.20),
    zinc: new Decimal(601.80),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045765025/2023-06-03/',
  },
  } as const satisfies Record<CaminoAnnee, Record<SubstanceFiscaleId, Decimal> & { reference: string }>


const redevanceDepartementale = {
  [toCaminoAnnee('2017')]: {
    auru: new Decimal(28.2),
    hyde: new Decimal(5.40),
    cuiv: new Decimal(3.70),
    cfxa: new Decimal(104.80),
    hyda: new Decimal(276.40),
    hydb: new Decimal(9.50),
    bism: new Decimal(11.10),
    aloh: new Decimal(108),
    arse: new Decimal(126.20),
    arge: new Decimal(45.70),
    anti: new Decimal(2.50),
    etai: new Decimal(22.30),
    ferb: new Decimal(66.40),
    fera: new Decimal(94.70),
    fluo: new Decimal(142.80),
    coox: new Decimal(61.80),
    hydf: new Decimal(435.70),
    cfxb: new Decimal(163.60),
    cfxc: new Decimal(44.50),
    lith: new Decimal(9.40),
    mang: new Decimal(69.80),
    moly: new Decimal(46.30),
    hydc: new Decimal(1371),
    plom: new Decimal(112.40),
    kclx: new Decimal(48.50),
    hydd: new Decimal(6.10),
    naca: new Decimal(135.80),
    nacc: new Decimal(26.30),
    nacb: new Decimal(80.20),
    souf: new Decimal(1.60),
    uran: new Decimal(54.60),
    wolf: new Decimal(24.70),
    zinc: new Decimal(94.70),
    reference: 'https://beta.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006162672/2018-01-01/',
  },
  [toCaminoAnnee('2018')]: {
    auru: new Decimal(29),
    hyde: new Decimal(5.60),
    cuiv: new Decimal(3.80),
    cfxa: new Decimal(107.80),
    hyda: new Decimal(284.40),
    hydb: new Decimal(9.80),
    bism: new Decimal(11.40),
    aloh: new Decimal(111.10),
    arse: new Decimal(129.90),
    arge: new Decimal(47),
    anti: new Decimal(2.60),
    etai: new Decimal(22.90),
    ferb: new Decimal(68.30),
    fera: new Decimal(97.40),
    fluo: new Decimal(146.90),
    coox: new Decimal(63.60),
    hydf: new Decimal(448.30),
    cfxb: new Decimal(168.30),
    cfxc: new Decimal(45.80),
    lith: new Decimal(9.70),
    mang: new Decimal(71.80),
    moly: new Decimal(47.60),
    hydc: new Decimal(1371),
    plom: new Decimal(115.70),
    kclx: new Decimal(49.90),
    hydd: new Decimal(6.30),
    naca: new Decimal(139.70),
    nacc: new Decimal(27.10),
    nacb: new Decimal(82.50),
    souf: new Decimal(1.60),
    uran: new Decimal(56.20),
    wolf: new Decimal(25.40),
    zinc: new Decimal(97.40),
    reference: 'https://beta.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006162672/2019-01-01/',
  },
  [toCaminoAnnee('2019')]: {
    auru: new Decimal(29.9),
    hyde: new Decimal(5.80),
    cuiv: new Decimal(3.90),
    cfxa: new Decimal(111.00),
    hyda: new Decimal(292.90),
    hydb: new Decimal(10.10),
    bism: new Decimal(11.70),
    aloh: new Decimal(114.40),
    arse: new Decimal(133.80),
    arge: new Decimal(48.40),
    anti: new Decimal(2.70),
    etai: new Decimal(23.60),
    ferb: new Decimal(70.30),
    fera: new Decimal(100.30),
    fluo: new Decimal(151.30),
    coox: new Decimal(65.50),
    hydf: new Decimal(461.70),
    cfxb: new Decimal(173.30),
    cfxc: new Decimal(47.20),
    lith: new Decimal(10.00),
    mang: new Decimal(74.00),
    moly: new Decimal(49.00),
    hydc: new Decimal(1412.10),
    plom: new Decimal(119.20),
    kclx: new Decimal(51.40),
    hydd: new Decimal(6.50),
    naca: new Decimal(143.90),
    nacc: new Decimal(27.90),
    nacb: new Decimal(85.00),
    souf: new Decimal(1.60),
    uran: new Decimal(57.90),
    wolf: new Decimal(26.20),
    zinc: new Decimal(100.30),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000038686694/2019-06-08/',
  },
  [toCaminoAnnee('2020')]: {
    auru: new Decimal(30.7),
    hyde: new Decimal(6.00),
    cuiv: new Decimal(4.00),
    cfxa: new Decimal(113.90),
    hyda: new Decimal(300.50),
    hydb: new Decimal(10.40),
    bism: new Decimal(12.00),
    aloh: new Decimal(117.40),
    arse: new Decimal(137.30),
    arge: new Decimal(49.70),
    anti: new Decimal(2.80),
    etai: new Decimal(24.20),
    ferb: new Decimal(72.10),
    fera: new Decimal(102.90),
    fluo: new Decimal(155.20),
    coox: new Decimal(67.20),
    hydf: new Decimal(473.70),
    cfxb: new Decimal(177.80),
    cfxc: new Decimal(48.40),
    lith: new Decimal(10.30),
    mang: new Decimal(75.90),
    moly: new Decimal(50.30),
    hydc: new Decimal(1448.80),
    plom: new Decimal(112.30),
    kclx: new Decimal(52.70),
    hydd: new Decimal(6.70),
    naca: new Decimal(147.60),
    nacc: new Decimal(28.60),
    nacb: new Decimal(87.20),
    souf: new Decimal(1.60),
    uran: new Decimal(59.40),
    wolf: new Decimal(26.90),
    zinc: new Decimal(102.90),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000042159975/2020-07-25/',
  },
  [toCaminoAnnee('2021')]: {
    auru: new Decimal(33.2),
    hyde: new Decimal(6.50),
    cuiv: new Decimal(4.30),
    cfxa: new Decimal(123.40),
    hyda: new Decimal(325.40),
    hydb: new Decimal(11.30),
    bism: new Decimal(13.0),
    aloh: new Decimal(127.10),
    arse: new Decimal(148.70),
    arge: new Decimal(53.80),
    anti: new Decimal(3.0),
    etai: new Decimal(26.20),
    ferb: new Decimal(78.10),
    fera: new Decimal(111.40),
    fluo: new Decimal(168.10),
    coox: new Decimal(72.80),
    hydf: new Decimal(513.0),
    cfxb: new Decimal(192.60),
    cfxc: new Decimal(52.40),
    lith: new Decimal(11.20),
    mang: new Decimal(82.20),
    moly: new Decimal(54.50),
    hydc: new Decimal(1569.10),
    plom: new Decimal(132.50),
    kclx: new Decimal(57.10),
    hydd: new Decimal(7.30),
    naca: new Decimal(159.90),
    nacc: new Decimal(31.0),
    nacb: new Decimal(94.40),
    souf: new Decimal(1.70),
    uran: new Decimal(64.30),
    wolf: new Decimal(29.10),
    zinc: new Decimal(111.40),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663002/2021-06-12/',
  },
  [toCaminoAnnee('2022')]: {
    auru: new Decimal(35.0),
    hyde: new Decimal(6.90),
    cuiv: new Decimal(4.50),
    cfxa: new Decimal(130.20),
    hyda: new Decimal(343.30),
    hydb: new Decimal(11.90),
    bism: new Decimal(13.70),
    aloh: new Decimal(134.10),
    arse: new Decimal(156.90),
    arge: new Decimal(56.80),
    anti: new Decimal(3.20),
    etai: new Decimal(27.60),
    ferb: new Decimal(82.40),
    fera: new Decimal(117.50),
    fluo: new Decimal(177.30),
    coox: new Decimal(76.80),
    hydf: new Decimal(541.20),
    cfxb: new Decimal(203.20),
    cfxc: new Decimal(55.30),
    lith: new Decimal(11.80),
    mang: new Decimal(86.70),
    moly: new Decimal(57.50),
    hydc: new Decimal(1655.40),
    plom: new Decimal(139.80),
    kclx: new Decimal(60.20),
    hydd: new Decimal(7.70),
    naca: new Decimal(168.70),
    nacc: new Decimal(32.70),
    nacb: new Decimal(99.60),
    souf: new Decimal(1.80),
    uran: new Decimal(67.80),
    wolf: new Decimal(30.70),
    zinc: new Decimal(117.50),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045764991/2022-05-07/',
  },
  [toCaminoAnnee('2023')]: {
    auru: new Decimal(36.6),
    hyde: new Decimal(7.20),
    cuiv: new Decimal(4.70),
    cfxa: new Decimal(136.20),
    hyda: new Decimal(359.10),
    hydb: new Decimal(12.40),
    bism: new Decimal(14.30),
    aloh: new Decimal(140.30),
    arse: new Decimal(164.10),
    arge: new Decimal(59.40),
    anti: new Decimal(3.30),
    etai: new Decimal(28.90),
    ferb: new Decimal(86.20),
    fera: new Decimal(122.90),
    fluo: new Decimal(185.50),
    coox: new Decimal(80.30),
    hydf: new Decimal(566.10),
    cfxb: new Decimal(212.50),
    cfxc: new Decimal(57.80),
    lith: new Decimal(12.30),
    mang: new Decimal(90.70),
    moly: new Decimal(60.10),
    hydc: new Decimal(1731.50),
    plom: new Decimal(146.20),
    kclx: new Decimal(63),
    hydd: new Decimal(8.10),
    naca: new Decimal(176.50),
    nacc: new Decimal(34.20),
    nacb: new Decimal(104.20),
    souf: new Decimal(1.90),
    uran: new Decimal(70.90),
    wolf: new Decimal(32.10),
    zinc: new Decimal(122.90),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045764991/2023-06-03/',
  },
} as const satisfies Record<CaminoAnnee, Record<SubstanceFiscaleId, Decimal> & { reference: string }>

const categories = {
  pme: {
    [toCaminoAnnee(2017)]: {
      value: new Decimal(362.95),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036016552/2018-01-01',
    },
    [toCaminoAnnee(2018)]: {
      value: new Decimal(358.3),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037342798/2019-01-01',
    },
    [toCaminoAnnee(2019)]: {
      value: new Decimal(345.23),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039355892/2020-01-01',
    },
    [toCaminoAnnee(2020)]: {
      value: new Decimal(400.35),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042327688/2020-09-13',
    },
    [toCaminoAnnee(2021)]: {
      value: new Decimal(498.06),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2021-11-17',
    },
    [toCaminoAnnee(2022)]: {
      value: new Decimal(488.97),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2022-07-27/',
    },
    [toCaminoAnnee(2023)]: {
      value: new Decimal(549.88),
      reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000048046958/2023-09-07',
    },
  },
  autre: {
    [toCaminoAnnee('2017')]: {
      value: new Decimal(725.9),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036016552/2018-01-01',
    },
    [toCaminoAnnee('2018')]: {
      value: new Decimal(716.6),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037342798/2019-01-01',
    },
    [toCaminoAnnee('2019')]: {
      value: new Decimal(690.47),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039355892/2020-01-01',
    },
    [toCaminoAnnee('2020')]: {
      value: new Decimal(800.71),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042327688/2020-09-13',
    },
    [toCaminoAnnee('2021')]: {
      value: new Decimal(996.13),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2021-11-17',
    },
    [toCaminoAnnee('2022')]: {
      value: new Decimal(977.95),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2022-07-27/',
    },
    [toCaminoAnnee('2023')]: {
      value: new Decimal(1099.77),
      reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000048046958/2023-09-07',
    },
  },
} as const satisfies Record<EntrepriseCategory, Record<CaminoAnnee, { value: Decimal; reference: string }>>

// 2009-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000020058692/2009-01-01
// 2016-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000031817025/2016-01-01
const deductionMontantMax = new Decimal(5000)

// 2009-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000020058692/2009-01-01
// 2016-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000031817025/2016-01-01
const deductionTaux = new Decimal(0.45)


type EntrepriseCategory = 'pme' | 'autre'

const toNewFiscalite = (productionBySubstance: ProductionBySubstance, annee: CaminoAnnee, isTitreGuyannais: boolean, category: EntrepriseCategory, investissement: Decimal, surfaceCommunaleProportionnee: Decimal): Fiscalite => {
  const fiscalite: Fiscalite = {
    redevanceCommunale: productionBySubstance.production.mul(redevanceCommunale[annee]?.auru).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN),
    redevanceDepartementale: productionBySubstance.production.mul(redevanceDepartementale[annee]?.auru).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN),
  }

  if (isTitreGuyannais) {

    const taxeAurifereBrute =  productionBySubstance.production.mul(categories[category][annee]?.value).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)

    const totalInvestissementsDeduits = Decimal.min(deductionMontantMax, investissement, taxeAurifereBrute.mul(deductionTaux)).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN).mul(surfaceCommunaleProportionnee).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)

    return {
      ...fiscalite,
      guyane: {
        taxeAurifereBrute,
        totalInvestissementsDeduits,
        taxeAurifere: taxeAurifereBrute.minus(totalInvestissementsDeduits) ,
      },
    }
  }

  return fiscalite
}

// FIXME générer les matrices et les comparer avec ce qu'on a envoyé à POH
// VISIBLE FOR TESTING
export const buildMatrices = (
  activitesAnnuelles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  activitesTrimestrielles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<Titres, 'titulaireIds' | 'amodiataireIds' | 'substances' | 'communes' | 'id' | 'slug'>[],
  annee: CaminoAnnee,
  communes: Commune[],
  entreprises: GetEntreprises[]
): BuildedMatrices => {

  const rawLines = getRawLines(activitesAnnuelles, activitesTrimestrielles, titres, annee, communes, entreprises)

  const matrice1121 = rawLines.map(line => {
    const fiscalite = line.fiscalite

    return {
      numeroOrdreMatrice: line.index,
      communeDuLieuPrincipalDExploitation: communes.find(({ id }) => id === line.communePrincipale.id)?.nom,
      designationEtAdresseDesConcessionnaires: titulaireToString(line.titulaire),
      natureDesSubstancesExtraites: 'Minerais aurifères',
      baseDesRedevancesNature: "Kilogramme d'or contenu",
      baseDesRedevancesQuantités: line.quantiteOrExtrait,
      redevanceDepartementaleTarifs: redevanceDepartementale[annee].auru,

      redevanceDepartementaleMontantNet: fiscalite.redevanceDepartementale,
      redevanceCommunaleTarifs: redevanceCommunale[annee].auru,
      redevanceCommunaleMontantNetRedevanceDesMines: fiscalite.redevanceCommunale,
      totalRedevanceDesMines: new Decimal(fiscalite.redevanceCommunale).add(new Decimal(fiscalite.redevanceDepartementale)),
      taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesPME: categories.pme[annee].value,
      taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesAutresEntreprises: categories.autre[annee].value,
      taxeMiniereSurLOrDeGuyaneMontantDesInvestissementsDeduits: 'guyane' in fiscalite ? fiscalite.guyane.totalInvestissementsDeduits : new Decimal(0),
      taxeMiniereSurLOrDeGuyaneMontantNetDeTaxeMinièreSurLOrDeGuyane: 'guyane' in fiscalite ? fiscalite.guyane.taxeAurifere : new Decimal(0),
      fraisDeGestionDeLaFiscaliteDirecteLocale: fraisGestion(fiscalite),
      serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement: 'Direction régionale des finances publiques (DRFIP) - Guyane',
      numeroDeLArticleDuRole: line.titreLabel,
    }
  })

  const matrice1122 = rawLines.map(line => {
    return {
      numeroOrdreMatrice: line.index,
      designationDesConcessionnaires: titulaireToString(line.titulaire),
      designationDesConcessions: line.titreLabel,
      departementsSurLeTerritoireDesquelsFonctionnentLesExploitations: Departements[line.departementId].nom,
      communesSurLeTerritoireDesquelsFonctionnentLesExploitations: `${communes.find(({ id }) => id === line.commune.id)?.nom} (${line.surfaceCommunale.div(1_000_000)} km²)`,
      tonnagesExtraitsAuCoursDeLAnneePrecedenteParDepartement: line.quantiteOrExtrait,
      tonnagesExtraitsAuCoursDeLAnneePrecedenteParCommune: line.quantiteOrExtrait,
      observations: "production en kilogramme d'or",
    }
  })

  const matrice1403 = Object.values(
    rawLines.reduce<Record<Sips, Matrice1403>>(
      (acc, line) => {
        const toAdd = acc[line.sip]

        if (toAdd === null) {
          throw new Error(`la commune ${line.commune.id} n'appartient à aucun SIP`)
        } else {
          const taxeMiniereSurLOrDeGuyane = 'guyane' in line.fiscalite ? line.fiscalite.guyane.taxeAurifere : 0
          toAdd.redevanceDepartementale = new Decimal(line.fiscalite.redevanceDepartementale).add(toAdd.redevanceDepartementale)
          toAdd.redevanceCommunale = new Decimal(line.fiscalite.redevanceCommunale).add(toAdd.redevanceCommunale)
          toAdd.taxeMiniereSurLOrDeGuyane = new Decimal(taxeMiniereSurLOrDeGuyane).add(toAdd.taxeMiniereSurLOrDeGuyane)
          toAdd.sommesRevenantALaRegionDeGuyane = new Decimal(taxeMiniereSurLOrDeGuyane).add(toAdd.sommesRevenantALaRegionDeGuyane)
          toAdd.sommesRevenantAuConservatoireDeBioDiversite = new Decimal(0).add(toAdd.sommesRevenantAuConservatoireDeBioDiversite)
          toAdd.sommesRevenantALEtatFraisAssietteEtRecouvrement = new Decimal(fraisGestion(line.fiscalite)).add(toAdd.sommesRevenantALEtatFraisAssietteEtRecouvrement)
          toAdd.sommesRevenantALEtatDegrevementsEtNonValeurs = new Decimal(0).add(toAdd.sommesRevenantALEtatDegrevementsEtNonValeurs)
          toAdd.sommesRevenantALEtatTotal = new Decimal(fraisGestion(line.fiscalite)).add(toAdd.sommesRevenantALEtatTotal)
          toAdd.totalColonnes = new Decimal(toAdd.redevanceDepartementale).add(toAdd.redevanceCommunale).add(toAdd.taxeMiniereSurLOrDeGuyane).add(toAdd.sommesRevenantALEtatTotal)
          toAdd.nombreDArticlesDesRoles++
        }

        return acc
      },
      {
        cayenne: {
          circonscriptionDe: sips.cayenne.nom,
          redevanceDepartementale: new Decimal(0),
          redevanceCommunale: new Decimal(0),
          taxeMiniereSurLOrDeGuyane: new Decimal(0),
          sommesRevenantALaRegionDeGuyane: new Decimal(0),
          sommesRevenantAuConservatoireDeBioDiversite: new Decimal(0),
          sommesRevenantALEtatFraisAssietteEtRecouvrement: new Decimal(0),
          sommesRevenantALEtatDegrevementsEtNonValeurs: new Decimal(0),
          sommesRevenantALEtatTotal: new Decimal(0),
          totalColonnes: new Decimal(0),
          nombreDArticlesDesRoles: 0,
        },
        kourou: {
          circonscriptionDe: sips.kourou.nom,
          redevanceDepartementale: new Decimal(0),
          redevanceCommunale: new Decimal(0),
          taxeMiniereSurLOrDeGuyane: new Decimal(0),
          sommesRevenantALaRegionDeGuyane: new Decimal(0),
          sommesRevenantAuConservatoireDeBioDiversite: new Decimal(0),
          sommesRevenantALEtatFraisAssietteEtRecouvrement: new Decimal(0),
          sommesRevenantALEtatDegrevementsEtNonValeurs: new Decimal(0),
          sommesRevenantALEtatTotal: new Decimal(0),
          totalColonnes: new Decimal(0),
          nombreDArticlesDesRoles: 0,
        },
        saintLaurentDuMaroni: {
          circonscriptionDe: sips.saintLaurentDuMaroni.nom,
          redevanceDepartementale: new Decimal(0),
          redevanceCommunale: new Decimal(0),
          taxeMiniereSurLOrDeGuyane: new Decimal(0),
          sommesRevenantALaRegionDeGuyane: new Decimal(0),
          sommesRevenantAuConservatoireDeBioDiversite: new Decimal(0),
          sommesRevenantALEtatFraisAssietteEtRecouvrement: new Decimal(0),
          sommesRevenantALEtatDegrevementsEtNonValeurs: new Decimal(0),
          sommesRevenantALEtatTotal: new Decimal(0),
          totalColonnes: new Decimal(0),
          nombreDArticlesDesRoles: 0,
        },
      }
    )
  )

  const matrice1404 = rawLines.reduce<Record<Sips, Matrice1404[]>>(
    (acc, line) => {
      const toAdd = acc[line.sip]
      const sip = sips[line.sip]

      if (toAdd === null) {
        throw new Error(`la commune ${line.commune.id} n'appartient à aucun SIP`)
      } else {
        const redevanceCommunalePremiereFraction = new Decimal(line.fiscalite.redevanceCommunale).mul(0.35).toDecimalPlaces(2)
        const redevanceCommunaleDeuxiemeFraction = new Decimal(line.fiscalite.redevanceCommunale).mul(0.1).toDecimalPlaces(2)
        toAdd.push({
          circonscriptionDe: sip?.nom ?? '',
          articlesDeRoles: line.index,
          designationDesExploitants: titulaireToString(line.titulaire),
          departements: Departements[line.departementId].nom,
          // TODO 2022-09-19 on est dans une impasse, impossible de répartir correctement la redevance entre la commune principale et les autres.
          // pour le moment, on fait comme les années précédences, en attendant une correction
          communes: communes.find(({ id }) => id === line.communePrincipale.id)?.nom ?? '',
          elementsDeBase_revenusImposablesALaTFPB: 0,
          elementsDeBase_tonnagesExtraits: line.quantiteOrExtrait,
          redevanceDepartementale_produitNetDeLaRedevance: line.fiscalite.redevanceDepartementale,
          redevanceDepartementale_sommesRevenantAuxDepartements: line.fiscalite.redevanceDepartementale,
          redevanceCommunale_produitNetDeLaRedevance: line.fiscalite.redevanceCommunale,
          redevanceCommunale_repartition_1ereFraction: redevanceCommunalePremiereFraction,
          redevanceCommunale_repartition_2emeFraction: redevanceCommunaleDeuxiemeFraction,
          redevanceCommunale_repartition_3emeFraction: new Decimal(line.fiscalite.redevanceCommunale).sub(redevanceCommunalePremiereFraction).sub(redevanceCommunaleDeuxiemeFraction),
          redevanceCommunale_revenantAuxCommunes_1ereFraction: redevanceCommunalePremiereFraction,
          redevanceCommunale_revenantAuxCommunes_2emeFraction: redevanceCommunaleDeuxiemeFraction,
          redevanceCommunale_revenantAuxCommunes_total: new Decimal(redevanceCommunalePremiereFraction).add(redevanceCommunaleDeuxiemeFraction),
          taxeMiniereSurLOrDeGuyane_produitNet: 'guyane' in line.fiscalite ? line.fiscalite.guyane.taxeAurifere : new Decimal(0),
          taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: 'guyane' in line.fiscalite ? line.fiscalite.guyane.taxeAurifere : new Decimal(0),
          taxeMiniereSurLOrDeGuyane_repartition_conservatoire: 0,
        })
      }

      return acc
    },
    {
      cayenne: [],
      kourou: [],
      saintLaurentDuMaroni: [],
    }
  )

  return { matrice1121, matrice1122, matrice1403, matrice1404, rawLines }
}

type TarifsBySubstances = Record<SubstanceFiscaleId, { tarifDepartemental: Decimal; tarifCommunal: Decimal }>
type Matrice1401Template = {
  article: number
  entreprise: string
  quantite: string
  substances: TarifsBySubstances
  taxePME: Decimal
  taxeAutre: Decimal
  redevanceCommunale: Decimal
  redevanceDepartementale: Decimal
  taxeMiniereOr: Decimal
  montantInvestissements: Decimal
  montantNetTaxeMiniereOr: Decimal
  totalCotisations: Decimal
  fraisGestion: Decimal
  total: Decimal
}
export const matrices = async (annee: CaminoAnnee, pool: Pool): Promise<void> => {
  const anneePrecedente = previousYear(annee)

  if (annee !== getCurrentAnnee()) {
    console.warn(`ATTENTION : Génération des matrices pour l’année de production ${anneePrecedente}`)
  }

  const titres = await titresGet(
    {
      regions: [REGION_IDS.Guyane],
    },
    {
      fields: {
        substancesEtape: { id: {} },
        communes: { id: {} },
        titulairesEtape: { id: {} },
        amodiatairesEtape: { id: {} },
        activites: { id: {} },
      },
    },
    userSuper
  )

  titres.forEach(titre => {
    if (!titre.titulaireIds) {
      throw new Error('titulaires non chargés')
    }
    if (!titre.amodiataireIds) {
      throw new Error('amodiataires non chargés')
    }
    if (!titre.activites) {
      throw new Error('activites non chargées')
    }
    if (titre.amodiataireIds.length + titre.titulaireIds.length > 1 && titre.activites.length > 0) {
      console.info('titre avec plusieurs titulaires/amodiataires', `https://camino.beta.gouv.fr/titres/${titre.slug}`)
    }
  })

  const activites = await titresActivitesGet(
    {
      typesIds: ['grx', 'gra', 'wrp'],
      statutsIds: ['dep'],
      annees: [anneePrecedente],
      titresIds: titres.map(({ id }) => id),
    },
    { fields: { id: {} } },
    userSuper
  )
  const activitesTrimestrielles = await titresActivitesGet(
    {
      typesIds: ['grp'],
      statutsIds: ['dep'],
      annees: [anneePrecedente],
      titresIds: titres.map(({ id }) => id),
    },
    { fields: { id: {} } },
    userSuper
  )

  const entreprises = await getEntreprises(pool)

  const communesIds = titres
    .flatMap(({ communes }) => communes?.map(({ id }) => id))
    .filter(onlyUnique)
    .filter(isNotNullNorUndefined)
  const communes = isNonEmptyArray(communesIds) ? await getCommunes(pool, { ids: communesIds }) : []

    const { matrice1121, matrice1122, matrice1403, matrice1404, rawLines } = buildMatrices(activites, activitesTrimestrielles, titres, annee, communes, entreprises)

    const { totalRedevanceDesMines, totalMontantNetTaxeMiniereOrGuyane, fraisGestionFiscaliteDirecteLocale } = matrice1121.reduce<{
      totalRedevanceDesMines: Decimal
      totalMontantNetTaxeMiniereOrGuyane: Decimal
      fraisGestionFiscaliteDirecteLocale: Decimal
    }>(
      (acc, value) => {
        acc.totalRedevanceDesMines = acc.totalRedevanceDesMines.add(value.totalRedevanceDesMines)
        acc.totalMontantNetTaxeMiniereOrGuyane = acc.totalMontantNetTaxeMiniereOrGuyane.add(value.taxeMiniereSurLOrDeGuyaneMontantNetDeTaxeMinièreSurLOrDeGuyane)
        acc.fraisGestionFiscaliteDirecteLocale = acc.fraisGestionFiscaliteDirecteLocale.add(value.fraisDeGestionDeLaFiscaliteDirecteLocale)

        return acc
      },
      {
        totalRedevanceDesMines: new Decimal(0),
        totalMontantNetTaxeMiniereOrGuyane: new Decimal(0),
        fraisGestionFiscaliteDirecteLocale: new Decimal(0),
      }
    )

    const totalTotal = totalRedevanceDesMines.add(totalMontantNetTaxeMiniereOrGuyane).add(fraisGestionFiscaliteDirecteLocale)
    await new Promise<void>(resolve => {
      carbone.render(
        'src/business/resources/matrice_1121-SD_2021.ods',
        {
          valeurs: matrice1121,
          annee,
          totalTotal,
          totalRedevanceDesMines,
          totalMontantNetTaxeMiniereOrGuyane,
          fraisGestionFiscaliteDirecteLocale,
        },
        function (err, result) {
          if (err) {
            return console.error(err)
          }
          fs.writeFileSync(`1121_${annee}.ods`, result)
          resolve()
        }
      )
    })

    const { totalParDepartement, totalParCommune } = matrice1122.reduce<{ totalParDepartement: Decimal; totalParCommune: Decimal }>(
      (acc, value) => {
        acc.totalParCommune = acc.totalParCommune.add(value.tonnagesExtraitsAuCoursDeLAnneePrecedenteParCommune)
        acc.totalParDepartement = acc.totalParDepartement.add(value.tonnagesExtraitsAuCoursDeLAnneePrecedenteParDepartement)

        return acc
      },
      {
        totalParDepartement: new Decimal(0),
        totalParCommune: new Decimal(0),
      }
    )
    await new Promise<void>(resolve => {
      carbone.render(
        'src/business/resources/matrice_1122-SD_2021.ods',
        {
          valeurs: matrice1122,
          annee,
          totalParDepartement,
          totalParCommune,
        },
        function (err, result) {
          if (err) {
            return console.error(err)
          }
          fs.writeFileSync(`1122_${annee}.ods`, result)
          resolve()
        }
      )
    })

    const total = matrice1403.reduce(
      (acc, cur) => {
        acc.redevanceDepartementale = new Decimal(acc.redevanceDepartementale).add(cur.redevanceDepartementale)
        acc.redevanceCommunale = new Decimal(acc.redevanceCommunale).add(cur.redevanceCommunale)
        acc.taxeMiniereSurLOrDeGuyane = new Decimal(acc.taxeMiniereSurLOrDeGuyane).add(cur.taxeMiniereSurLOrDeGuyane)
        acc.sommesRevenantALaRegionDeGuyane = new Decimal(acc.sommesRevenantALaRegionDeGuyane).add(cur.sommesRevenantALaRegionDeGuyane)
        acc.sommesRevenantAuConservatoireDeBioDiversite = new Decimal(acc.sommesRevenantAuConservatoireDeBioDiversite).add(cur.sommesRevenantAuConservatoireDeBioDiversite)
        acc.sommesRevenantALEtatFraisAssietteEtRecouvrement = new Decimal(acc.sommesRevenantALEtatFraisAssietteEtRecouvrement).add(cur.sommesRevenantALEtatFraisAssietteEtRecouvrement)
        acc.sommesRevenantALEtatDegrevementsEtNonValeurs = new Decimal(acc.sommesRevenantALEtatDegrevementsEtNonValeurs).add(cur.sommesRevenantALEtatDegrevementsEtNonValeurs)
        acc.sommesRevenantALEtatTotal = new Decimal(acc.sommesRevenantALEtatTotal).add(cur.sommesRevenantALEtatTotal)
        acc.totalColonnes = new Decimal(acc.totalColonnes).add(cur.totalColonnes)
        acc.nombreDArticlesDesRoles = new Decimal(acc.nombreDArticlesDesRoles).add(cur.nombreDArticlesDesRoles)

        return acc
      },
      {
        redevanceDepartementale: new Decimal(0),
        redevanceCommunale: new Decimal(0),
        taxeMiniereSurLOrDeGuyane: new Decimal(0),
        sommesRevenantALaRegionDeGuyane: new Decimal(0),
        sommesRevenantAuConservatoireDeBioDiversite: new Decimal(0),
        sommesRevenantALEtatFraisAssietteEtRecouvrement: new Decimal(0),
        sommesRevenantALEtatDegrevementsEtNonValeurs: new Decimal(0),
        sommesRevenantALEtatTotal: new Decimal(0),
        totalColonnes: new Decimal(0),
        nombreDArticlesDesRoles: new Decimal(0),
      }
    )
    await new Promise<void>(resolve => {
      carbone.render(
        'src/business/resources/matrice_1403-SD_2022.ods',
        {
          '1403': matrice1403,
          total,
          annee,
        },
        function (err, result) {
          if (err) {
            return console.error(err)
          }
          fs.writeFileSync(`1403_${annee}.ods`, result)
          resolve()
        }
      )
    })

    const total1404 = Object.keys(matrice1404)
      .filter(isSip)
      .reduce(
        (acc, sip) => {
          acc[sip] = matrice1404[sip].reduce(
            (accLine, line) => {
              accLine.elementsDeBase_tonnagesExtraits = new Decimal(accLine.elementsDeBase_tonnagesExtraits).add(Number.parseFloat(line.elementsDeBase_tonnagesExtraits))
              accLine.redevanceDepartementale_produitNetDeLaRedevance = new Decimal(accLine.redevanceDepartementale_produitNetDeLaRedevance).add(line.redevanceDepartementale_produitNetDeLaRedevance)
              accLine.redevanceDepartementale_sommesRevenantAuxDepartements = new Decimal(accLine.redevanceDepartementale_sommesRevenantAuxDepartements).add(
                line.redevanceDepartementale_sommesRevenantAuxDepartements
              )
              accLine.redevanceCommunale_produitNetDeLaRedevance = new Decimal(accLine.redevanceCommunale_produitNetDeLaRedevance).add(line.redevanceCommunale_produitNetDeLaRedevance)
              accLine.redevanceCommunale_repartition_1ereFraction = new Decimal(accLine.redevanceCommunale_repartition_1ereFraction).add(line.redevanceCommunale_repartition_1ereFraction)
              accLine.redevanceCommunale_repartition_2emeFraction = new Decimal(accLine.redevanceCommunale_repartition_2emeFraction).add(line.redevanceCommunale_repartition_2emeFraction)
              accLine.redevanceCommunale_repartition_3emeFraction = new Decimal(accLine.redevanceCommunale_repartition_3emeFraction).add(line.redevanceCommunale_repartition_3emeFraction)
              accLine.redevanceCommunale_revenantAuxCommunes_1ereFraction = new Decimal(accLine.redevanceCommunale_revenantAuxCommunes_1ereFraction).add(
                line.redevanceCommunale_revenantAuxCommunes_1ereFraction
              )
              accLine.redevanceCommunale_revenantAuxCommunes_2emeFraction = new Decimal(accLine.redevanceCommunale_revenantAuxCommunes_2emeFraction).add(
                line.redevanceCommunale_revenantAuxCommunes_2emeFraction
              )
              accLine.redevanceCommunale_revenantAuxCommunes_total = new Decimal(accLine.redevanceCommunale_revenantAuxCommunes_total).add(line.redevanceCommunale_revenantAuxCommunes_total)
              accLine.taxeMiniereSurLOrDeGuyane_produitNet = new Decimal(accLine.taxeMiniereSurLOrDeGuyane_produitNet).add(line.taxeMiniereSurLOrDeGuyane_produitNet)
              accLine.taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane = new Decimal(accLine.taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane).add(
                line.taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane
              )
              accLine.taxeMiniereSurLOrDeGuyane_repartition_conservatoire = new Decimal(accLine.taxeMiniereSurLOrDeGuyane_repartition_conservatoire).add(
                line.taxeMiniereSurLOrDeGuyane_repartition_conservatoire
              )

              return accLine
            },
            {
              elementsDeBase_tonnagesExtraits: new Decimal(0),
              redevanceDepartementale_produitNetDeLaRedevance: new Decimal(0),
              redevanceDepartementale_sommesRevenantAuxDepartements: new Decimal(0),
              redevanceCommunale_produitNetDeLaRedevance: new Decimal(0),
              redevanceCommunale_repartition_1ereFraction: new Decimal(0),
              redevanceCommunale_repartition_2emeFraction: new Decimal(0),
              redevanceCommunale_repartition_3emeFraction: new Decimal(0),
              redevanceCommunale_revenantAuxCommunes_1ereFraction: new Decimal(0),
              redevanceCommunale_revenantAuxCommunes_2emeFraction: new Decimal(0),
              redevanceCommunale_revenantAuxCommunes_total: new Decimal(0),
              taxeMiniereSurLOrDeGuyane_produitNet: new Decimal(0),
              taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: new Decimal(0),
              taxeMiniereSurLOrDeGuyane_repartition_conservatoire: new Decimal(0),
            }
          )

          return acc
        },
        {
          kourou: {},
          cayenne: {},
          saintLaurentDuMaroni: {},
        }
      )
    await new Promise<void>(resolve => {
      carbone.render(
        'src/business/resources/matrice_1404-SD_2022.ods',
        {
          ...matrice1404,
          total: total1404,
          annee,
        },
        function (err, result) {
          if (err) {
            return console.error(err)
          }
          fs.writeFileSync(`1404_${annee}.ods`, result)
          resolve()
        }
      )
    })

    const matrice1401: Record<
      Sips,
      Matrice1401Template[]
    > = { kourou: [], saintLaurentDuMaroni: [], cayenne: [] }
    for (const matriceLine of rawLines) {
      const fiscaliteLine = matriceLine.fiscalite

      if (!('guyane' in fiscaliteLine)) {
        console.error("cette ligne n'est pas de guyane", matriceLine)
      } else {
        const matrice: Matrice1401Template = {
          article: matriceLine.index,
          substances: {
              auru: {
                  tarifCommunal: redevanceCommunale[annee].auru,
                  tarifDepartemental: redevanceDepartementale[annee].auru
              },
              aloh: {
                  tarifDepartemental: redevanceDepartementale[annee].aloh,
                  tarifCommunal: redevanceCommunale[annee].aloh
              },
              anti: {
                  tarifDepartemental: redevanceDepartementale[annee].anti,
                  tarifCommunal: redevanceCommunale[annee].anti
              },
              arge: {
                  tarifDepartemental: redevanceDepartementale[annee].arge,
                  tarifCommunal: redevanceCommunale[annee].arge
              },
              arse: {
                  tarifDepartemental: redevanceDepartementale[annee].arse,
                  tarifCommunal: redevanceCommunale[annee].arse
              },
              bism: {
                  tarifDepartemental: redevanceDepartementale[annee].bism,
                  tarifCommunal: redevanceCommunale[annee].bism
              },
              cfxa: {
                  tarifDepartemental: redevanceDepartementale[annee].cfxa,
                  tarifCommunal: redevanceCommunale[annee].cfxa
              },
              cfxb: {
                  tarifDepartemental: redevanceDepartementale[annee].cfxb,
                  tarifCommunal: redevanceCommunale[annee].cfxb
              },
              cfxc: {
                  tarifDepartemental: redevanceDepartementale[annee].cfxc,
                  tarifCommunal: redevanceCommunale[annee].cfxc
              },
              coox: {
                  tarifDepartemental: redevanceDepartementale[annee].coox,
                  tarifCommunal: redevanceCommunale[annee].coox
              },
              cuiv: {
                  tarifDepartemental: redevanceDepartementale[annee].cuiv,
                  tarifCommunal: redevanceCommunale[annee].cuiv
              },
              etai: {
                  tarifDepartemental: redevanceDepartementale[annee].etai,
                  tarifCommunal: redevanceCommunale[annee].etai
              },
              fera: {
                  tarifDepartemental: redevanceDepartementale[annee].fera,
                  tarifCommunal: redevanceCommunale[annee].fera
              },
              ferb: {
                  tarifDepartemental: redevanceDepartementale[annee].ferb,
                  tarifCommunal: redevanceCommunale[annee].ferb
              },
              fluo: {
                  tarifDepartemental: redevanceDepartementale[annee].fluo,
                  tarifCommunal: redevanceCommunale[annee].fluo
              },
              hyda: {
                  tarifDepartemental: redevanceDepartementale[annee].hyda,
                  tarifCommunal: redevanceCommunale[annee].hyda
              },
              hydb: {
                  tarifDepartemental: redevanceDepartementale[annee].hydb,
                  tarifCommunal: redevanceCommunale[annee].hydb
              },
              hydc: {
                  tarifDepartemental: redevanceDepartementale[annee].hydc,
                  tarifCommunal: redevanceCommunale[annee].hydc
              },
              hydd: {
                  tarifDepartemental: redevanceDepartementale[annee].hydd,
                  tarifCommunal: redevanceCommunale[annee].hydd
              },
              hyde: {
                  tarifDepartemental: redevanceDepartementale[annee].hyde,
                  tarifCommunal: redevanceCommunale[annee].hyde
              },
              hydf: {
                  tarifDepartemental: redevanceDepartementale[annee].hydf,
                  tarifCommunal: redevanceCommunale[annee].hydf
              },
              kclx: {
                  tarifDepartemental: redevanceDepartementale[annee].kclx,
                  tarifCommunal: redevanceCommunale[annee].kclx
              },
              lith: {
                  tarifDepartemental: redevanceDepartementale[annee].lith,
                  tarifCommunal: redevanceCommunale[annee].lith
              },
              mang: {
                  tarifDepartemental: redevanceDepartementale[annee].mang,
                  tarifCommunal: redevanceCommunale[annee].mang
              },
              moly: {
                  tarifDepartemental: redevanceDepartementale[annee].moly,
                  tarifCommunal: redevanceCommunale[annee].moly
              },
              naca: {
                  tarifDepartemental: redevanceDepartementale[annee].naca,
                  tarifCommunal: redevanceCommunale[annee].naca
              },
              nacb: {
                  tarifDepartemental: redevanceDepartementale[annee].nacb,
                  tarifCommunal: redevanceCommunale[annee].nacb
              },
              nacc: {
                  tarifDepartemental: redevanceDepartementale[annee].nacc,
                  tarifCommunal: redevanceCommunale[annee].nacc
              },
              plom: {
                  tarifDepartemental: redevanceDepartementale[annee].plom,
                  tarifCommunal: redevanceCommunale[annee].plom
              },
              souf: {
                  tarifDepartemental: redevanceDepartementale[annee].souf,
                  tarifCommunal: redevanceCommunale[annee].souf
              },
              uran: {
                  tarifDepartemental: redevanceDepartementale[annee].uran,
                  tarifCommunal: redevanceCommunale[annee].uran
              },
              wolf: {
                  tarifDepartemental: redevanceDepartementale[annee].wolf,
                  tarifCommunal: redevanceCommunale[annee].wolf
              },
              zinc: {
                  tarifDepartemental: redevanceDepartementale[annee].zinc,
                  tarifCommunal: redevanceCommunale[annee].zinc
              }
          },
          entreprise: titulaireToString(matriceLine.titulaire),
          quantite: matriceLine.quantiteOrExtrait,
          taxePME: categories.pme[annee].value,
          taxeAutre: categories.autre[annee].value,
          redevanceCommunale: matriceLine.fiscalite.redevanceCommunale,
          redevanceDepartementale: matriceLine.fiscalite.redevanceDepartementale,
          taxeMiniereOr: fiscaliteLine.guyane.taxeAurifereBrute,
          montantInvestissements: fiscaliteLine.guyane.totalInvestissementsDeduits,
          montantNetTaxeMiniereOr: fiscaliteLine.guyane.taxeAurifere,
          totalCotisations: new Decimal(matriceLine.fiscalite.redevanceCommunale).add(matriceLine.fiscalite.redevanceDepartementale).add(fiscaliteLine.guyane.taxeAurifere),
          fraisGestion: fraisGestion(fiscaliteLine),
          total: new Decimal(matriceLine.fiscalite.redevanceCommunale).add(matriceLine.fiscalite.redevanceDepartementale).add(fiscaliteLine.guyane.taxeAurifere).add(fraisGestion(fiscaliteLine)),
        }
        matrice1401[matriceLine.sip].push(matrice)
        await new Promise<void>(resolve => {
          carbone.render(
            'src/business/resources/matrice_1402-SD_2022.ods',
            {
              ...matrice,
              departement: Departements[matriceLine.departementId].nom,
              commune: communes.find(({ id }) => id === matriceLine.commune.id)?.nom,
              role: matriceLine.titreLabel,
              titulaire: matriceLine.titulaire,
              titreLabel: matriceLine.titreLabel,
              annee,
              anneeSuivante: anneeSuivante(annee),
            },
            function (err, result) {
              if (err) {
                return console.error(err)
              }
              fs.writeFileSync(`1402_${annee}_${matriceLine.sip}_${matriceLine.index}_${matriceLine.titulaire.nom}_${matriceLine.titreLabel}.ods`, result)
              resolve()
            }
          )
        })
      }
    }

    for (const sip of Object.keys(sips)) {
      if (isSip(sip)) {
        await new Promise<void>(resolve => {
          const montantTotalSommeALEtat = matrice1401[sip].reduce((acc, cur) => acc.add(cur.fraisGestion), new Decimal(0))
          const fraisAssietteEtRecouvrement = montantTotalSommeALEtat.mul(4.4).div(8)
          carbone.render(
            'src/business/resources/matrice_1401-SD_2022.ods',
            {
              valeurs: matrice1401[sip],
              nombreArticles: matrice1401[sip].length,
              total: matrice1401[sip].reduce((acc, cur) => acc.add(cur.total), new Decimal(0)),
              montantTotalSommeALEtat,
              fraisAssietteEtRecouvrement,
              fraisDegrevement: montantTotalSommeALEtat.sub(fraisAssietteEtRecouvrement),
              redevanceDepartementale: matrice1401[sip].reduce((acc, cur) => acc.add(cur.redevanceDepartementale), new Decimal(0)),
              redevanceCommunale: matrice1401[sip].reduce((acc, cur) => acc.add(cur.redevanceCommunale), new Decimal(0)),
              montantNetTaxeMiniereOr: matrice1401[sip].reduce((acc, cur) => acc.add(cur.montantNetTaxeMiniereOr), new Decimal(0)),
              annee,
              anneePrecedente,
            },
            function (err, result) {
              if (err) {
                return console.error(err)
              }
              fs.writeFileSync(`1401_${sip}_${annee}.ods`, result)
              resolve()
            }
          )
        })
      } else {
        console.error(`${sip} n'est pas un SIP valide`)
      }
    }
    console.info('fini', new Date())
}
