import '../init'
import { titresGet } from '../database/queries/titres'
import { titresActivitesGet } from '../database/queries/titres-activites'
import { apiOpenfiscaFetch } from '../tools/api-openfisca'
import { bodyBuilder, toFiscalite } from '../api/rest/entreprises'
import { userSuper } from '../database/user-super'
import { entreprisesGet } from '../database/queries/entreprises'
import { communesGet } from '../database/queries/territoires'
import { fraisGestion, isFiscaliteGuyane } from 'camino-common/src/fiscalite'
import xlsx from 'xlsx'
import { ICommune, ITitre } from '../types'
import { Departements } from 'camino-common/src/static/departement'
import fs from 'fs'

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
      '97307' // Matoury
    ]
  },
  kourou: {
    nom: 'SIP de Kourou',
    communes: [
      '97304', // Kourou
      '97305', // Macouria
      '97303', // Iracoubo
      '97312', // Sinnamary
      '97358' // Saint-Élie
    ]
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
      '97311' //  Saint-Laurent-du-Maroni
    ]
  }
} as const

type Sips = keyof typeof sips
type Matrice1403 = {
  circonscriptionDe: string
  redevanceDepartementale: number
  redevanceCommunale: number
  taxeMiniereSurLOrDeGuyane: number
  sommesRevenantALaRegionDeGuyane: number
  sommesRevenantAuConservatoireDeBiodiversite: number
  fraisDAssietteEtDeRecouvrement: number
  degrevementsEtNonValeurs: number
  totalDesSommesRevenantALEtat: number
  totalDesSommes: number
  nombreDArticlesDesRoles: number
}
type Matrice1122 = {
  departementsEtCommunesSurLeTerritoireDesquelsFonctionnentLesExploitations_departements: string
  tonnagesExtraitsAuCoursDeLAnneePrecedente_parCommune: any
  observations: string
  numeroOrdreDeLaMatrice: number
  departementsEtCommunesSurLeTerritoireDesquelsFonctionnentLesExploitations_communes:
    | string
    | undefined
  designationEtAdressDesConcessionnaires: string
  designationDesConcessionsPermisOuExplorations: string | undefined
  tonnagesExtraitsAuCoursDeLAnneePrecedente_parDepartement: any
}
type Matrice1121 = {
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_totalRedevanceDesMines: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_tarifsParKgExtraitPourLes_autresEntreprises: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_montantNet: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_tarifsParKgExtraitPourLes_PME: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_tarifs: number
  serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement: string
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_tarifs: number
  communeDuLieuPrincipalDExploitation: string | undefined
  natureDesSubstancesExtraites: string
  numeroOrdreDeLaMatrice: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_montantNetRedevanceDesMines: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_baseDesRedevances_quantites: any
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantDesInvestissementsDeduits: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_baseDesRedevances_nature: string
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantNetDeTaxeMiniereSurLOrDeGuyane: number
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_fraisDeGestionDeLaFiscaliteDirecteLocale: number
  numeroDeLarticleDuRole: string | undefined
  designationEtAdressDesConcessionnaires: string
}

type Matrices = {
  '1122': Matrice1122
  '1121': Matrice1121
  raw: { commune: ICommune }
}

const matrice1403Header: Record<keyof Matrice1403, string> = {
  circonscriptionDe: 'Circonscription de',
  redevanceDepartementale: 'Redevance départementale',
  redevanceCommunale: 'Redevance communale',
  taxeMiniereSurLOrDeGuyane: "Taxe minière sur l'or de Guyane",
  sommesRevenantALaRegionDeGuyane: 'Sommes revenant à la Région de Guyane',
  sommesRevenantAuConservatoireDeBiodiversite:
    'Sommes revenant au Conservatoire de biodiversité',
  fraisDAssietteEtDeRecouvrement:
    "Sommes revenant à l'État | Frais d'assiette et de recouvrement",
  degrevementsEtNonValeurs:
    "Sommes revenant à l'État | Dégrèvements et non-valeurs",
  totalDesSommesRevenantALEtat: "Sommes revenant à l'État | Total",
  totalDesSommes: 'Total des colonnes',
  nombreDArticlesDesRoles: "Nombre d'articles des rôles"
}
const isLigneMatrice1403 = (entry: string): entry is keyof Matrice1403 => {
  return Object.keys(matrice1403Header).includes(entry)
}
const isLigneMatrice1121 = (entry: string): entry is keyof Matrice1121 => {
  return Object.keys(matrice1121Header).includes(entry)
}

