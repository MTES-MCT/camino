import decamelize from 'decamelize'

import {
  ITitre,
  Index,
  IContenuValeur,
  IContenu,
  ICommune
} from '../../../types'
import { Departements } from 'camino-common/src/static/departement'
import { Regions } from 'camino-common/src/static/region'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'

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
    const { communes, departements, regions } = titreTerritoiresFind(
      titre.communes!
    )

    const titreReferences = titre.references
      ? titre.references.reduce((titreReferences: Index<string>, reference) => {
          titreReferences[`reference_${reference.type!.nom}`] = reference.nom

          return titreReferences
        }, {})
      : {}

    const separator = ';'

    const titreNew = {
      id: titre.slug,
      nom: titre.nom,
      type: titre.type!.type.nom,
      domaine: titre.domaine!.nom,
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
      departements: departements.join(separator),
      regions: regions.join(separator),
      administrations_noms: titre
        .administrations!.map(a => a.nom)
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
      ...titreContenuTableFormat(titre.contenu)
    }

    return titreNew
  })

const titreGeojsonPropertiesFormat = (titre: ITitre) => {
  const { communes, departements, regions } = titreTerritoiresFind(
    titre.communes!
  )

  const separator = ', '

  return {
    id: titre.slug,
    nom: titre.nom,
    type: titre.type!.type.nom,
    domaine: titre.domaine!.nom,
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
    departements: departements.join(separator),
    regions: regions.join(separator),
    administrations_noms: titre.administrations!.map(a => a.nom),
    titulaires_noms: titre.titulaires!.map(e => e.nom).join(separator) || null,
    titulaires_legal:
      titre
        .titulaires!.map(e => e.legalEtranger || e.legalSiren)
        .join(separator) || null,
    amodiataires_noms:
      titre.amodiataires!.map(e => e.nom).join(separator) || null,
    amodiataires_legal:
      titre
        .amodiataires!.map(e => e.legalEtranger || e.legalSiren)
        .join(separator) || null,
    references:
      titre.references &&
      titre.references
        .map(reference => `${reference.type!.nom}: ${reference.nom}`)
        .join(separator),
    ...titreContenuTableFormat(titre.contenu)
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
  communes: Pick<ICommune, 'nom' | 'departementId' | 'surface'>[]
): { communes: string[]; departements: string[]; regions: string[] } =>
  communes.reduce(
    ({ communes, departements, regions }, commune) => {
      communes.push(
        `${commune.nom} (${Math.round(commune.surface! / 100) / 10000})`
      )

      const departement = Departements[commune.departementId!]

      if (!departements.includes(departement.nom)) {
        departements.push(departement.nom)

        const region = Regions[departement.regionId]
        if (!regions.includes(region.nom)) {
          regions.push(region.nom)
        }
      }

      return { communes, departements, regions }
    },
    { communes: [], departements: [], regions: [] } as {
      communes: string[]
      departements: string[]
      regions: string[]
    }
  )
