import { ITitre, Index } from '../../../types.js'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts.js'
import { ReferencesTypes } from 'camino-common/src/static/referencesTypes.js'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes.js'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes.js'
import { Domaines } from 'camino-common/src/static/domaines.js'
import { getFacadesComputed, SecteursMaritimes } from 'camino-common/src/static/facades.js'
import { territoiresFind } from 'camino-common/src/territoires.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { valeurFind } from 'camino-common/src/sections.js'
import { titreSectionsGet } from '../titre-contenu.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { titreDemarcheSortAsc } from '../../../business/utils/titre-elements-sort-asc.js'
import { titreDateDemandeFind } from '../../../business/rules/titre-date-demande-find.js'
import { Forets } from 'camino-common/src/static/forets.js'
import { Pool } from 'pg'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { getCommunesIndex } from '../../../database/queries/communes.js'

const getFacadesMaritimeCell = (secteursMaritime: SecteursMaritimes[], separator: string): string =>
  getFacadesComputed(secteursMaritime)
    .map(({ facade, secteurs }) => `${facade} (${secteurs.join(', ')})`)
    .join(separator)

const titreContenuTableFormat = (titre: ITitre): Record<string, string> => {
  const sections = titreSectionsGet(titre)

  return sections.reduce((result, section) => {
    const subResult = section.elements.reduce<Record<string, string>>((acc, element) => {
      acc[element.nom ?? element.id] = valeurFind(element)

      return acc
    }, {})

    return { ...result, ...subResult }
  }, {})
}

export const titresTableFormat = async (pool: Pool, titres: ITitre[]) => {
  const communesIndex = await getCommunesIndex(
    pool,
    titres.flatMap(titre => titre.communes?.map(({ id }) => id) ?? [])
  )

  return titres.map(titre => {
    if (!titre.secteursMaritime) {
      throw new Error('les secteurs maritimes ne sont pas chargés')
    }

    const { communes, departements, regions } = territoiresFind(communesIndex, titre.communes, titre.secteursMaritime)

    const titreReferences = titre.references
      ? titre.references.reduce((titreReferences: Index<string>, reference) => {
          titreReferences[`reference_${ReferencesTypes[reference.referenceTypeId].nom}`] = reference.nom

          return titreReferences
        }, {})
      : {}

    const separator = ';'

    const { dateDebut, dateFin, dateDemande } = getTitreDates(titre)

    const titreNew = {
      id: titre.slug,
      nom: titre.nom,
      type: TitresTypesTypes[getTitreTypeType(titre.typeId)].nom,
      domaine: Domaines[getDomaineId(titre.typeId)].nom,
      date_debut: dateDebut,
      date_fin: dateFin,
      date_demande: dateDemande,
      statut: isNotNullNorUndefined(titre.titreStatutId) ? TitresStatuts[titre.titreStatutId].nom : '',
      substances: titre.substances?.map(substanceId => SubstancesLegale[substanceId].nom)?.join(separator),
      'surface renseignee km2': titre.surface,
      'communes (surface calculee km2)': communes.map(({ nom, surface }) => `${nom} ${surface !== null ? ` (${surface})` : ''}`).join(separator),
      forets: titre.forets?.map(fId => Forets[fId].nom).join(separator),
      facades_maritimes: getFacadesMaritimeCell(titre.secteursMaritime, separator),
      departements: departements.join(separator),
      regions: regions.join(separator),
      administrations_noms: titre.administrations!.map(id => Administrations[id].nom).join(separator),
      titulaires_noms: titre.titulaires?.map(e => e.nom).join(separator),
      titulaires_adresses: titre.titulaires?.map(e => `${e.adresse} ${e.codePostal} ${e.commune}`).join(separator),
      titulaires_legal: titre.titulaires?.map(e => e.legalEtranger || e.legalSiren).join(separator),
      titulaires_categorie: titre.titulaires?.map(e => e.categorie).join(separator),
      amodiataires_noms: titre.amodiataires?.map(e => e.nom).join(separator),
      amodiataires_adresses: titre.amodiataires?.map(e => `${e.adresse} ${e.codePostal} ${e.commune}`).join(separator),
      amodiataires_legal: titre.amodiataires?.map(e => e.legalEtranger || e.legalSiren).join(separator),
      amodiataires_categorie: titre.amodiataires?.map(e => e.categorie).join(separator),
      geojson: JSON.stringify(titre.geojsonMultiPolygon),
      ...titreReferences,
      ...titreContenuTableFormat(titre),
    }

    return titreNew
  })
}

