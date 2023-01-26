import decamelize from 'decamelize'

import {
  ITitre,
  Index,
  IContenuValeur,
  IContenu,
  ICommune
} from '../../../types.js'
import { Departements } from 'camino-common/src/static/departement.js'
import { Regions } from 'camino-common/src/static/region.js'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales.js'
import {
  isNotNullNorUndefined,
  onlyUnique
} from 'camino-common/src/typescript-tools.js'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts.js'
import { ReferencesTypes } from 'camino-common/src/static/referencesTypes.js'
import {
  getDomaineId,
  getTitreTypeType
} from 'camino-common/src/static/titresTypes.js'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes.js'
import { Domaines } from 'camino-common/src/static/domaines.js'
import {
  getDepartementsBySecteurs,
  getFacadesComputed,
  SecteursMaritimes
} from 'camino-common/src/static/facades.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { titreContenuFormat } from '../titre-contenu'

const getFacadesMaritimeCell = (
  secteursMaritime: SecteursMaritimes[],
  separator: string
): string =>
  getFacadesComputed(secteursMaritime)
    .map(({ facade, secteurs }) => `${facade} (${secteurs.join(', ')})`)
    .join(separator)

const titreContenuTableFormat = (contenu?: IContenu | null) =>
  contenu
    ? Object.keys(contenu).reduce(
        (props: Index<IContenuValeur>, section) =>
          contenu && contenu[section]
            ? Object.keys(contenu[section]).reduce((props, element) => {
                if (contenu && contenu[section][element]) {
                  const propNom = decamelize(element).replace('_id', '')

                  props[propNom] = contenu[section][element] as IContenuValeur
                }

                return props
              }, props)
            : props,
        {}
      )
    : {}

export const titresTableFormat = (titres: ITitre[]) =>
  titres.map(titre => {
    if (!titre.secteursMaritime) {
      throw new Error('les secteurs maritimes ne sont pas chargés')
    }
    const { communes, departements, regions } = titreTerritoiresFind(
      titre.communes,
      titre.secteursMaritime
    )

    const titreReferences = titre.references
      ? titre.references.reduce((titreReferences: Index<string>, reference) => {
          titreReferences[
            `reference_${ReferencesTypes[reference.referenceTypeId].nom}`
          ] = reference.nom

          return titreReferences
        }, {})
      : {}

    const separator = ';'

    const titreNew = {
      id: titre.slug,
      nom: titre.nom,
      type: TitresTypesTypes[getTitreTypeType(titre.typeId)].nom,
      domaine: Domaines[getDomaineId(titre.typeId)].nom,
      date_debut: titre.dateDebut,
      date_fin: titre.dateFin,
      date_demande: titre.dateDemande,
      statut: isNotNullNorUndefined(titre.titreStatutId)
        ? TitresStatuts[titre.titreStatutId].nom
        : '',
      substances: titre.substances
        ?.map(substanceId => SubstancesLegale[substanceId].nom)
        ?.join(separator),
      'surface renseignee km2': titre.surface,
      'communes (surface calculee km2)': communes.join(separator),
      forets: titre.forets?.map(f => f.nom).join(separator),
      facades_maritimes: getFacadesMaritimeCell(
        titre.secteursMaritime,
        separator
      ),
      departements: departements.join(separator),
      regions: regions.join(separator),
      administrations_noms: titre
        .administrations!.map(id => Administrations[id].nom)
        .join(separator),
      titulaires_noms: titre.titulaires!.map(e => e.nom).join(separator),
      titulaires_adresses: titre
        .titulaires!.map(e => `${e.adresse} ${e.codePostal} ${e.commune}`)
        .join(separator),
      titulaires_legal: titre
        .titulaires!.map(e => e.legalEtranger || e.legalSiren)
        .join(separator),
      titulaires_categorie: titre
        .titulaires!.map(e => e.categorie)
        .join(separator),
      amodiataires_noms: titre.amodiataires!.map(e => e.nom).join(separator),
      amodiataires_adresses: titre
        .amodiataires!.map(e => `${e.adresse} ${e.codePostal} ${e.commune}`)
        .join(separator),
      amodiataires_legal: titre
        .amodiataires!.map(e => e.legalEtranger || e.legalSiren)
        .join(separator),
      amodiataires_categorie: titre
        .amodiataires!.map(e => e.categorie)
        .join(separator),
      geojson: JSON.stringify(titre.geojsonMultiPolygon),
      ...titreReferences,
      ...titreContenuTableFormat(titreContenuFormat(titre))
    }

    return titreNew
  })

