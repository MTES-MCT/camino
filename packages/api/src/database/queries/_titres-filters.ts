import { QueryBuilder, raw } from 'objection'

import { stringSplit } from './_utils.js'

import Titres from '../models/titres.js'
import TitresDemarches from '../models/titres-demarches.js'
import TitresActivites from '../models/titres-activites.js'
import {
  DepartementId,
  departements
} from 'camino-common/src/static/departement.js'
import { regions } from 'camino-common/src/static/region.js'
import { isPaysId } from 'camino-common/src/static/pays.js'

type ITitreTableName = 'titres' | 'titre'
type ITitreRootName = 'titres' | 'titresDemarches' | 'titresActivites'

const jointureFormat = (name: string, jointure: string) =>
  name === 'titre' ? `titre.${jointure}` : jointure

const fieldFormat = (name: string, field: string) =>
  name === 'titre' ? `titre:${field}` : field

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
    entreprises,
    references,
    territoires
  }: {
    ids?: string[] | null
    perimetre?: number[] | null
    domainesIds?: string[] | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    substancesIds?: string[] | null
    entreprisesIds?: string[] | null
    noms?: string | null
    entreprises?: string | null
    references?: string | null
    territoires?: string | null
  } = {},
  q:
    | QueryBuilder<Titres, Titres[]>
    | QueryBuilder<TitresDemarches, TitresDemarches[]>
    | QueryBuilder<TitresActivites, TitresActivites[]>,
  name: ITitreTableName = 'titres',
  root: ITitreRootName = 'titres'
) => {
  if (ids) {
    q.whereIn(`${name}.id`, ids)
  }

  if (perimetre?.length === 4) {
    q.leftJoinRelated(jointureFormat(name, 'points'))
    q.whereRaw(
      `('(' || ? || ',' || ? || '),(' || ? || ',' || ? || ')')::box @> ?? `,
      [...perimetre, 'points.coordonnees']
    )
    q.groupBy('titres.id')
  }

  if (domainesIds) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.whereRaw(
      `SUBSTRING( ${name}.type_id, 3, 1 ) in (${domainesIds
        .map(() => '?')
        .join(',')})`,
      domainesIds
    )
  }

  if (typesIds) {
    q.whereRaw(
      `SUBSTRING( ${name}.type_id, 1, 2 ) in (${typesIds
        .map(() => '?')
        .join(',')})`,
      typesIds
    )
  }

  if (statutsIds) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.whereIn(`${name}.titreStatutId`, statutsIds)
  }

  if (substancesIds?.length) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.leftJoinRelated(jointureFormat(name, 'substancesEtape'))

    q.where(b => {
      substancesIds.forEach(s => {
        b.orWhereRaw(`?? @> '["${s}"]'::jsonb`, [
          fieldFormat(name, 'substancesEtape.substances')
        ])
      })
    })
  }

  if (entreprisesIds?.length) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }
    q.leftJoinRelated(jointureFormat(name, '[titulaires, amodiataires]'))

    q.where(b => {
      b.whereIn(fieldFormat(name, 'titulaires.id'), entreprisesIds)
      b.orWhereIn(fieldFormat(name, 'amodiataires.id'), entreprisesIds)
    })
  }

  if (noms) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.where(b => {
      b.whereRaw(`LOWER(??) LIKE LOWER(?)`, [
        `${name}.nom`,
        `%${noms}%`
      ]).orWhereRaw(`LOWER(??) LIKE LOWER(?)`, [`${name}.slug`, `%${noms}%`])
    })
  }

  if (entreprises) {
    const entreprisesArray = stringSplit(entreprises)

    let fields = [
      'titulaires:etablissements.nom',
      'titulaires.nom',
      'titulaires.id',
      'amodiataires:etablissements.nom',
      'amodiataires.nom',
      'amodiataires.id'
    ]

    if (name === 'titre') {
      fields = fields.map(field => fieldFormat(name, field))
    }

    q.leftJoinRelated(
      jointureFormat(
        name,
        '[titulaires.etablissements, amodiataires.etablissements]'
      )
    )
      .where(b => {
        entreprisesArray.forEach(s => {
          fields.forEach(f => {
            b.orWhereRaw(`lower(??) like ?`, [f, `%${s.toLowerCase()}%`])
          })
        })
      })
      .groupBy(`${root}.id`)
      .havingRaw(
        `(${entreprisesArray
          .map(
            () =>
              'count(*) filter (where ' +
              fields.map(() => 'lower(??) like ?').join(' or ') +
              ') > 0'
          )
          .join(') and (')})`,
        entreprisesArray.flatMap(e =>
          fields.flatMap(f => [f, `%${e.toLowerCase()}%`])
        )
      )
  }

  if (references) {
    const referencesArray = stringSplit(references).map(s => s.toLowerCase())

    let field: string
    if (root === 'titres') {
      field = 'titres.references'
    } else {
      field = 'titre.references'
    }

    q.crossJoin(raw(`jsonb_array_elements(${field}) as titreRefs`))
    q.where(b => {
      referencesArray.forEach(s => {
        b.orWhereRaw("lower(titreRefs->>'nom') like ?", [`%${s}%`])
      })
    })
    q.groupBy(`${root}.id`)
  }

  if (territoires) {
    const territoiresArray = stringSplit(territoires)

    const departementIds: DepartementId[] = territoiresArray.flatMap(
      territoire => {
        const result: DepartementId[] = []
        if (isPaysId(territoire)) {
          result.push(
            ...regions
              .filter(({ paysId }) => paysId === territoire)
              .flatMap(({ id }) =>
                departements
                  .filter(({ regionId }) => id === regionId)
                  .map(({ id }) => id)
              )
          )
        } else {
          result.push(
            ...regions
              .filter(({ nom }) =>
                nom.toLowerCase().includes(territoire.toLowerCase())
              )
              .flatMap(({ id }) =>
                departements
                  .filter(({ regionId }) => id === regionId)
                  .map(({ id }) => id)
              )
          )

          result.push(
            ...departements
              .filter(
                ({ nom, id }) =>
                  nom.toLowerCase().includes(territoire.toLowerCase()) ||
                  id === territoire
              )
              .map(({ id }) => id)
          )
        }

        return result
      }
    )

    q.leftJoinRelated(jointureFormat(name, 'communes'))
      .where(b => {
        territoiresArray.forEach(t => {
          b.orWhereRaw(`lower(??) like ?`, [
            fieldFormat(name, 'communes.nom'),
            `%${t.toLowerCase()}%`
          ])
          b.orWhereRaw(`?? = ?`, [fieldFormat(name, 'communes.id'), t])
        })
        b.orWhereIn(fieldFormat(name, 'communes.departementId'), departementIds)
      })
      .groupBy(`${root}.id`)
  }
}
