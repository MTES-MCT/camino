import { titrePhasesFind } from '../rules/titre-phases-find.js'
import { titresGet } from '../../database/queries/titres.js'
import { userSuper } from '../../database/user-super.js'
import { knex }  from '../../knex.js'


export const titresDemarchesDatesUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('phases des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: { etapes: { points: { id: {} } } },
      },
    },
    userSuper
  )

  const demarchePhaseUpdated = []

  for (const titre of titres) {

    // retourne un tableau avec les phases
    // créées à partir des démarches
    const titrePhases = titrePhasesFind(titre.demarches ?? [], titre.typeId)

    for(const demarche of titre.demarches ?? []){

      const oldDateDebut = demarche.demarcheDateDebut ?? null
      const oldDateFin = demarche.demarcheDateFin ?? null

      const newDates = titrePhases[demarche.id]

      const newDateDebut = newDates?.dateDebut ?? null
      const newDateFin = newDates?.dateFin ?? null


      if( newDateDebut !== oldDateDebut || newDateFin !== oldDateFin){
        demarchePhaseUpdated.push(demarche.id)
        await knex.raw(`update titres_demarches where id = '${demarche.id}' set demarche_date_debut = '${newDateDebut}' and demarche_date_fin = '${newDateFin}'`)
        console.info(`maj des dates de la demarche ${demarche.slug} titreId: ${demarche.titreId} dateDebut: ${oldDateDebut} => ${newDateDebut}, dateFin: ${oldDateFin} => ${newDateFin}`)
      }

    }
  }

  return [demarchePhaseUpdated]
}
