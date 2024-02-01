import { QueryBuilder } from 'objection'

import { stringSplit } from './_utils.js'

import Titres from '../models/titres.js'
import TitresDemarches from '../models/titres-demarches.js'
import TitresActivites from '../models/titres-activites.js'
import { DepartementId, departements as departementsStatic, isDepartementId } from 'camino-common/src/static/departement.js'
import { RegionId } from 'camino-common/src/static/region.js'
import { FacadesMaritimes, getSecteurs } from 'camino-common/src/static/facades.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, onlyUnique } from 'camino-common/src/typescript-tools.js'

type ITitreTableName = 'titres' | 'titre'
type ITitreRootName = 'titres' | 'titresDemarches' | 'titresActivites'

const jointureFormat = (name: string, jointure: string) => (name === 'titre' ? `titre.${jointure}` : jointure)

const fieldFormat = (name: string, field: string) => (name === 'titre' ? `titre:${field}` : field)

// name: nom de la table ou de la relation sur laquelle s'effectue la requête
// - 'titres' depuis la table 'titres'
// - 'titre' depuis la table 'titresDemarches'
// root: nom de la table de base
export const titresFiltersQueryModify = (
  {
    ids,
    perimetre,
    domainesIds,
    typesIds,
    statutsIds,
    substancesIds,
    entreprisesIds,
    noms,
    references,
    communes,
    departements,
    regions,
    facadesMaritimes,
  }: {
    ids?: string[] | null
    perimetre?: number[] | null
    domainesIds?: string[] | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    substancesIds?: string[] | null
    entreprisesIds?: string[] | null
    noms?: string | null
    references?: string | null
    communes?: string | null
    departements?: DepartementId[] | null
    regions?: RegionId[] | null
    facadesMaritimes?: FacadesMaritimes[] | null
  } = {},
  q: QueryBuilder<Titres, Titres[]> | QueryBuilder<TitresDemarches, TitresDemarches[]> | QueryBuilder<TitresActivites, TitresActivites[]>,
  name: ITitreTableName = 'titres',
  root: ITitreRootName = 'titres'
) => {
  if (isNotNullNorUndefinedNorEmpty(ids)) {
    q.whereIn(`${name}.id`, ids)
  }

  if (isNotNullNorUndefinedNorEmpty(perimetre) && perimetre.length === 4) {
    q.leftJoinRelated(jointureFormat(name, 'pointsEtape'))
    q.whereRaw(`ST_INTERSECTS(??, st_setsrid('BOX(${perimetre[0]} ${perimetre[1]}, ${perimetre[2]} ${perimetre[3]})'::box2d, 4326)) is true`, ['pointsEtape.geojson4326_perimetre'])
  }

  if (isNotNullNorUndefinedNorEmpty(domainesIds)) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.whereRaw(`right(${name}.type_id, 1 ) in (${domainesIds.map(() => '?').join(',')})`, domainesIds)
  }

  if (isNotNullNorUndefinedNorEmpty(typesIds)) {
    q.whereRaw(`left( ${name}.type_id, 2 ) in (${typesIds.map(() => '?').join(',')})`, typesIds)
  }

  if (isNotNullNorUndefinedNorEmpty(statutsIds)) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.whereIn(`${name}.titreStatutId`, statutsIds)
  }

  if (isNotNullNorUndefinedNorEmpty(substancesIds)) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.leftJoinRelated(jointureFormat(name, 'substancesEtape'))

    q.where(b => {
      substancesIds.forEach(s => {
        b.orWhereRaw(`?? @> '["${s}"]'::jsonb`, [fieldFormat(name, 'substancesEtape.substances')])
      })
    })
  }

  if (isNotNullNorUndefinedNorEmpty(entreprisesIds)) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }
    q.leftJoinRelated(jointureFormat(name, '[titulaires, amodiataires]'))

    q.where(b => {
      b.whereIn(fieldFormat(name, 'titulaires.id'), entreprisesIds)
      b.orWhereIn(fieldFormat(name, 'amodiataires.id'), entreprisesIds)
    })
  }

  if (isNotNullNorUndefined(noms) && noms !== '') {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.where(b => {
      b.whereRaw(`LOWER(??) LIKE LOWER(?)`, [`${name}.nom`, `%${noms}%`]).orWhereRaw(`LOWER(??) LIKE LOWER(?)`, [`${name}.slug`, `%${noms}%`])
    })
  }

  if (isNotNullNorUndefined(references) && references !== '') {
    const referencesArray = stringSplit(references).map(s => s.toLowerCase())

    let field: string
    if (root === 'titres') {
      field = 'titres.references'
    } else {
      field = 'titre.references'
    }

    q.whereRaw(`exists (select 1 from jsonb_array_elements(${field}) titreRefs where ${referencesArray.map(() => "lower(titreRefs->>'nom') like ?").join(' or ')})`, [
      ...referencesArray.map(s => `%${s}%`),
    ])
  }

  if (isNotNullNorUndefined(communes) && communes !== '') {
    const communesArray = stringSplit(communes)

    q.joinRaw(`join titres_etapes as communes_points_etapes on communes_points_etapes.id = ${name}."props_titre_etapes_ids" #>> '{points}'`)
    q.whereRaw(
      `exists (select 1 
        from jsonb_array_elements(communes_points_etapes.communes) communes_filter_communes 
        join communes as communes_filter_communes_communes on communes_filter_communes->>'id' = communes_filter_communes_communes.id
      where ${communesArray.map(() => 'lower(communes_filter_communes_communes.nom) like ? OR communes_filter_communes_communes.id = ?').join(' or ')})`,
      [...communesArray.flatMap(t => [`%${t.toLowerCase()}%`, t])]
    )
  }
  let departementIds: DepartementId[] = []
  if (departements) {
    departementIds.push(...departements)
  }

  if (isNotNullNorUndefinedNorEmpty(regions)) {
    departementIds.push(...departementsStatic.filter(({ regionId }) => regions.includes(regionId)).map(({ id }) => id))
  }

  departementIds = departementIds.filter(onlyUnique).filter(isDepartementId)

  if (departementIds.length > 0) {
    q.joinRaw(`join titres_etapes as departements_points_etapes on departements_points_etapes.id = ${name}."props_titre_etapes_ids" #>> '{points}'`).whereRaw(
      `exists (select 1 from jsonb_array_elements(departements_points_etapes.communes) departements_filter_communes where substring(departements_filter_communes ->> 'id', 1, 2) in (${departementIds
        .map(() => '?')
        .join(',')}) or substring(departements_filter_communes ->> 'id', 1, 3) in (${departementIds.map(() => '?').join(',')}))`,
      [...departementIds, ...departementIds]
    )
  }

  if (facadesMaritimes && facadesMaritimes.length > 0) {
    const secteurs = facadesMaritimes.flatMap(facade => getSecteurs(facade))
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }
    q.joinRaw(`join titres_etapes as facades_points_etapes on facades_points_etapes.id = ${name}."props_titre_etapes_ids" #>> '{points}'`)
    q.leftJoinRelated(jointureFormat(name, 'pointsEtape'))
    q.whereRaw(`?? \\?| array[${secteurs.map(secteur => `E'${secteur.replace(/'/g, "\\'")}'`).join(',')}]`, 'facades_points_etapes.secteursMaritime')
  }
}
