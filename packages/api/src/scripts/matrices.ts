import pg, { Pool } from 'pg'
import { config } from '../config/index'
import { fraisGestion } from 'camino-common/src/fiscalite'
import { Departements } from 'camino-common/src/static/departement'
import { REGION_IDS } from 'camino-common/src/static/region'
import { onlyUnique, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import Decimal from 'decimal.js'
// TODO 2024-08-26 on a déplacé pas mal de code ici à cause de cet import carbone, qui empêche le CTRL+C de l'application dû au bug
// https://github.com/carboneio/carbone/issues/181
import carbone from 'carbone'
import { writeFileSync } from 'node:fs'
import { isNonEmptyArray } from 'effect/Array'
import { GetEntreprises, getEntreprises } from '../api/rest/entreprises.queries'
import { getAllTarifsBySubstances, getCategoriesForTaxeAurifereGuyane, getRedevanceCommunale, getRedevanceDepartementale } from '../business/fiscalite'
import { getCommunes } from '../database/queries/communes.queries'
import { titresGet } from '../database/queries/titres'
import { titresActivitesGet } from '../database/queries/titres-activites'
import { CaminoAnnee, anneePrecedente as previousYear, anneeSuivante, getCurrentAnnee } from 'camino-common/src/date'
import { userSuper } from '../database/user-super'
import { Commune } from 'camino-common/src/static/communes'
import { RawLineMatrice, Sips, Titulaire, getRawLines, isSip, sips } from '../business/matrices'
import Titres from '../database/models/titres'
import TitresActivites from '../database/models/titres-activites'
import { SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

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

type BuildedMatrices = {
  matrice1121: Matrice1121[]
  matrice1122: Matrice1122[]
  matrice1403: Matrice1403[]
  matrice1404: Record<Sips, Matrice1404[]>
  rawLines: RawLineMatrice[]
}
const buildMatrices = (
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
      redevanceDepartementaleTarifs: getRedevanceDepartementale(annee, 'auru'),

      redevanceDepartementaleMontantNet: fiscalite.redevanceDepartementale,
      redevanceCommunaleTarifs: getRedevanceCommunale(annee, 'auru'),
      redevanceCommunaleMontantNetRedevanceDesMines: fiscalite.redevanceCommunale,
      totalRedevanceDesMines: new Decimal(fiscalite.redevanceCommunale).add(new Decimal(fiscalite.redevanceDepartementale)),
      taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesPME: getCategoriesForTaxeAurifereGuyane(annee, 'pme'),
      taxeMiniereSurLOrDeGuyaneTarifsParKgExtraitPourLesAutresEntreprises: getCategoriesForTaxeAurifereGuyane(annee, 'autre'),
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
const matrices = async (annee: CaminoAnnee, pool: Pool): Promise<void> => {
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
        writeFileSync(`1121_${annee}.ods`, result)
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
        writeFileSync(`1122_${annee}.ods`, result)
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
        writeFileSync(`1403_${annee}.ods`, result)
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
        writeFileSync(`1404_${annee}.ods`, result)
        resolve()
      }
    )
  })

  const matrice1401: Record<Sips, Matrice1401Template[]> = { kourou: [], saintLaurentDuMaroni: [], cayenne: [] }
  for (const matriceLine of rawLines) {
    const fiscaliteLine = matriceLine.fiscalite

    if (!('guyane' in fiscaliteLine)) {
      console.error("cette ligne n'est pas de guyane", matriceLine)
    } else {
      const matrice: Matrice1401Template = {
        article: matriceLine.index,
        substances: getAllTarifsBySubstances(annee),
        entreprise: titulaireToString(matriceLine.titulaire),
        quantite: matriceLine.quantiteOrExtrait,
        taxePME: getCategoriesForTaxeAurifereGuyane(annee, 'pme'),
        taxeAutre: getCategoriesForTaxeAurifereGuyane(annee, 'autre'),
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
            writeFileSync(`1402_${annee}_${matriceLine.sip}_${matriceLine.index}_${matriceLine.titulaire.nom}_${matriceLine.titreLabel}.ods`, result)
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
            writeFileSync(`1401_${sip}_${annee}.ods`, result)
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
matrices(config().ANNEE, pool)
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
