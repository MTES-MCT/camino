import { QueryBuilder, Model } from 'objection'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'

export const administrationsTitresQuery = <M extends Model>(
  q: QueryBuilder<M, M | M[]>,
  administrationId: AdministrationId,
  titreAlias: string,
  whereOperator: 'and' | `or`,
  etapePointAlias: string
) => {
  const query = (c: QueryBuilder<M, M | M[]>) => {
    const titreTypeIds: TitreTypeId[] = getTitreTypeIdsByAdministration(administrationId)
      .filter(att => {
        if (att.gestionnaire) {
          return true
        }
        if (att.associee) {
          return true
        }

        return false
      })
      .map(({ titreTypeId }) => titreTypeId)

    if (titreTypeIds.length) {
      c.orWhereRaw(`?? in (${titreTypeIds.map(t => `'${t}'`).join(',')})`, [`${titreAlias}.typeId`])
    } else {
      c.orWhereRaw('false')
    }

    c.orWhereNotNull(`${etapePointAlias}.administrations_locales`)
  }

  if (whereOperator === 'and') {
    q.andWhere(query)
  } else {
    q.orWhere(query)
  }

  return q
}
