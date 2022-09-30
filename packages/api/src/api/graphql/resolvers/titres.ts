import { GraphQLResolveInfo } from 'graphql'

import { ITitre, ITitreColonneId, IToken } from '../../../types'

import { titreFormat, titresFormat } from '../../_format/titres'

import { fieldsBuild } from './_fields-build'

import {
  titreArchive,
  titreCreate,
  titreGet,
  titresCount,
  titresGet,
  titreUpsert
} from '../../../database/queries/titres'
import { userGet } from '../../../database/queries/utilisateurs'

import titreUpdateTask from '../../../business/titre-update'

import { titreUpdationValidate } from '../../../business/validations/titre-updation-validate'
import { domaineGet } from '../../../database/queries/metas'

const titre = async (
  { id }: { id: string },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    // query Titre($id: ID!) {  titre(id: $id) {    ...titre  }}fragment titre on Titre {  id  slug  nom  type {    ...titreType    sections  }  domaine {    id    nom  }  titreStatutId  references {    type {      id      nom    }    nom  }  substances  dateDebut  dateFin  activitesEnConstruction  activitesAbsentes  activitesDeposees  surface  administrations {    ...titreAdministrations  }  titresAdministrations {    id  }  titulaires {    ...titreEntreprises  }  amodiataires {    ...titreEntreprises  }  points {    ...point  }  geojsonPoints {    ...geojsonPoints  }  geojsonMultiPolygon {    ...geojsonMultiPolygon  }  communes {    ...commune  }  demarches {    ...titreDemarche  }  activites {    ...titreActivite  }  forets {    nom  }  sdomZones {    nom  }  contenu  modification  suppression  demarchesCreation  travauxCreation  doublonTitre {    id    nom  }  abonnement}fragment titreAdministrations on Administration {  id  nom  service  adresse1  adresse2  codePostal  commune  cedex  url  telephone  email}fragment titreEntreprises on Entreprise {  id  nom  paysId  legalSiren  legalEtranger  legalForme  adresse  codePostal  commune  cedex  url  etablissements {    id    nom    dateDebut    dateFin  }  operateur}fragment titreDemarche on Demarche {  id  description  slug  ordre  type {    ...demarcheType  }  statutId  phase {    dateDebut    dateFin    statut {      id      nom      couleur    }  }  etapes {    ...titreEtape  }  modification  etapesCreation  suppression}fragment titreEtape on Etape {  id  slug  ordre  date  dateDebut  dateFin  duree  surface  type {    id    nom    sections    documentsTypes {      ...documentType    }    justificatifsTypes {      ...documentType    }  }  statutId  administrations {    ...titreAdministrations  }  titulaires {    ...titreEntreprises  }  amodiataires {    ...titreEntreprises  }  points {    ...point  }  geojsonMultiPolygon {    ...geojsonMultiPolygon  }  substances  documents {    ...document  }  justificatifs {    ...document  }  incertitudes {    ...incertitudes  }  heritageProps {    ...heritageProps  }  communes {    ...commune  }  contenu  heritageContenu  decisionsAnnexesSections  decisionsAnnexesContenu  modification  deposable}fragment point on Point {  id  coordonnees {    x    y  }  groupe  contour  point  nom  description  securite  subsidiaire  lot  references {    ...pointReference  }}fragment pointReference on PointReference {  id  geoSystemeId  coordonnees {    x    y  }  opposable}fragment geojsonMultiPolygon on GeojsonMultiPolygon {  type  geometry {    type    coordinates  }}fragment commune on Commune {  id  nom  departementId}fragment document on Document {  id  type {    ...documentType  }  date  description  fichier  fichierTypeId  titreEtapeId  url  uri  jorf  nor  publicLecture  entreprisesLecture  modification  suppression}fragment documentType on DocumentType {  id  nom  optionnel  description}fragment heritageProps on HeritageProps {  dateDebut {    ...heritageProp  }  dateFin {    ...heritageProp  }  duree {    ...heritageProp  }  surface {    ...heritageProp  }  points {    ...heritageProp  }  substances {    ...heritageProp  }  titulaires {    ...heritageProp  }  amodiataires {    ...heritageProp  }}fragment heritageProp on HeritageProp {  etape {    ...heritageEtape  }  actif}fragment heritageEtape on Etape {  id  titreDemarcheId  ordre  date  dateDebut  dateFin  duree  surface  incertitudes {    ...incertitudes  }  type {    id    nom    sections  }  statutId  administrations {    ...titreAdministrations  }  titulaires {    ...titreEntreprises  }  amodiataires {    ...titreEntreprises  }  points {    ...point  }  substances  contenu}fragment incertitudes on Incertitudes {  date  dateDebut  dateFin  duree  surface  points  substances  titulaires  amodiataires}fragment demarcheType on DemarcheType {  id  nom  description  ordre  duree  points  substances  titulaires  exception  renouvelable  demarchesCreation  titreTypeId  travaux}fragment titreActivite on Activite {  id  slug  type {    ...activiteType  }  statut {    ...activiteStatut  }  date  annee  periodeId  dateSaisie  sections  contenu  suppression  modification  deposable  documents {    ...document  }}fragment activiteType on ActiviteType {  id  nom  dateDebut  delaiMois  ordre  frequenceId  sections  documentsTypes {    ...documentType  }  description}fragment activiteStatut on ActiviteStatut {  id  nom  couleur}fragment geojsonPoints on GeojsonPoints {  type  features {    type    properties {      id      groupe      contour      point      nom      description      references {        ...pointReference      }    }    geometry {      type      coordinates    }  }}fragment titreType on TitreType {  id  typeId  domaineId  type {    ...titreTypeType  }  domaine {    id    nom  }  titresCreation  contenuIds}fragment titreTypeType on TitreTypeType {  id  nom  description  ordre}
    const titre = await titreGet(id, { fields, fetchHeritage: true }, user)

    if (!titre) return null

    return titreFormat(titre, fields)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const titres = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    ids,
    perimetre,
    typesIds,
    domainesIds,
    statutsIds,
    substancesIds,
    entreprisesIds,
    noms,
    entreprises,
    references,
    territoires,
    demandeEnCours
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: ITitreColonneId | null
    ordre?: 'asc' | 'desc' | null
    ids: string[]
    perimetre?: number[] | null
    typesIds: string[]
    domainesIds: string[]
    statutsIds: string[]
    substancesIds: string[]
    entreprisesIds: string[]
    substances: string
    noms: string
    entreprises: string
    references: string
    territoires: string
    demandeEnCours: boolean | null
  },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info).elements

    const [titres, total] = await Promise.all([
      titresGet(
        {
          intervalle,
          page,
          colonne,
          ordre,
          ids,
          perimetre,
          typesIds,
          domainesIds,
          statutsIds,
          substancesIds,
          entreprisesIds,
          noms,
          entreprises,
          references,
          territoires,
          demandeEnCours
        },
        { fields },
        user
      ),
      titresCount(
        {
          ids,
          typesIds,
          domainesIds,
          statutsIds,
          substancesIds,
          entreprisesIds,
          noms,
          entreprises,
          references,
          territoires,
          demandeEnCours
        },
        { fields: {} },
        user
      )
    ])

    const titresFormatted = titres && titresFormat(titres, fields)

    return {
      elements: titresFormatted,
      page,
      intervalle,
      ordre,
      colonne,
      total
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

/**
 * TODO 2022-07-12 enlever cette fonction et nettoyer l'ui
 * @deprecated Not used by frontend, titreDemandeCreer is used instead
 */
const titreCreer = async (
  { titre }: { titre: ITitre },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const domaine = await domaineGet(
      titre.domaineId,
      { fields: { titresTypes: { id: {} } } },
      user
    )
    const titreType = domaine?.titresTypes.find(tt => tt.id === titre.typeId)

    if (!user || !titreType || !titreType.titresCreation)
      throw new Error('droits insuffisants')

    // insert le titre dans la base
    titre = await titreCreate(titre, { fields: {} })

    await titreUpdateTask(titre.id)

    const fields = fieldsBuild(info)

    const titreUpdated = await titreGet(titre.id, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const titreModifier = async (
  { titre }: { titre: ITitre },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const titreOld = await titreGet(
      titre.id,
      { fields: { titresAdministrations: { id: {} } } },
      user
    )

    if (!titreOld) throw new Error("le titre n'existe pas")

    if (!titreOld.modification) throw new Error('droits insuffisants')

    const rulesErrors = await titreUpdationValidate(titre, titreOld, user)

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    const fields = fieldsBuild(info)

    // on doit utiliser upsert (plutôt qu'un simple update)
    // car le titre contient des références (tableau d'objet)
    await titreUpsert(titre, { fields })

    await titreUpdateTask(titre.id)

    const titreUpdated = await titreGet(titre.id, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const titreSupprimer = async ({ id }: { id: string }, context: IToken) => {
  const user = await userGet(context.user?.id)

  const titreOld = await titreGet(
    id,
    {
      fields: {
        demarches: { etapes: { id: {} } },
        activites: { id: {} }
      }
    },
    user
  )

  if (!titreOld) throw new Error("le titre n'existe pas")

  if (!titreOld.suppression) throw new Error('droits insuffisants')

  await titreArchive(id)

  return titreOld.slug
}

export { titre, titres, titreCreer, titreModifier, titreSupprimer }