const matrice1121Header: Record<keyof Matrice1121, string> = {
  communeDuLieuPrincipalDExploitation:
    "Commune du lieu principal d'exploitation",
  designationEtAdressDesConcessionnaires:
    'Désignation et adresse des concessionnaires, titulaires de permis d’exploitation ou exploitants',
  natureDesSubstancesExtraites: 'Nature des substances extraites',
  numeroDeLarticleDuRole: "Numéro de l'article du rôle",
  numeroOrdreDeLaMatrice: "Numéro d'ordre de la matrice",
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_baseDesRedevances_nature:
    'Base des redevances | Nature',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_baseDesRedevances_quantites:
    'Base des redevances | Quantités',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_fraisDeGestionDeLaFiscaliteDirecteLocale:
    'Frais de gestion de la fiscalité directe locale',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_montantNetRedevanceDesMines:
    'Redevance communale | Montant net redevance des mines',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_tarifs:
    'Redevance communale | Tarifs',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_montantNet:
    'Redevance départementale | Montant net',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_tarifs:
    'Redevance départementale | Tarifs',
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantDesInvestissementsDeduits:
    "Taxe minière sur l'or de Guyane | Montant des investissements déduits",
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantNetDeTaxeMiniereSurLOrDeGuyane:
    "Taxe minière sur l'or de Guyane | Montant net de taxe minière sur l'or de Guyane",
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_tarifsParKgExtraitPourLes_PME:
    "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les PME",
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_tarifsParKgExtraitPourLes_autresEntreprises:
    "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les autres entreprises",
  redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_totalRedevanceDesMines:
    'Total redevance des mines',
  serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement:
    'Service de la Direction générale des Finances publiques en charge du recouvrement'
} as const

const isLigneMatrice1122 = (entry: string): entry is keyof Matrice1122 => {
  return Object.keys(matrice1122Header).includes(entry)
}
const matrice1122Header: Record<keyof Matrice1122, string> = {
  departementsEtCommunesSurLeTerritoireDesquelsFonctionnentLesExploitations_communes:
    'Communes sur le territoire desquels fonctionnent les exploitations',
  departementsEtCommunesSurLeTerritoireDesquelsFonctionnentLesExploitations_departements:
    'Départements sur le territoire desquels fonctionnent les exploitations',
  designationDesConcessionsPermisOuExplorations: 'Désignation des concessions',
  designationEtAdressDesConcessionnaires: 'Désignation des concessionnaires',
  numeroOrdreDeLaMatrice: "Numéro d'ordre de la matrice",
  observations: 'Observations',
  tonnagesExtraitsAuCoursDeLAnneePrecedente_parCommune:
    "Tonnages extraits ou cours de l'année précédente | par commune",
  tonnagesExtraitsAuCoursDeLAnneePrecedente_parDepartement:
    "Tonnages extraits ou cours de l'année précédente | par département"
}

