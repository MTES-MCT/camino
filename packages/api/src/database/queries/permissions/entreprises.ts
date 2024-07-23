import { QueryBuilder } from 'objection'

import { knex } from '../../../knex'

import Entreprises from '../../models/entreprises'
import Utilisateurs from '../../models/utilisateurs'

import { utilisateursQueryModify } from './utilisateurs'
import { User } from 'camino-common/src/roles'
import TitresEtapes from '../../models/titres-etapes'
import { DeepReadonly } from 'camino-common/src/typescript-tools'


export const entreprisesQueryModify = (q: QueryBuilder<Entreprises, Entreprises | Entreprises[]>, user: DeepReadonly<User>): QueryBuilder<Entreprises, Entreprises | Entreprises[]> => {
  q.select('entreprises.*')

  q.modifyGraph('utilisateurs', b => {
    utilisateursQueryModify(b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>, user)
  })

  return q
}

export const entreprisesTitresQuery = (entreprisesIds: string[], titreAlias: string): QueryBuilder<TitresEtapes, TitresEtapes[]> => {
  // Nous sommes obligés d’utiliser l’opérateur intersect, car on ne peut pas utiliser l’opérateur |? avec knex à cause du ? qui n’est pas escape
  const titulairesQuery = TitresEtapes.query()
    .alias('te_titulaires')
    .select(knex.raw('jsonb_array_elements(??)', ['te_titulaires.titulaireIds']))
    .whereRaw('?? ->> ? = ??', [`${titreAlias}.propsTitreEtapesIds`, 'titulaires', 'te_titulaires.id'])
    .intersect(knex.raw('select jsonb_array_elements(?)', [JSON.stringify(entreprisesIds)]) as unknown as any)

  const amodiatairesQuery = TitresEtapes.query()
    .alias('te_amodiataires')
    .select(knex.raw('jsonb_array_elements(??)', ['te_amodiataires.amodiataireIds']))
    .whereRaw('?? ->> ? = ??', [`${titreAlias}.propsTitreEtapesIds`, 'amodiataires', 'te_amodiataires.id'])
    .intersect(knex.raw('select jsonb_array_elements(?)', [JSON.stringify(entreprisesIds)]) as unknown as any)

  return titulairesQuery.union(amodiatairesQuery)
}
