import { DemarcheId, IContenu, ITitreEtape, IUtilisateur } from '../../types.js'

import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titreEtapesSortAscByDate } from '../utils/titre-etapes-sort.js'
import { knex } from '../../knex.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { CaminoDate } from 'camino-common/src/date.js'

export const titresEtapesOrdreUpdate = async (
  user: IUtilisateur,
  _titresDemarchesIds?: string[]
) => {
  console.info()
  console.info('ordre des étapes…')

  //FIXME ajouter condition sur titresDemarchesIds

  const etapes: {rows: {
    titre_id: string
    titre_type_id: TitreTypeId
    id: string
    ordre: number
    type_id: EtapeTypeId
    statut_id: EtapeStatutId
    date: CaminoDate
    contenu: IContenu
    demarche_id: DemarcheId
    demarche_type_id: DemarcheTypeId
  }[]} = await knex.raw(`SELECT titre.id as titre_id, titre.type_id as titre_type_id, etape.id, etape.ordre, etape.type_id, etape.statut_id, etape.date, etape.contenu, demarche.id as demarche_id, demarche.type_id as demarche_type_id
  from titres_etapes etape
      join titres_demarches demarche on etape.titre_demarche_id = demarche.id
      join titres titre on demarche.titre_id = titre.id
  order by demarche.id, etape.ordre`)

  const titresEtapesIdsUpdated: string[] = []

  const titresDemarches =  etapes.rows.reduce<{[key: DemarcheId]: {etapes: Pick<ITitreEtape, "id" | "ordre" | "typeId" | "statutId" | "date" | "contenu" | "titreDemarcheId">[], id: DemarcheId, typeId: DemarcheTypeId, titreTypeId: TitreTypeId, titreId: string}}>((acc, row) => {


    if( !acc[row.demarche_id]){
      acc[row.demarche_id] = { etapes: [], id: row.demarche_id, titreId: row.titre_id, titreTypeId: row.titre_type_id, typeId: row.demarche_type_id}
    }

    acc[row.demarche_id].etapes.push({id: row.id, ordre: row.ordre, typeId: row.type_id, statutId: row.statut_id, date: row.date, contenu: row.contenu, titreDemarcheId: row.demarche_id})

    return acc
  }, {})

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (titreDemarche.etapes) {

      const etapes = titreEtapesSortAscByDate(
        titreDemarche.etapes,
        titreDemarche.id,
        titreDemarche.typeId,
        titreDemarche.titreTypeId
      )
      for (let index = 0; index < etapes.length; index++) {
        const titreEtape = etapes[index]
        if (titreEtape.ordre !== index + 1) {
          await titreEtapeUpdate(
            titreEtape.id,
            { ordre: index + 1 },
            user,
            titreDemarche.titreId
          )

          console.info(
            'titre / démarche / étape : ordre (mise à jour) ->',
            `${titreEtape.id} : ${index + 1}`
          )

          titresEtapesIdsUpdated.push(titreEtape.id)
        }
      }
    }
  }

  return titresEtapesIdsUpdated
}
