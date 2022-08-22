import { QueryBuilder } from 'objection'

import { stringSplit } from './_utils'

import Titres from '../models/titres'
import TitresDemarches from '../models/titres-demarches'
import TitresActivites from '../models/titres-activites'
import {
  DepartementId,
  departements
} from 'camino-common/src/static/departement'
import { regions } from 'camino-common/src/static/region'

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
    q.whereIn('titres.id', ids)
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

    q.whereIn(`${name}.domaineId`, domainesIds)
  }

  if (typesIds) {
    q.leftJoinRelated(jointureFormat(name, 'type'))

    q.whereIn(fieldFormat(name, 'type.typeId'), typesIds)
  }

  if (statutsIds) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.whereIn(`${name}.statutId`, statutsIds)
  }

  if (substancesIds?.length) {
    if (name === 'titre') {
      q.leftJoinRelated('titre')
    }

    q.leftJoinRelated(jointureFormat(name, 'substancesEtape'))

    q.whereRaw('?? @> ?', [
      fieldFormat(name, 'substancesEtape.substances'),
      JSON.stringify(substancesIds)
    ])
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

    const nomsArray = stringSplit(noms)

    q.where(b => {
      b.whereRaw(`?? ~* ?`, [
        `${name}.nom`,
        nomsArray.map(n => `(?=.*?(${n}))`).join('')
      ]).orWhereRaw(`?? ~* ?`, [
        `${name}.slug`,
        nomsArray.map(n => `(?=.*?(${n}))`).join('')
      ])
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
    const referencesArray = stringSplit(references)

    let fields = ['references.nom', 'references:type.nom']

    if (name === 'titre') {
      fields = fields.map(field => fieldFormat(name, field))
    }

    q.leftJoinRelated(jointureFormat(name, 'references.type'))
      .where(b => {
        referencesArray.forEach(s => {
          fields.forEach(f => {
            b.orWhereRaw(`lower(??) like ?`, [f, `%${s.toLowerCase()}%`])
          })
        })
      })
      .groupBy(`${root}.id`)
      .havingRaw(
        `(${referencesArray
          .map(
            () =>
              'count(*) filter (where ' +
              fields.map(() => 'lower(??) like ?').join(' or ') +
              ') > 0'
          )
          .join(') and (')})`,
        referencesArray.flatMap(r =>
          fields.flatMap(f => [f, `%${r.toLowerCase()}%`])
        )
      )
  }

  if (territoires) {
    const territoiresArray = stringSplit(territoires)

    const departementIds: DepartementId[] = territoiresArray.flatMap(
      territoire => {
        const resultRegion = regions
          .filter(({ nom }) =>
            nom.toLowerCase().includes(territoire.toLowerCase())
          )
          .flatMap(({ id }) =>
            departements
              .filter(({ regionId }) => id === regionId)
              .map(({ id }) => id)
          )

        const resultDepartement = departements
          .filter(
            ({ nom, id }) =>
              nom.toLowerCase().includes(territoire.toLowerCase()) ||
              id === territoire
          )
          .map(({ id }) => id)

        return resultRegion.concat(resultDepartement)
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
