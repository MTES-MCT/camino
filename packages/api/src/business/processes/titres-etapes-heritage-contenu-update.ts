/* eslint-disable sql/no-unsafe-query */
import { IContenu, IHeritageContenu, ITitreEtape } from '../../types.js'

import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titreEtapeHeritageContenuFind } from '../utils/titre-etape-heritage-contenu-find.js'
import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort.js'
import { UserNotNull } from 'camino-common/src/roles'
import { getSections, Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { knex } from '../../knex.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { Pool } from 'pg'
import { dbQueryAndValidate } from '../../pg-database.js'
import { getEtapesByDemarche, getEtapesByDemarcheValidator } from './titres-etapes-heritage-contenu-update.queries.js'
import { TitreId } from 'camino-common/src/titres.js'

export const getDemarches = async (pool: Pool, demarcheId?: DemarcheId, titreId?: TitreId) => {
  const etapes = await dbQueryAndValidate(getEtapesByDemarche, {demarcheId, titreId}, pool, getEtapesByDemarcheValidator)
  return etapes.reduce<{
    [key: DemarcheId]: {
      etapes: Pick<Required<ITitreEtape>, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'heritageContenu' | 'titreDemarcheId' | 'communes'>[]
      id: DemarcheId
      typeId: DemarcheTypeId
      titreTypeId: TitreTypeId
      titreId: string
      statutId: DemarcheStatutId
    }
  }>((acc, row) => {
    if (!acc[row.demarche_id]) {
      acc[row.demarche_id] = {
        etapes: [],
        id: row.demarche_id,
        titreId: row.titre_id,
        titreTypeId: row.titre_type_id,
        typeId: row.demarche_type_id,
        statutId: row.demarche_statut_id,
      }
    }

    acc[row.demarche_id].etapes.push({
      id: row.id,
      ordre: row.ordre,
      typeId: row.type_id,
      statutId: row.statut_id,
      date: row.date,
      contenu: row.contenu,
      heritageContenu: row.heritage_contenu,
      titreDemarcheId: row.demarche_id,
      communes: row.communes
    })

    return acc
  }, {})
}
export const titresEtapesHeritageContenuUpdate = async (pool: Pool, user: UserNotNull, demarcheId?: DemarcheId) => {
  console.info()
  console.info('héritage des contenus des étapes…')

  const titresDemarches = await getDemarches(pool, demarcheId)

  // lorsqu'une étape est mise à jour par un utilisateur,
  // l'objet heritageContenu reçu ne contient pas d'id d'étape
  // l'étape est donc toujours mise à jour

  const titresEtapesIdsUpdated = [] as string[]

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (titreDemarche.etapes?.length) {
      const etapeSectionsDictionary = titreDemarche.etapes.reduce<{
        [etapeId: string]: DeepReadonly<Section[]>
      }>((acc, e) => {
        acc[e.id] = getSections(titreDemarche.titreTypeId, titreDemarche.typeId, e.typeId)

        return acc
      }, {})
      const titreEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes?.filter(e => etapeSectionsDictionary[e.id]) ?? [])

      if (titreEtapes) {
        for (let index = 0; index < titreEtapes.length; index++) {
          const titreEtape = titreEtapes[index]
          const titreEtapesFiltered = titreEtapesSortDescByOrdre(titreEtapes.slice(0, index))

          const { contenu, heritageContenu, hasChanged } = titreEtapeHeritageContenuFind(titreEtapesFiltered, titreEtape, etapeSectionsDictionary)

          if (hasChanged) {
            await titreEtapeUpdate(
              titreEtape.id,
              {
                contenu,
                heritageContenu,
              },
              user,
              titreDemarche.titreId
            )

            console.info('titre / démarche / étape : héritage du contenu (mise à jour) ->', titreEtape.id)

            titresEtapesIdsUpdated.push(titreEtape.id)

            titreEtape.contenu = contenu ?? null
            titreEtape.heritageContenu = heritageContenu ?? null
          }
        }
      }
    }
  }

  return titresEtapesIdsUpdated
}
