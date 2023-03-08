import '../init.js'
import { titresGet } from '../database/queries/titres.js'
import { titresActivitesGet } from '../database/queries/titres-activites.js'
import { apiOpenfiscaCalculate, apiOpenfiscaConstantsFetch, OpenfiscaConstants, OpenfiscaResponse, OpenfiscaTarifs } from '../tools/api-openfisca/index.js'
import { bodyBuilder, toFiscalite } from '../api/rest/entreprises.js'
import { userSuper } from '../database/user-super.js'
import { entreprisesGet } from '../database/queries/entreprises.js'
import { Fiscalite, fraisGestion, isFiscaliteGuyane } from 'camino-common/src/fiscalite.js'
import xlsx from 'xlsx'
import { ICommune, ITitre } from '../types.js'
import { Departements } from 'camino-common/src/static/departement.js'
import fs from 'fs'
import carbone from 'carbone'

const pleaseRound = (value: number): number => Number.parseFloat(value.toFixed(2))

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
  redevanceDepartementale: number
  redevanceCommunale: number
  taxeMiniereSurLOrDeGuyane: number
  sommesRevenantALaRegionDeGuyane: number
  sommesRevenantAuConservatoireDeBioDiversite: number
  sommesRevenantALEtatFraisAssietteEtRecouvrement: number
  sommesRevenantALEtatDegrevementsEtNonValeurs: number
  sommesRevenantALEtatTotal: number
  totalColonnes: number
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
  redevanceCommunale_repartition_1ereFraction: number
  redevanceCommunale_repartition_2emeFraction: number
  redevanceCommunale_repartition_3emeFraction: number
  redevanceCommunale_revenantAuxCommunes_1ereFraction: number
  redevanceCommunale_revenantAuxCommunes_2emeFraction: number
  redevanceCommunale_revenantAuxCommunes_total: number
  taxeMiniereSurLOrDeGuyane_produitNet: number
  taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: number
  taxeMiniereSurLOrDeGuyane_repartition_conservatoire: number
}

type Matrice1121 = {
  "Numéro d'ordre de la matrice": number
  "Commune du lieu principal d'exploitation": string | undefined
  'Désignation et adresse des concessionnaires, titulaires de permis d’exploitation ou exploitants': string
  'Nature des substances extraites': string
  'Base des redevances | Nature': string
  'Base des redevances | Quantités': any
  'Redevance départementale | Tarifs': number
  'Redevance départementale | Montant net': number
  'Redevance communale | Tarifs': number
  'Redevance communale | Montant net redevance des mines': number
  'Total redevance des mines': number
  "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les PME": number
  "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les autres entreprises": number
  "Taxe minière sur l'or de Guyane | Montant des investissements déduits": number
  "Taxe minière sur l'or de Guyane | Montant net de taxe minière sur l'or de Guyane": number
  'Frais de gestion de la fiscalité directe locale': number
  'Service de la Direction générale des Finances publiques en charge du recouvrement': string
  "Numéro de l'article du rôle": string | undefined
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
  departementLabel: string
  titreLabel: string
  surfaceCommunaleProportionnee: number
  surfaceCommunale: number
}

type Matrice1122 = {
  "Numéro d'ordre de la matrice": number
  'Désignation des concessionnaires': string
  'Désignation des concessions': string | undefined
  'Départements sur le territoire desquels fonctionnent les exploitations': string
  'Communes sur le territoire desquels fonctionnent les exploitations': string | undefined
  "Tonnages extraits ou cours de l'année précédente | par département": any
  "Tonnages extraits ou cours de l'année précédente | par commune": any
  Observations: string
}

const precisionGramme = (x: number): string => {
  return x.toFixed(3)
}

const titulaireToString = (titulaire: Titulaire): string => {
  return `${titulaire.nom} - ${titulaire.rue} - ${titulaire.siren} SIREN`
}