const titreGeojsonPropertiesFormat = (titre: ITitre) => {
  if (!titre.secteursMaritime) {
    throw new Error('les secteurs maritimes ne sont pas chargés')
  }

  const { communes, departements, regions } = titreTerritoiresFind(
    titre.communes,
    titre.secteursMaritime
  )

  const separator = ', '

  return {
    id: titre.slug,
    nom: titre.nom,
    type: TitresTypesTypes[getTitreTypeType(titre.typeId)].nom,
    domaine: Domaines[getDomaineId(titre.typeId)].nom,
    date_debut: titre.dateDebut,
    date_fin: titre.dateFin,
    date_demande: titre.dateDemande,
    statut: isNotNullNorUndefined(titre.titreStatutId)
      ? TitresStatuts[titre.titreStatutId].nom
      : '',
    substances:
      titre.substances
        ?.map(substanceId => SubstancesLegale[substanceId].nom)
        ?.join(separator) || null,
    'surface renseignee km2': titre.surface,
    'communes (surface calculee km2)': communes.join(separator),
    forets: titre.forets?.map(f => f.nom).join(separator),
    facades_maritimes: getFacadesMaritimeCell(
      titre.secteursMaritime,
      separator
    ),
    departements: departements.join(separator),
    regions: regions.join(separator),
    administrations_noms: titre.administrations!.map(
      id => Administrations[id].nom
    ),
    titulaires_noms: titre.titulaires?.map(e => e.nom).join(separator) || null,
    titulaires_legal:
      titre.titulaires
        ?.map(e => e.legalEtranger || e.legalSiren)
        .join(separator) || null,
    amodiataires_noms:
      titre.amodiataires?.map(e => e.nom).join(separator) || null,
    amodiataires_legal:
      titre.amodiataires
        ?.map(e => e.legalEtranger || e.legalSiren)
        .join(separator) || null,
    references:
      titre.references &&
      titre.references
        .map(
          reference =>
            `${ReferencesTypes[reference.referenceTypeId].nom}: ${
              reference.nom
            }`
        )
        .join(separator),
    ...titreContenuTableFormat(titreContenuFormat(titre))
  }
}

export const titreGeojsonFormat = (titre: ITitre) => ({
  type: 'FeatureCollection',
  properties: titreGeojsonPropertiesFormat(titre),
  features: titre.geojsonPoints
    ? [titre.geojsonMultiPolygon].concat(titre.geojsonPoints.features)
    : titre.geojsonMultiPolygon
})

export const titresGeojsonFormat = (titres: ITitre[]) => ({
  type: 'FeatureCollection',
  features: titres.map(titre => ({
    type: 'Feature',
    geometry: titre.geojsonMultiPolygon?.geometry,
    properties: titreGeojsonPropertiesFormat(titre)
  }))
})

// FOR TESTING
export const titreTerritoiresFind = (
  communes?:
    | Pick<ICommune, 'nom' | 'departementId' | 'surface'>[]
    | null
    | undefined,
  secteursMaritime?: SecteursMaritimes[] | null | undefined
): { communes: string[]; departements: string[]; regions: string[] } => {
  const result: {
    communes: string[]
    departements: string[]
    regions: string[]
  } = { communes: [], departements: [], regions: [] }

  getDepartementsBySecteurs(secteursMaritime ?? [])
    .filter(onlyUnique)
    .forEach(departementId => {
      const departement = Departements[departementId]
      if (!result.departements.includes(departement.nom)) {
        result.departements.push(departement.nom)

        const region = Regions[departement.regionId]
        if (!result.regions.includes(region.nom)) {
          result.regions.push(region.nom)
        }
      }
    })
  ;(communes ?? []).forEach(commune => {
    result.communes.push(
      `${commune.nom} (${Math.round(commune.surface! / 100) / 10000})`
    )

    const departement = Departements[commune.departementId!]

    if (!result.departements.includes(departement.nom)) {
      result.departements.push(departement.nom)

      const region = Regions[departement.regionId]
      if (!result.regions.includes(region.nom)) {
        result.regions.push(region.nom)
      }
    }
  })

  result.regions.sort()
  result.communes.sort()
  result.departements.sort()

  return result
}
