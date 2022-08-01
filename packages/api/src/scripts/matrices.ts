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

const matrice1121 = async () => {
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
  // console.info('body', JSON.stringify(body))
  if (Object.keys(body.articles).length > 0) {
    const result = await apiOpenfiscaFetch(body)
    // console.info('result', JSON.stringify(result))
    const articlesKeys = Object.keys(result.articles)
    const matrice = articlesKeys.map((key, index) => {
      const [titreId, _substance, communeId] = key.split('-')
      const titre = titres.find(({ id }) => id === titreId)
      const titulaireTitre = titre?.titulaires?.[0]
      const titulaire = `${titulaireTitre?.nom} - ${titulaireTitre?.adresse} - ${titulaireTitre?.legalSiren} SIREN`
      const commune = communes.find(({ id }) => id === communeId)
      const quantiteOrExtrait =
        result.articles[key]?.quantite_aurifere_kg?.[anneePrecedente]

      // FIXME récupérer depuis les substances ?
      const natureSubstance = 'Minerais aurifères'
      const natureRedevance = "Kilogramme d'or contenu"

      // FIXME récupérer ce paramètre dans openfisca ?
      const tarifDepartemental = 33.2

      const fiscalite = toFiscalite(result, key, annee)
      const redevanceDepartementale = fiscalite.redevanceDepartementale

      // FIXME récupérer ce paramètre dans openfisca ?
      const tarifCommunal = 166.3

      const redevanceCommunale = fiscalite.redevanceCommunale

      const totalRedevanceDesMines =
        redevanceCommunale + redevanceDepartementale

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
      const numeroDeLarticleDuRole = titre?.slug

      return {
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
          redevanceDepartementale,
        redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_tarifs:
          tarifCommunal,
        redevancesDepartementaleEtCommunaleDesMinesEtTaxeMiniereSurLOrDeGuyane_redevanceCommunale_montantNetRedevanceDesMines:
          redevanceCommunale,
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
      }
    })

    const worksheet = xlsx.utils.json_to_sheet(matrice)
    xlsx.utils.sheet_add_aoa(
      worksheet,
      [
        [
          "Numéro d'ordre de la matrice",
          "Commune du lieu principal d'exploitation",
          'Désignation et adresse des concessionnaires, titulaires de permis d’exploitation ou exploitants',
          'Nature des substances extraites',
          'Base des redevances | Nature',
          'Base des redevances | Quantités',
          'Redevance départementale | Tarifs',
          'Redevance départementale | Montant net',
          'Redevance communale | Tarifs',
          'Redevance communale | Montant net redevance des mines',
          'Total redevance des mines',
          "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les PME",
          "Taxe minière sur l'or de Guyane | Tarifs par kg extrait pour les autres entreprises",
          "Taxe minière sur l'or de Guyane | Montant des investissements déduits",
          "Taxe minière sur l'or de Guyane | Montant net de taxe minière sur l'or de Guyane",
          'Frais de gestion de la fiscalité directe locale',
          'Service de la Direction générale des Finances publiques en charge du recouvrement',
          "Numéro de l'article du rôle"
        ]
      ],
      { origin: 'A1' }
    )
    const csv = xlsx.utils.sheet_to_csv(worksheet)
    console.info(csv)
  }
}

matrice1121()
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