// FIXME 2022-08-02 c'est vraiment comme ça qu'on calcule le titulaire ?
// Ça peut être une bonne approximation pour les matrices 1121,1122,1403,1404 vu qu'il n'y a pas 2 titulaires sur un même titre, ni d'amodiataire
const titulaireToString = (titreId: string, titres: ITitre[]): string => {
  const titre = titres.find(({ id }) => id === titreId)
  const titulaireTitre = titre?.titulaires?.[0]

  return `${titulaireTitre?.nom} - ${titulaireTitre?.adresse} - ${titulaireTitre?.legalSiren} SIREN`
}
const numeroDeLarticleDuRoleString = (
  titreId: string,
  titres: ITitre[]
): string | undefined => {
  const titre = titres.find(({ id }) => id === titreId)

  return titre?.slug
}
const matrices = async () => {
  // TODO 2022-07-25 gérer l’année
  const annee = 2021
  const anneePrecedente = annee - 1

  const titres = await titresGet(
    { territoires: 'guyane' },
    {
      fields: {
        substances: { legales: { id: {} } },
        communes: { id: {} },
        titulaires: { id: {} },
        amodiataires: { id: {} },
        activites: { id: {} }
      }
    },
    userSuper
  )

  titres.forEach(titre => {
    if (!titre.titulaires) {
      throw new Error('titulaires non chargés')
    }
    if (!titre.amodiataires) {
      throw new Error('amodiataires non chargés')
    }
    if (!titre.activites) {
      throw new Error('activites non chargées')
    }
    if (
      titre.amodiataires.length + titre.titulaires.length > 1 &&
      titre.activites.length > 0
    ) {
      console.info(
        'titre avec plusieurs titulaires/amodiataires',
        `https://camino.beta.gouv.fr/titres/${titre.slug}`
      )
    }
  })

  const activites = await titresActivitesGet(
    {
      typesIds: ['grx', 'gra', 'wrp'],
      statutsIds: ['dep'],
      annees: [anneePrecedente],
      titresIds: titres.map(({ id }) => id)
    },
    { fields: { id: {} } },
    userSuper
  )
  const activitesTrimestrielles = await titresActivitesGet(
    {
      typesIds: ['grp'],
      statutsIds: ['dep'],
      annees: [anneePrecedente],
      titresIds: titres.map(({ id }) => id)
    },
    { fields: { id: {} } },
    userSuper
  )

  const entreprises = await entreprisesGet(
    {},
    { fields: { id: {} } },
    userSuper
  )

  const body = bodyBuilder(
    activites,
    activitesTrimestrielles,
    titres,
    annee,
    entreprises
  )
  const communes = await communesGet()
  if (Object.keys(body.articles).length > 0) {
    const result = await apiOpenfiscaFetch(body)
    const articlesKeys = Object.keys(result.articles)
    const matrices: Matrices[] = articlesKeys.map((articleKey, index) => {
      const [titreId, _substance, communeId] = articleKey.split('-')
      const titulaire = titulaireToString(titreId, titres)
      const commune = communes.find(({ id }) => id === communeId)
      if (!commune) {
        throw new Error(`commune ${communeId} introuvable`)
      }
      const quantiteOrExtrait =
        result.articles[articleKey]?.quantite_aurifere_kg?.[anneePrecedente]

      // FIXME récupérer depuis les substances ?
      const natureSubstance = 'Minerais aurifères'
      const natureRedevance = "Kilogramme d'or contenu"

      // FIXME récupérer ce paramètre dans openfisca ?
      const tarifDepartemental = 33.2

      const fiscalite = toFiscalite(result, articleKey, annee)
      // FIXME récupérer ce paramètre dans openfisca ?
      const tarifCommunal = 166.3

      const totalRedevanceDesMines =
        fiscalite.redevanceCommunale + fiscalite.redevanceDepartementale

      // FIXME récupérer ce paramètre dans openfisca ?
      const tarifTaxeMinierePME = 498.06
      const tarifTaxeMiniereAutres = 0

      const montantInvestissementsDeduits = isFiscaliteGuyane(fiscalite)
        ? fiscalite.guyane.totalInvestissementsDeduits
        : 0
      const montantNet: number = isFiscaliteGuyane(fiscalite)
        ? fiscalite.guyane.taxeAurifere
        : 0

      const fraisGestionFiscaliteDirecteLocale = fraisGestion(fiscalite)
      // FIXME ce n'est pas une administration ?
      const serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement =
        'Direction régionale des finances publiques (DRFIP) - Guyane'
      const numeroDeLarticleDuRole = numeroDeLarticleDuRoleString(
        titreId,
        titres
      )

      const departement = commune.departementId
        ? Departements[commune.departementId].nom
        : ''

      return {
        raw: { commune },
        1121: {
          numeroOrdreDeLaMatrice: index + 1,
          communeDuLieuPrincipalDExploitation: commune?.nom,
          designationEtAdressDesConcessionnaires: titulaire,
          natureDesSubstancesExtraites: natureSubstance,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_baseDesRedevances_nature:
            natureRedevance,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_baseDesRedevances_quantites:
            quantiteOrExtrait,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_tarifs:
            tarifDepartemental,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_montantNet:
            fiscalite.redevanceDepartementale,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_tarifs:
            tarifCommunal,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_montantNetRedevanceDesMines:
            fiscalite.redevanceCommunale,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_totalRedevanceDesMines:
            totalRedevanceDesMines,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_tarifsParKgExtraitPourLes_PME:
            tarifTaxeMinierePME,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_tarifsParKgExtraitPourLes_autresEntreprises:
            tarifTaxeMiniereAutres,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantDesInvestissementsDeduits:
            montantInvestissementsDeduits,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantNetDeTaxeMiniereSurLOrDeGuyane:
            montantNet,
          redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_fraisDeGestionDeLaFiscaliteDirecteLocale:
            fraisGestionFiscaliteDirecteLocale,
          serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement,
          numeroDeLarticleDuRole
        },
        1122: {
          numeroOrdreDeLaMatrice: index + 1,
          designationEtAdressDesConcessionnaires: titulaire,
          designationDesConcessionsPermisOuExplorations: numeroDeLarticleDuRole,
          departementsEtCommunesSurLeTerritoireDesquelsFonctionnentLesExploitations_departements:
            departement,
          departementsEtCommunesSurLeTerritoireDesquelsFonctionnentLesExploitations_communes:
            commune?.nom,
          tonnagesExtraitsAuCoursDeLAnneePrecedente_parDepartement:
            quantiteOrExtrait,
          tonnagesExtraitsAuCoursDeLAnneePrecedente_parCommune:
            quantiteOrExtrait,
          observations: "production en kilogramme d'or"
        }
      }
    })

    const worksheet1121 = xlsx.utils.json_to_sheet(
      matrices.map(matrice => matrice['1121'])
    )
    xlsx.utils.sheet_add_aoa(
      worksheet1121,
      [
        Object.keys(matrices[0]['1121'])
          .filter(isLigneMatrice1121)
          .map(ligne => matrice1121Header[ligne])
      ],
      { origin: 'A1' }
    )
    const csv1121 = xlsx.utils.sheet_to_csv(worksheet1121)
    fs.writeFileSync('1121.csv', csv1121)

    const worksheet1122 = xlsx.utils.json_to_sheet(
      matrices.map(matrice => matrice['1122'])
    )
    xlsx.utils.sheet_add_aoa(
      worksheet1122,
      [
        Object.keys(matrices[0]['1122'])
          .filter(isLigneMatrice1122)
          .map(ligne => matrice1122Header[ligne])
      ],
      { origin: 'A1' }
    )
    const csv1122 = xlsx.utils.sheet_to_csv(worksheet1122)
    fs.writeFileSync('1122.csv', csv1122)

    const matrice1403 = Object.values(
      matrices.reduce<Record<Sips, Matrice1403>>(
        (acc, ligne) => {
          let toAdd = null
          if (
            sips.saintLaurentDuMaroni.communes.includes(ligne.raw.commune.id)
          ) {
            toAdd = acc.saintLaurentDuMaroni
          } else if (sips.cayenne.communes.includes(ligne.raw.commune.id)) {
            toAdd = acc.cayenne
          } else if (sips.kourou.communes.includes(ligne.raw.commune.id)) {
            toAdd = acc.kourou
          }

          if (toAdd === null) {
            throw new Error(
              `la commune ${ligne.raw.commune.id} n'appartient à aucun SIP`
            )
          } else {
            toAdd.redevanceDepartementale +=
              ligne[
                '1121'
              ].redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceDepartementale_montantNet
            toAdd.redevanceCommunale +=
              ligne[
                '1121'
              ].redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_montantNetRedevanceDesMines
            toAdd.taxeMiniereSurLOrDeGuyane +=
              ligne[
                '1121'
              ].redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantNetDeTaxeMiniereSurLOrDeGuyane
            toAdd.sommesRevenantALaRegionDeGuyane +=
              ligne[
                '1121'
              ].redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_taxeMiniereSurLOrDeGuyane_montantNetDeTaxeMiniereSurLOrDeGuyane
            toAdd.sommesRevenantAuConservatoireDeBiodiversite += 0
            // FIXME ça vient d'oû ? on part du principe que ce sont les 8% de frais de gestion (ça semble coller)
            toAdd.fraisDAssietteEtDeRecouvrement +=
              ligne[
                '1121'
              ].redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_fraisDeGestionDeLaFiscaliteDirecteLocale
            toAdd.degrevementsEtNonValeurs += 0
            // FIXME ça vient d'oû ? on part du principe que ce sont les 8% de frais de gestion (ça semble coller)
            toAdd.totalDesSommesRevenantALEtat +=
              ligne[
                '1121'
              ].redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_fraisDeGestionDeLaFiscaliteDirecteLocale
            toAdd.totalDesSommes =
              toAdd.redevanceDepartementale +
              toAdd.redevanceCommunale +
              toAdd.taxeMiniereSurLOrDeGuyane +
              toAdd.totalDesSommesRevenantALEtat
            toAdd.nombreDArticlesDesRoles++
          }

          return acc
        },
        {
          cayenne: {
            circonscriptionDe: sips.cayenne.nom,
            redevanceDepartementale: 0,
            redevanceCommunale: 0,
            taxeMiniereSurLOrDeGuyane: 0,
            sommesRevenantALaRegionDeGuyane: 0,
            sommesRevenantAuConservatoireDeBiodiversite: 0,
            fraisDAssietteEtDeRecouvrement: 0,
            degrevementsEtNonValeurs: 0,
            totalDesSommesRevenantALEtat: 0,
            totalDesSommes: 0,
            nombreDArticlesDesRoles: 0
          },
          kourou: {
            circonscriptionDe: sips.kourou.nom,
            redevanceDepartementale: 0,
            redevanceCommunale: 0,
            taxeMiniereSurLOrDeGuyane: 0,
            sommesRevenantALaRegionDeGuyane: 0,
            sommesRevenantAuConservatoireDeBiodiversite: 0,
            fraisDAssietteEtDeRecouvrement: 0,
            degrevementsEtNonValeurs: 0,
            totalDesSommesRevenantALEtat: 0,
            totalDesSommes: 0,
            nombreDArticlesDesRoles: 0
          },
          saintLaurentDuMaroni: {
            circonscriptionDe: sips.saintLaurentDuMaroni.nom,
            redevanceDepartementale: 0,
            redevanceCommunale: 0,
            taxeMiniereSurLOrDeGuyane: 0,
            sommesRevenantALaRegionDeGuyane: 0,
            sommesRevenantAuConservatoireDeBiodiversite: 0,
            fraisDAssietteEtDeRecouvrement: 0,
            degrevementsEtNonValeurs: 0,
            totalDesSommesRevenantALEtat: 0,
            totalDesSommes: 0,
            nombreDArticlesDesRoles: 0
          }
        }
      )
    )

    const worksheet1403 = xlsx.utils.json_to_sheet(matrice1403)
    xlsx.utils.sheet_add_aoa(
      worksheet1403,
      [
        Object.keys(matrice1403[0])
          .filter(isLigneMatrice1403)
          .map(ligne => matrice1403Header[ligne])
      ],
      { origin: 'A1' }
    )
    const csv1403 = xlsx.utils.sheet_to_csv(worksheet1403)
    fs.writeFileSync('1403.csv', csv1403)
  }
}

matrices()
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