// VISIBLE FOR TESTING
export const buildMatrices = (
  result: OpenfiscaResponse,
  titres: Pick<ITitre, 'id' | 'slug' | 'titulaires' | 'communes'>[],
  annee: number,
  openfiscaConstants: OpenfiscaConstants
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
    .filter(titre => !!result.titres[titre.id])
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
        const quantiteOrExtrait = (result.articles[articleKey]?.quantite_aurifere_kg?.[anneePrecedente] ?? 0) * surfaceCommunaleProportionnee

        const fiscalite = toFiscalite(result, articleKey, annee)

        const titreLabel = titre.slug ?? ''

        const departement = commune.departementId ? Departements[commune.departementId].nom : ''

        let sip: Sips = 'saintLaurentDuMaroni'
        if (sips.saintLaurentDuMaroni.communes.includes(commune.id)) {
          sip = 'saintLaurentDuMaroni'
        } else if (sips.cayenne.communes.includes(commune.id)) {
          sip = 'cayenne'
        } else if (sips.kourou.communes.includes(commune.id)) {
          sip = 'kourou'
        }

        if (titre.titulaires?.length !== 1) {
          throw new Error(`Un seul titulaire doit être présent sur le titre ${titre.id}`)
        }
        const titulaireTitre = titre.titulaires[0]

        return {
          communePrincipale,
          commune,
          fiscalite,
          quantiteOrExtrait: precisionGramme(quantiteOrExtrait),
          sip,
          index: count,
          titulaire: {
            nom: titulaireTitre.nom ?? '',
            rue: titulaireTitre.adresse ?? '',
            codepostal: titulaireTitre.codePostal ?? '',
            commune: titulaireTitre.commune ?? '',
            siren: titulaireTitre.legalSiren ?? '',
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
      "Numéro d'ordre de la matrice": line.index,
      "Commune du lieu principal d'exploitation": line.communePrincipale.nom,
      'Désignation et adresse des concessionnaires, titulaires de permis d’exploitation ou exploitants': titulaireToString(line.titulaire),
      'Nature des substances extraites': 'Minerais aurifères',
      'Base des redevances | Nature': "Kilogramme d'or contenu",
      'Base des redevances | Quantités': line.quantiteOrExtrait,
      'Redevance départementale | Tarifs': openfiscaConstants.substances.auru.tarifDepartemental,
      'Redevance départementale | Montant net': fiscalite.redevanceDepartementale,
      'Redevance communale | Tarifs': openfiscaConstants.substances.auru.tarifCommunal,
      'Redevance communale | Montant net redevance des mines': fiscalite.redevanceCommunale,
      'Total redevance des mines': fiscalite.redevanceCommunale + fiscalite.redevanceDepartementale,
      "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les PME": openfiscaConstants.tarifTaxeMinierePME,
      "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les autres entreprises": 0,
      "Taxe minière sur l'or de Guyane | Montant des investissements déduits": isFiscaliteGuyane(fiscalite) ? fiscalite.guyane.totalInvestissementsDeduits : 0,
      "Taxe minière sur l'or de Guyane | Montant net de taxe minière sur l'or de Guyane": isFiscaliteGuyane(fiscalite) ? fiscalite.guyane.taxeAurifere : 0,
      'Frais de gestion de la fiscalité directe locale': fraisGestion(fiscalite),
      'Service de la Direction générale des Finances publiques en charge du recouvrement': 'Direction régionale des finances publiques (DRFIP) - Guyane',
      "Numéro de l'article du rôle": line.titreLabel,
    }
  })

  const matrice1122 = rawLines.map(line => {
    return {
      "Numéro d'ordre de la matrice": line.index,
      'Désignation des concessionnaires': titulaireToString(line.titulaire),
      'Désignation des concessions': line.titreLabel,
      'Départements sur le territoire desquels fonctionnent les exploitations': line.departementLabel,
      'Communes sur le territoire desquels fonctionnent les exploitations': `${line.commune?.nom} (${line.surfaceCommunale / 1_000_000} km²)`,
      "Tonnages extraits ou cours de l'année précédente | par département": line.quantiteOrExtrait,
      "Tonnages extraits ou cours de l'année précédente | par commune": line.quantiteOrExtrait,
      Observations: "production en kilogramme d'or",
    }
  })

  const matrice1403 = Object.values(
    rawLines.reduce<Record<Sips, Matrice1403>>(
      (acc, line) => {
        const toAdd = acc[line.sip]

        if (toAdd === null) {
          throw new Error(`la commune ${line.commune.id} n'appartient à aucun SIP`)
        } else {
          const taxeMiniereSurLOrDeGuyane = isFiscaliteGuyane(line.fiscalite) ? line.fiscalite.guyane.taxeAurifere : 0
          toAdd.redevanceDepartementale = pleaseRound(line.fiscalite.redevanceDepartementale + toAdd.redevanceDepartementale)
          toAdd.redevanceCommunale = pleaseRound(line.fiscalite.redevanceCommunale + toAdd.redevanceCommunale)
          toAdd.taxeMiniereSurLOrDeGuyane = pleaseRound(taxeMiniereSurLOrDeGuyane + toAdd.taxeMiniereSurLOrDeGuyane)
          toAdd.sommesRevenantALaRegionDeGuyane = pleaseRound(taxeMiniereSurLOrDeGuyane + toAdd.sommesRevenantALaRegionDeGuyane)
          toAdd.sommesRevenantAuConservatoireDeBioDiversite = pleaseRound(0 + toAdd.sommesRevenantAuConservatoireDeBioDiversite)
          toAdd.sommesRevenantALEtatFraisAssietteEtRecouvrement = pleaseRound(fraisGestion(line.fiscalite) + toAdd.sommesRevenantALEtatFraisAssietteEtRecouvrement)
          toAdd.sommesRevenantALEtatDegrevementsEtNonValeurs = pleaseRound(0 + toAdd.sommesRevenantALEtatDegrevementsEtNonValeurs)
          toAdd.sommesRevenantALEtatTotal = pleaseRound(fraisGestion(line.fiscalite) + toAdd.sommesRevenantALEtatTotal)
          toAdd.totalColonnes = pleaseRound(toAdd.redevanceDepartementale + toAdd.redevanceCommunale + toAdd.taxeMiniereSurLOrDeGuyane + toAdd.sommesRevenantALEtatTotal)
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
          sommesRevenantAuConservatoireDeBioDiversite: 0,
          sommesRevenantALEtatFraisAssietteEtRecouvrement: 0,
          sommesRevenantALEtatDegrevementsEtNonValeurs: 0,
          sommesRevenantALEtatTotal: 0,
          totalColonnes: 0,
          nombreDArticlesDesRoles: 0,
        },
        kourou: {
          circonscriptionDe: sips.kourou.nom,
          redevanceDepartementale: 0,
          redevanceCommunale: 0,
          taxeMiniereSurLOrDeGuyane: 0,
          sommesRevenantALaRegionDeGuyane: 0,
          sommesRevenantAuConservatoireDeBioDiversite: 0,
          sommesRevenantALEtatFraisAssietteEtRecouvrement: 0,
          sommesRevenantALEtatDegrevementsEtNonValeurs: 0,
          sommesRevenantALEtatTotal: 0,
          totalColonnes: 0,
          nombreDArticlesDesRoles: 0,
        },
        saintLaurentDuMaroni: {
          circonscriptionDe: sips.saintLaurentDuMaroni.nom,
          redevanceDepartementale: 0,
          redevanceCommunale: 0,
          taxeMiniereSurLOrDeGuyane: 0,
          sommesRevenantALaRegionDeGuyane: 0,
          sommesRevenantAuConservatoireDeBioDiversite: 0,
          sommesRevenantALEtatFraisAssietteEtRecouvrement: 0,
          sommesRevenantALEtatDegrevementsEtNonValeurs: 0,
          sommesRevenantALEtatTotal: 0,
          totalColonnes: 0,
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
        const redevanceCommunalePremiereFraction = pleaseRound(line.fiscalite.redevanceCommunale * 0.35)
        const redevanceCommunaleDeuxiemeFraction = pleaseRound(line.fiscalite.redevanceCommunale * 0.1)
        toAdd.push({
          circonscriptionDe: sip?.nom ?? '',
          articlesDeRoles: line.index,
          designationDesExploitants: titulaireToString(line.titulaire),
          departements: line.departementLabel,
          // TODO 2022-09-19 on est dans une impasse, impossible de répartir correctement la redevance entre la commune principale et les autres.
          // pour le moment, on fait comme les années précédences, en attendant une correction
          communes: line.communePrincipale.nom,
          elementsDeBase_revenusImposablesALaTFPB: 0,
          elementsDeBase_tonnagesExtraits: line.quantiteOrExtrait,
          redevanceDepartementale_produitNetDeLaRedevance: line.fiscalite.redevanceDepartementale,
          redevanceDepartementale_sommesRevenantAuxDepartements: line.fiscalite.redevanceDepartementale,
          redevanceCommunale_produitNetDeLaRedevance: line.fiscalite.redevanceCommunale,
          redevanceCommunale_repartition_1ereFraction: redevanceCommunalePremiereFraction,
          redevanceCommunale_repartition_2emeFraction: redevanceCommunaleDeuxiemeFraction,
          redevanceCommunale_repartition_3emeFraction: pleaseRound(line.fiscalite.redevanceCommunale * 0.55),
          redevanceCommunale_revenantAuxCommunes_1ereFraction: redevanceCommunalePremiereFraction,
          redevanceCommunale_revenantAuxCommunes_2emeFraction: redevanceCommunaleDeuxiemeFraction,
          redevanceCommunale_revenantAuxCommunes_total: pleaseRound(redevanceCommunalePremiereFraction + redevanceCommunaleDeuxiemeFraction),
          taxeMiniereSurLOrDeGuyane_produitNet: isFiscaliteGuyane(line.fiscalite) ? line.fiscalite.guyane.taxeAurifere : 0,
          taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: isFiscaliteGuyane(line.fiscalite) ? line.fiscalite.guyane.taxeAurifere : 0,
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

export const matrices = async (annee: number) => {
  const anneePrecedente = annee - 1

  const titres = await titresGet(
    {
      territoires: 'guyane',
    },
    {
      fields: {
        substancesEtape: { id: {} },
        communes: { id: {} },
        titulaires: { id: {} },
        amodiataires: { id: {} },
        activites: { id: {} },
      },
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
    if (titre.amodiataires.length + titre.titulaires.length > 1 && titre.activites.length > 0) {
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

  const entreprises = await entreprisesGet({}, { fields: { id: {} } }, userSuper)

  const body = bodyBuilder(activites, activitesTrimestrielles, titres, annee, entreprises)
  if (Object.keys(body.articles).length > 0) {
    const result = await apiOpenfiscaCalculate(body)

    const openfiscaConstants = await apiOpenfiscaConstantsFetch(annee)

    const { matrice1121, matrice1122, matrice1403, matrice1404, rawLines } = buildMatrices(result, titres, annee, openfiscaConstants)

    const worksheet1121 = xlsx.utils.json_to_sheet(matrice1121)
    const csv1121 = xlsx.utils.sheet_to_csv(worksheet1121)
    fs.writeFileSync(`1121_${annee}.csv`, csv1121)

    const worksheet1122 = xlsx.utils.json_to_sheet(matrice1122)
    const csv1122 = xlsx.utils.sheet_to_csv(worksheet1122)
    fs.writeFileSync(`1122_${annee}.csv`, csv1122)

    const total = matrice1403.reduce(
      (acc, cur) => {
        acc.redevanceDepartementale = pleaseRound(acc.redevanceDepartementale + cur.redevanceDepartementale)
        acc.redevanceCommunale = pleaseRound(acc.redevanceCommunale + cur.redevanceCommunale)
        acc.taxeMiniereSurLOrDeGuyane = pleaseRound(acc.taxeMiniereSurLOrDeGuyane + cur.taxeMiniereSurLOrDeGuyane)
        acc.sommesRevenantALaRegionDeGuyane = pleaseRound(acc.sommesRevenantALaRegionDeGuyane + cur.sommesRevenantALaRegionDeGuyane)
        acc.sommesRevenantAuConservatoireDeBioDiversite = pleaseRound(acc.sommesRevenantAuConservatoireDeBioDiversite + cur.sommesRevenantAuConservatoireDeBioDiversite)
        acc.sommesRevenantALEtatFraisAssietteEtRecouvrement = pleaseRound(acc.sommesRevenantALEtatFraisAssietteEtRecouvrement + cur.sommesRevenantALEtatFraisAssietteEtRecouvrement)
        acc.sommesRevenantALEtatDegrevementsEtNonValeurs = pleaseRound(acc.sommesRevenantALEtatDegrevementsEtNonValeurs + cur.sommesRevenantALEtatDegrevementsEtNonValeurs)
        acc.sommesRevenantALEtatTotal = pleaseRound(acc.sommesRevenantALEtatTotal + cur.sommesRevenantALEtatTotal)
        acc.totalColonnes = pleaseRound(acc.totalColonnes + cur.totalColonnes)
        acc.nombreDArticlesDesRoles = pleaseRound(acc.nombreDArticlesDesRoles + cur.nombreDArticlesDesRoles)

        return acc
      },
      {
        redevanceDepartementale: 0,
        redevanceCommunale: 0,
        taxeMiniereSurLOrDeGuyane: 0,
        sommesRevenantALaRegionDeGuyane: 0,
        sommesRevenantAuConservatoireDeBioDiversite: 0,
        sommesRevenantALEtatFraisAssietteEtRecouvrement: 0,
        sommesRevenantALEtatDegrevementsEtNonValeurs: 0,
        sommesRevenantALEtatTotal: 0,
        totalColonnes: 0,
        nombreDArticlesDesRoles: 0,
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
              accLine.elementsDeBase_tonnagesExtraits = pleaseRound(accLine.elementsDeBase_tonnagesExtraits + Number.parseFloat(line.elementsDeBase_tonnagesExtraits))
              accLine.redevanceDepartementale_produitNetDeLaRedevance = pleaseRound(accLine.redevanceDepartementale_produitNetDeLaRedevance + line.redevanceDepartementale_produitNetDeLaRedevance)
              accLine.redevanceDepartementale_sommesRevenantAuxDepartements = pleaseRound(
                accLine.redevanceDepartementale_sommesRevenantAuxDepartements + line.redevanceDepartementale_sommesRevenantAuxDepartements
              )
              accLine.redevanceCommunale_produitNetDeLaRedevance = pleaseRound(accLine.redevanceCommunale_produitNetDeLaRedevance + line.redevanceCommunale_produitNetDeLaRedevance)
              accLine.redevanceCommunale_repartition_1ereFraction = pleaseRound(accLine.redevanceCommunale_repartition_1ereFraction + line.redevanceCommunale_repartition_1ereFraction)
              accLine.redevanceCommunale_repartition_2emeFraction = pleaseRound(accLine.redevanceCommunale_repartition_2emeFraction + line.redevanceCommunale_repartition_2emeFraction)
              accLine.redevanceCommunale_repartition_3emeFraction = pleaseRound(accLine.redevanceCommunale_repartition_3emeFraction + line.redevanceCommunale_repartition_3emeFraction)
              accLine.redevanceCommunale_revenantAuxCommunes_1ereFraction = pleaseRound(
                accLine.redevanceCommunale_revenantAuxCommunes_1ereFraction + line.redevanceCommunale_revenantAuxCommunes_1ereFraction
              )
              accLine.redevanceCommunale_revenantAuxCommunes_2emeFraction = pleaseRound(
                accLine.redevanceCommunale_revenantAuxCommunes_2emeFraction + line.redevanceCommunale_revenantAuxCommunes_2emeFraction
              )
              accLine.redevanceCommunale_revenantAuxCommunes_total = pleaseRound(accLine.redevanceCommunale_revenantAuxCommunes_total + line.redevanceCommunale_revenantAuxCommunes_total)
              accLine.taxeMiniereSurLOrDeGuyane_produitNet = pleaseRound(accLine.taxeMiniereSurLOrDeGuyane_produitNet + line.taxeMiniereSurLOrDeGuyane_produitNet)
              accLine.taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane = pleaseRound(
                accLine.taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane + line.taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane
              )
              accLine.taxeMiniereSurLOrDeGuyane_repartition_conservatoire = pleaseRound(
                accLine.taxeMiniereSurLOrDeGuyane_repartition_conservatoire + line.taxeMiniereSurLOrDeGuyane_repartition_conservatoire
              )

              return accLine
            },
            {
              elementsDeBase_tonnagesExtraits: 0,
              redevanceDepartementale_produitNetDeLaRedevance: 0,
              redevanceDepartementale_sommesRevenantAuxDepartements: 0,
              redevanceCommunale_produitNetDeLaRedevance: 0,
              redevanceCommunale_repartition_1ereFraction: 0,
              redevanceCommunale_repartition_2emeFraction: 0,
              redevanceCommunale_repartition_3emeFraction: 0,
              redevanceCommunale_revenantAuxCommunes_1ereFraction: 0,
              redevanceCommunale_revenantAuxCommunes_2emeFraction: 0,
              redevanceCommunale_revenantAuxCommunes_total: 0,
              taxeMiniereSurLOrDeGuyane_produitNet: 0,
              taxeMiniereSurLOrDeGuyane_repartition_regionDeGuyane: 0,
              taxeMiniereSurLOrDeGuyane_repartition_conservatoire: 0,
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
        totalCotisations: number
        fraisGestion: number
        total: number
      }[]
    > = { kourou: [], saintLaurentDuMaroni: [], cayenne: [] }
    for (const matriceLine of rawLines) {
      const fiscaliteLine = matriceLine.fiscalite

      if (!isFiscaliteGuyane(fiscaliteLine)) {
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
          totalCotisations: pleaseRound(matriceLine.fiscalite.redevanceCommunale + matriceLine.fiscalite.redevanceDepartementale + fiscaliteLine.guyane.taxeAurifere),
          fraisGestion: fraisGestion(fiscaliteLine),
          total: pleaseRound(matriceLine.fiscalite.redevanceCommunale + matriceLine.fiscalite.redevanceDepartementale + fiscaliteLine.guyane.taxeAurifere + fraisGestion(fiscaliteLine)),
        }
        matrice1401[matriceLine.sip].push(matrice)
        await new Promise<void>(resolve => {
          carbone.render(
            'src/business/resources/matrice_1402-SD_2022.ods',
            {
              ...matrice,
              departement: matriceLine.departementLabel,
              commune: matriceLine.commune.nom,
              role: matriceLine.titreLabel,
              titulaire: matriceLine.titulaire,
              titreLabel: matriceLine.titreLabel,
              annee,
              anneeSuivante: annee + 1,
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
          const montantTotalSommeALEtat = pleaseRound(matrice1401[sip].reduce((acc, cur) => acc + cur.fraisGestion, 0))
          const fraisAssietteEtRecouvrement = pleaseRound((montantTotalSommeALEtat * 4.4) / 8)
          carbone.render(
            'src/business/resources/matrice_1401-SD_2022.ods',
            {
              valeurs: matrice1401[sip],
              nombreArticles: matrice1401[sip].length,
              total: pleaseRound(matrice1401[sip].reduce((acc, cur) => acc + cur.total, 0)),
              montantTotalSommeALEtat,
              fraisAssietteEtRecouvrement,
              fraisDegrevement: pleaseRound(montantTotalSommeALEtat - fraisAssietteEtRecouvrement),
              redevanceDepartementale: pleaseRound(matrice1401[sip].reduce((acc, cur) => acc + cur.redevanceDepartementale, 0)),
              redevanceCommunale: pleaseRound(matrice1401[sip].reduce((acc, cur) => acc + cur.redevanceCommunale, 0)),
              montantNetTaxeMiniereOr: pleaseRound(matrice1401[sip].reduce((acc, cur) => acc + cur.montantNetTaxeMiniereOr, 0)),
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
