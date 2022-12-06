import { QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types.js'

import { knex } from '../../../knex.js'

import Entreprises from '../../models/entreprises.js'
import Utilisateurs from '../../models/utilisateurs.js'
import Titres from '../../models/titres.js'
import Documents from '../../models/documents.js'

import { titresQueryModify } from './titres.js'
import { utilisateursQueryModify } from './utilisateurs.js'
import { documentsQueryModify } from './documents.js'

const entreprisesQueryModify = (
  q: QueryBuilder<Entreprises, Entreprises | Entreprises[]>,
  user: IUtilisateur | null | undefined
) => {
  q.select('entreprises.*')

  q.modifyGraph('titulaireTitres', a =>
    titresQueryModify(a as QueryBuilder<Titres, Titres | Titres[]>, user)
      // on group by entrepriseId au cas où il y a une aggrégation
      // dans la requête de titre (ex : calc activités)
      .groupBy('titres.id', 'titresTitulaires.entrepriseId')
  )

  q.modifyGraph('amodiataireTitres', a =>
    titresQueryModify(a as QueryBuilder<Titres, Titres | Titres[]>, user)
      // on group by entrepriseId au cas où il y a une aggrégation
      // dans la requête de titre (ex : calc activités)
      .groupBy('titres.id', 'titresAmodiataires.entrepriseId')
  )

  q.modifyGraph('utilisateurs', b => {
    utilisateursQueryModify(
      b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
      user
    )
  })

  q.modifyGraph('documents', b => {
    documentsQueryModify(
      b as QueryBuilder<Documents, Documents | Documents[]>,
      user
    )
  })

  return q
}

const entreprisesTitresQuery = (
  entreprisesIds: string[],
  titreAlias: string,
  {
    isTitulaire,
    isAmodiataire
  }: { isTitulaire?: boolean; isAmodiataire?: boolean } = {}
) => {
  const q = Entreprises.query().whereIn('entreprises.id', entreprisesIds)

  if (isTitulaire) {
    q.modify(entreprisesTitulairesModify, entreprisesIds, titreAlias)
  }

  if (isAmodiataire) {
    q.modify(entreprisesAmodiatairesModify, entreprisesIds, titreAlias)
  }

  q.where(c => {
    if (isTitulaire) {
      c.orWhereNotNull('t_t.entrepriseId')
    }

    if (isAmodiataire) {
      c.orWhereNotNull('t_a.entrepriseId')
    }
  })

  return q
}

const entreprisesTitulairesModify = (
  q: QueryBuilder<Entreprises, Entreprises | Entreprises[]>,
  entreprisesIds: string[],
  titreAlias: string
) => {
  q.leftJoin('titresTitulaires as t_t', b => {
    b.on(
      knex.raw('?? ->> ? = ??', [
        `${titreAlias}.propsTitreEtapesIds`,
        'titulaires',
        't_t.titreEtapeId'
      ])
    ).onIn('t_t.entrepriseId', entreprisesIds)
  })
}

const entreprisesAmodiatairesModify = (
  q: QueryBuilder<Entreprises, Entreprises | Entreprises[]>,
  entreprisesIds: string[],
  titreAlias: string
) => {
  q.leftJoin('titresAmodiataires as t_a', b => {
    b.on(
      knex.raw('?? ->> ? = ??', [
        `${titreAlias}.propsTitreEtapesIds`,
        'amodiataires',
        't_a.titreEtapeId'
      ])
    ).onIn('t_a.entrepriseId', entreprisesIds)
  })
}

export { entreprisesQueryModify, entreprisesTitresQuery }