const titreGeojsonPropertiesFormat = (communesIndex: Record<CommuneId, string>, titre: ITitre) => {
  if (!titre.secteursMaritime) {
    throw new Error('les secteurs maritimes ne sont pas chargés')
  }
  const { departements, regions } = territoiresFind(communesIndex, titre.communes, titre.secteursMaritime)

  const { dateDebut, dateFin, dateDemande } = getTitreDates(titre)

  return {
    id: titre.slug,
    nom: titre.nom,
    type: TitresTypesTypes[getTitreTypeType(titre.typeId)].nom,
    domaine: Domaines[getDomaineId(titre.typeId)].nom,
    date_debut: dateDebut,
    date_fin: dateFin,
    date_demande: dateDemande,
    statut: isNotNullNorUndefined(titre.titreStatutId) ? TitresStatuts[titre.titreStatutId].nom : '',
    substances: titre.substances?.map(substanceId => SubstancesLegale[substanceId].nom) || null,
    surface_totale: titre.surface,
    communes: titre.communes?.map(({ id }) => communesIndex[id]),
    surface_par_communes: titre.communes?.map(({ id, surface }) => ({ nom: communesIndex[id], surface: Math.round((surface ?? 0) / 100) / 10000 })),
    forets: titre.forets?.map(fId => Forets[fId].nom),
    facades_maritimes: getFacadesComputed(titre.secteursMaritime).map(({ facade }) => facade),
    departements,
    regions,
    administrations_noms: titre.administrations!.map(id => Administrations[id].nom),
    titulaires_noms: titre.titulaires?.map(e => e.nom) || null,
    titulaires_legal: titre.titulaires?.map(e => e.legalEtranger || e.legalSiren) || null,
    amodiataires_noms: titre.amodiataires?.map(e => e.nom) || null,
    amodiataires_legal: titre.amodiataires?.map(e => e.legalEtranger || e.legalSiren) || null,
    references: titre.references && titre.references.map(reference => `${ReferencesTypes[reference.referenceTypeId].nom}: ${reference.nom}`),
    ...titreContenuTableFormat(titre),
  }
}

const getTitreDates = (titre: Pick<ITitre, 'demarches'>): { dateDebut: CaminoDate | null; dateFin: CaminoDate | null; dateDemande: CaminoDate | null } => {
  const sortedDemarches = titreDemarcheSortAsc(titre.demarches ?? [])

  return {
    dateDebut: sortedDemarches.find(demarche => !!demarche.demarcheDateDebut)?.demarcheDateDebut ?? null,
    dateFin: sortedDemarches.reverse().find(demarche => demarche.demarcheDateDebut)?.demarcheDateFin ?? null,
    dateDemande: titreDateDemandeFind(sortedDemarches),
  }
}

export const titreGeojsonFormat = async (pool: Pool, titre: ITitre) => {
  const communesIndex = await getCommunesIndex(pool, titre.communes?.map(({ id }) => id) ?? [])

  return {
    type: 'FeatureCollection',
    properties: titreGeojsonPropertiesFormat(communesIndex, titre),
    features: titre.geojsonPoints ? [titre.geojsonMultiPolygon].concat(titre.geojsonPoints.features) : titre.geojsonMultiPolygon,
  }
}

export const titresGeojsonFormat = async (pool: Pool, titres: ITitre[]) => {
  const communesIndex = await getCommunesIndex(
    pool,
    titres.flatMap(titre => titre.communes?.map(({ id }) => id) ?? [])
  )

  return {
    type: 'FeatureCollection',
    features: titres.map(titre => ({
      type: 'Feature',
      geometry: titre.geojsonMultiPolygon?.geometry,
      properties: titreGeojsonPropertiesFormat(communesIndex, titre),
    })),
  }
}
