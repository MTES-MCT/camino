import {
  DemarcheId,
  IContenu,
  IHeritageContenu,
  ITitreEtape,
  IUtilisateur
} from '../../types.js'

import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titreEtapeHeritageContenuFind } from '../utils/titre-etape-heritage-contenu-find.js'
import {
  titreEtapesSortAscByOrdre,
  titreEtapesSortDescByOrdre
} from '../utils/titre-etapes-sort.js'
import {
  getSections,
  Section
} from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { knex } from '../../knex.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'

export const getDemarches = async (
  demarcheId?: DemarcheId,
  titreId?: string
) => {
  const etapes: {
    rows: {
      titre_id: string
      titre_type_id: TitreTypeId
      id: string
      ordre: number
      type_id: EtapeTypeId
      statut_id: EtapeStatutId
      date: CaminoDate
      contenu: IContenu
      heritage_contenu: IHeritageContenu
      demarche_id: DemarcheId
      demarche_type_id: DemarcheTypeId
      demarche_statut_id: DemarcheStatutId
    }[]
  } =
    await knex.raw(`SELECT titre.id as titre_id, titre.type_id as titre_type_id, etape.id, etape.ordre, etape.type_id, etape.statut_id, etape.date, etape.contenu, etape.heritage_contenu, demarche.id as demarche_id, demarche.type_id as demarche_type_id, demarche.statut_id as demarche_statut_id
  from titres_etapes etape
      join titres_demarches demarche on etape.titre_demarche_id = demarche.id
      join titres titre on demarche.titre_id = titre.id
      where etape.archive = false
      and demarche.archive = false
      and titre.archive = false
      ${demarcheId ? `and demarche.id = '${demarcheId}'` : ''}
      ${titreId ? `and titre.id = '${titreId}'` : ''}

  order by demarche.id, etape.ordre`)

  return etapes.rows.reduce<{
    [key: DemarcheId]: {
      etapes: Pick<
        ITitreEtape,
        | 'id'
        | 'ordre'
        | 'typeId'
        | 'statutId'
        | 'date'
        | 'contenu'
        | 'heritageContenu'
        | 'titreDemarcheId'
      >[]
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
        statutId: row.demarche_statut_id
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
      titreDemarcheId: row.demarche_id
    })

    return acc
  }, {})
}
export const titresEtapesHeritageContenuUpdate = async (
  user: IUtilisateur,
  demarcheId?: DemarcheId
) => {
  console.info()
  console.info('héritage des contenus des étapes…')

  const titresDemarches = await getDemarches(demarcheId)

  // lorsqu'une étape est mise à jour par un utilisateur,
  // l'objet heritageContenu reçu ne contient pas d'id d'étape
  // l'étape est donc toujours mise à jour

  const titresEtapesIdsUpdated = [] as string[]

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (titreDemarche.etapes?.length) {
      const etapeSectionsDictionary = titreDemarche.etapes.reduce<{
        [etapeId: string]: DeepReadonly<Section>[]
      }>((acc, e) => {
        acc[e.id] = getSections(
          titreDemarche.titreTypeId,
          titreDemarche.typeId,
          e.typeId
        )

        return acc
      }, {})
      const titreEtapes = titreEtapesSortAscByOrdre(
        titreDemarche.etapes?.filter(e => etapeSectionsDictionary[e.id]) ?? []
      )

      if (titreEtapes) {
        for (let index = 0; index < titreEtapes.length; index++) {
          const titreEtape = titreEtapes[index]
          const titreEtapesFiltered = titreEtapesSortDescByOrdre(
            titreEtapes.slice(0, index)
          )

          const { contenu, heritageContenu, hasChanged } =
            titreEtapeHeritageContenuFind(
              titreEtapesFiltered,
              titreEtape,
              etapeSectionsDictionary
            )

          if (hasChanged) {
            await titreEtapeUpdate(
              titreEtape.id,
              {
                contenu,
                heritageContenu
              },
              user,
              titreDemarche.titreId
            )

            console.info(
              'titre / démarche / étape : héritage du contenu (mise à jour) ->',
              titreEtape.id
            )

            titresEtapesIdsUpdated.push(titreEtape.id)

            titreEtape.contenu = contenu
            titreEtape.heritageContenu = heritageContenu
          }
        }
      }
    }
  }

  return titresEtapesIdsUpdated
}
