import '../init'
import { titresGet } from '../database/queries/titres'
import { titresActivitesGet } from '../database/queries/titres-activites'
import { apiOpenfiscaCalculate, apiOpenfiscaConstantsFetch, OpenfiscaConstants, OpenfiscaResponse, OpenfiscaTarifs } from '../tools/api-openfisca/index'
import { bodyBuilder, toFiscalite } from '../api/rest/entreprises'
import { userSuper } from '../database/user-super'
import { fraisGestion } from 'camino-common/src/fiscalite'
import type { Fiscalite } from 'camino-common/src/validators/fiscalite'
import { ICommune, ITitre } from '../types'
import { DepartementLabel, Departements, toDepartementId } from 'camino-common/src/static/departement'
import fs from 'fs'
import carbone from 'carbone'
import { Pool } from 'pg'
import { getCommunes } from '../database/queries/communes.queries'
import { isNonEmptyArray, isNotNullNorUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { Commune } from 'camino-common/src/static/communes'
import { CaminoAnnee, caminoAnneeToNumber, anneePrecedente as previousYear, anneeSuivante, getCurrentAnnee } from 'camino-common/src/date'

import { Decimal } from 'decimal.js'
import { REGION_IDS } from 'camino-common/src/static/region'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { getEntreprises, GetEntreprises } from '../api/rest/entreprises.queries'

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
} as const
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
  redevanceDepartementale_produitNetDeLaRedevance: number
  redevanceDepartementale_sommesRevenantAuxDepartements: number
  redevanceCommunale_produitNetDeLaRedevance: number
  redevanceCommunale_repartition_1ereFraction: Decimal
  redevanceCommunale_repartition_2emeFraction: Decimal
  redevanceCommunale_repartition_3emeFraction: Decimal
  redevanceCommunale_revenantAuxCommunes_1ereFraction: Decimal
  redevanceCommunale_revenantAuxCommunes_2emeFraction: Decimal
  redevanceCommunale_revenantAuxCommunes_total: Decimal
  taxeMiniereSurLOrDeGuyane_produitNet: number
  taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: number
  taxeMiniereSurLOrDeGuyane_repartition_conservatoire: number
}

type Matrice1121 = {
  numeroOrdreMatrice: number
  communeDuLieuPrincipalDExploitation: string | undefined
  designationEtAdresseDesConcessionnaires: string
  natureDesSubstancesExtraites: string
  baseDesRedevancesNature: string
  baseDesRedevancesQuantités: any
  redevanceDepartementaleTarifs: number
  redevanceDepartementaleMontantNet: number
  redevanceCommunaleTarifs: number
  redevanceCommunaleMontantNetRedevanceDesMines: number
  totalRedevanceDesMines: Decimal
  taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesPME: number
  taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesAutresEntreprises: number
  taxeMiniereSurLOrDeGuyaneMontantDesInvestissementsDeduits: number
  taxeMiniereSurLOrDeGuyaneMontantNetDeTaxeMinièreSurLOrDeGuyane: number
  fraisDeGestionDeLaFiscaliteDirecteLocale: Decimal
  serviceDeLaDirectionGeneraleDesFinancesPubliquesEnChargeDuRecouvrement: string
  numeroDeLArticleDuRole: string | undefined
}

type Titulaire = {
  nom: string
  rue: string
  codepostal: string
  commune: string
  siren: string
}
type Matrices = {
  communePrincipale: ICommune
  commune: ICommune
  fiscalite: Fiscalite
  quantiteOrExtrait: string
  sip: Sips
  index: number
  titulaire: Titulaire
  departementLabel: DepartementLabel
  titreLabel: string
  surfaceCommunaleProportionnee: number
  surfaceCommunale: number
}

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

