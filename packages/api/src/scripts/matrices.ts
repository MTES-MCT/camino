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
import { ITitre } from '../types'
import { Departements } from 'camino-common/src/static/departement'
import fs from 'fs'

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

type Matrices = { '1122': Matrice1122; '1121': Matrice1121 }
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

      const departement = commune?.departementId
        ? Departements[commune?.departementId].nom
        : ''

      return {
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