// VISIBLE FOR TESTING
export const buildMatrices = (
  result: OpenfiscaResponse,
  titres: Pick<ITitre, 'id' | 'slug' | 'titulaireIds' | 'communes'>[],
  annee: number,
  openfiscaConstants: OpenfiscaConstants,
  communes: Commune[],
  entreprises: Record<EntrepriseId, GetEntreprises>
): {
  matrice1121: Matrice1121[]
  matrice1122: Matrice1122[]
  matrice1403: Matrice1403[]
  matrice1404: Record<Sips, Matrice1404[]>
  rawLines: Matrices[]
} => {
  const anneePrecedente = annee - 1
  let count = 0
  const rawLines: Matrices[] = titres
    .filter(titre => isNotNullNorUndefined(result.titres[titre.id]))
    .flatMap(titre => {
      const communePrincipaleId = result.titres[titre.id]?.commune_principale_exploitation?.[anneePrecedente]
      const communePrincipale = titre.communes?.find(({ id }) => id === communePrincipaleId)

      if (!communePrincipale) {
        throw new Error(`commune principale ${communePrincipaleId} introuvable`)
      }

      return result.titres[titre.id].articles.map(articleKey => {
        count++

        const commune = titre.communes?.find(commune => {
          return result.communes[commune.id].articles.includes(articleKey)
        })
        if (!commune) {
          throw new Error(`commune de l’article ${articleKey} introuvable`)
        }

        const surfaceCommunaleProportionnee = result.articles[articleKey]?.surface_communale_proportionnee?.[anneePrecedente] ?? 1
        const surfaceCommunale = result.articles[articleKey]?.surface_communale?.[anneePrecedente] ?? 0
        const quantiteOrExtrait = new Decimal(result.articles[articleKey]?.quantite_aurifere_kg?.[anneePrecedente] ?? 0).mul(surfaceCommunaleProportionnee).toDecimalPlaces(3)

        const fiscalite = toFiscalite(result, articleKey, annee)

        const titreLabel = titre.slug ?? ''

        const departement = Departements[toDepartementId(commune.id)].nom

        let sip: Sips = 'saintLaurentDuMaroni'
        if (sips.saintLaurentDuMaroni.communes.includes(commune.id)) {
          sip = 'saintLaurentDuMaroni'
        } else if (sips.cayenne.communes.includes(commune.id)) {
          sip = 'cayenne'
        } else if (sips.kourou.communes.includes(commune.id)) {
          sip = 'kourou'
        }

        if (titre.titulaireIds?.length !== 1) {
          throw new Error(`Un seul titulaire doit être présent sur le titre ${titre.id}`)
        }
        const titulaireTitre = entreprises[titre.titulaireIds[0]]

        return {
          communePrincipale: communes.find(({ id }) => id === communePrincipale.id) ?? communePrincipale,
          commune: communes.find(({ id }) => id === commune.id) ?? commune,
          fiscalite,
          quantiteOrExtrait: `${quantiteOrExtrait}`,
          sip,
          index: count,
          titulaire: {
            nom: titulaireTitre.nom ?? '',
            rue: titulaireTitre.adresse ?? '',
            codepostal: titulaireTitre.code_postal ?? '',
            commune: titulaireTitre.commune ?? '',
            siren: titulaireTitre.legal_siren ?? '',
          },
          titreLabel,
          departementLabel: departement,
          surfaceCommunaleProportionnee,
          surfaceCommunale,
        }
      })
    })

  const matrice1121 = rawLines.map(line => {
    const fiscalite = line.fiscalite

    return {
      numeroOrdreMatrice: line.index,
      communeDuLieuPrincipalDExploitation: communes.find(({ id }) => id === line.communePrincipale.id)?.nom,
      designationEtAdresseDesConcessionnaires: titulaireToString(line.titulaire),
      natureDesSubstancesExtraites: 'Minerais aurifères',
      baseDesRedevancesNature: "Kilogramme d'or contenu",
      baseDesRedevancesQuantités: line.quantiteOrExtrait,
      redevanceDepartementaleTarifs: openfiscaConstants.substances.auru.tarifDepartemental,
      redevanceDepartementaleMontantNet: fiscalite.redevanceDepartementale,
      redevanceCommunaleTarifs: openfiscaConstants.substances.auru.tarifCommunal,
      redevanceCommunaleMontantNetRedevanceDesMines: fiscalite.redevanceCommunale,
      totalRedevanceDesMines: new Decimal(fiscalite.redevanceCommunale).add(new Decimal(fiscalite.redevanceDepartementale)),
      taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesPME: openfiscaConstants.tarifTaxeMinierePME,
      taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesAutresEntreprises: 0,
      taxeMiniereSurLOrDeGuyaneMontantDesInvestissementsDeduits: 'guyane' in fiscalite ? fiscalite.guyane.totalInvestissementsDeduits : 0,
      taxeMiniereSurLOrDeGuyaneMontantNetDeTaxeMinièreSurLOrDeGuyane: 'guyane' in fiscalite ? fiscalite.guyane.taxeAurifere : 0,
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
      departementsSurLeTerritoireDesquelsFonctionnentLesExploitations: line.departementLabel,
      communesSurLeTerritoireDesquelsFonctionnentLesExploitations: `${communes.find(({ id }) => id === line.commune.id)?.nom} (${line.surfaceCommunale / 1_000_000} km²)`,
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
          departements: line.departementLabel,
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
          taxeMiniereSurLOrDeGuyane_produitNet: 'guyane' in line.fiscalite ? line.fiscalite.guyane.taxeAurifere : 0,
          taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: 'guyane' in line.fiscalite ? line.fiscalite.guyane.taxeAurifere : 0,
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

export const matrices = async (annee: CaminoAnnee, pool: Pool) => {
  const anneeNumber = caminoAnneeToNumber(annee)
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
  const entreprisesIndex = entreprises.reduce<Record<EntrepriseId, GetEntreprises>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise

    return acc
  }, {})

  const communesIds = titres
    .flatMap(({ communes }) => communes?.map(({ id }) => id))
    .filter(onlyUnique)
    .filter(isNotNullNorUndefined)
  const communes = isNonEmptyArray(communesIds) ? await getCommunes(pool, { ids: communesIds }) : []

  const body = bodyBuilder(activites, activitesTrimestrielles, titres, anneeNumber, entreprises)
  if (Object.keys(body.articles).length > 0) {
    const result = await apiOpenfiscaCalculate(body)

    const openfiscaConstants = await apiOpenfiscaConstantsFetch(anneeNumber)

    const { matrice1121, matrice1122, matrice1403, matrice1404, rawLines } = buildMatrices(result, titres, anneeNumber, openfiscaConstants, communes, entreprisesIndex)

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
      {
        article: number
        entreprise: string
        quantite: string
        substances: OpenfiscaTarifs
        taxePME: number
        taxeAutre: number
        redevanceCommunale: number
        redevanceDepartementale: number
        taxeMiniereOr: number
        montantInvestissements: number
        montantNetTaxeMiniereOr: number
        totalCotisations: Decimal
        fraisGestion: Decimal
        total: Decimal
      }[]
    > = { kourou: [], saintLaurentDuMaroni: [], cayenne: [] }
    for (const matriceLine of rawLines) {
      const fiscaliteLine = matriceLine.fiscalite

      if (!('guyane' in fiscaliteLine)) {
        console.error("cette ligne n'est pas de guyane", matriceLine)
      } else {
        const matrice = {
          article: matriceLine.index,
          substances: openfiscaConstants.substances,
          entreprise: titulaireToString(matriceLine.titulaire),
          quantite: matriceLine.quantiteOrExtrait,
          taxePME: openfiscaConstants.tarifTaxeMinierePME,
          taxeAutre: openfiscaConstants.tarifTaxeMiniereAutre,
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
              departement: matriceLine.departementLabel,
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
}
