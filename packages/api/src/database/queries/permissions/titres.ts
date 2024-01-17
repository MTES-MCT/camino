import { QueryBuilder, raw } from 'objection'

import Titres from '../../models/titres.js'
import TitresDemarches from '../../models/titres-demarches.js'
import TitresActivites from '../../models/titres-activites.js'
import Entreprises from '../../models/entreprises.js'

import { titresActivitesQueryModify } from './titres-activites.js'
import { titresDemarchesQueryModify } from './titres-demarches.js'
import { administrationsTitresQuery } from './administrations.js'
import { entreprisesQueryModify, entreprisesTitresQuery } from './entreprises.js'
import TitresEtapes from '../../models/titres-etapes.js'
import { isAdministration, isBureauDEtudes, isEntreprise, isSuper, User } from 'camino-common/src/roles.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'

export const titresVisibleByEntrepriseQuery = (q: QueryBuilder<Titres, Titres | Titres[]>, entreprisesIds: string[]) => {
  q.where('titres.entreprisesLecture', true)

  // titres dont il est titulaire ou amodiataire
  q.whereExists(
    entreprisesTitresQuery(entreprisesIds, 'titres', {
      isTitulaire: true,
      isAmodiataire: true,
    })
  )
}

export const titresArmEnDemandeQuery = (q: QueryBuilder<Titres, Titres | Titres[]>) => {
  // Le titre doit être une ARM en demande initiale avec une « Recevabilité de la demande » favorable
  q.where('titres.typeId', 'arm')
  q.where('titres.titreStatutId', 'dmi')
  q.whereExists(
    TitresEtapes.query()
      .alias('teRCP')
      .select(raw('true'))
      .leftJoin('titresDemarches as tdRCP', b => {
        b.on('tdRCP.id', 'teRCP.titreDemarcheId')
        b.on('tdRCP.titreId', 'titres.id')
      })
      .where('tdRcp.typeId', 'oct')
      .where('tdRcp.statutId', 'ins')
      .where('teRcp.typeId', 'mcr')
      .where('teRcp.statutId', 'fav')
      .first()
  )
}

export const titresConfidentielSelect = (q: QueryBuilder<Titres, Titres | Titres[]>, entreprisesIds: string[]) =>
  // ajoute la colonne « confidentiel » si la demande n’est normalement pas visible par l’entreprise mais l’est car
  // c’est une demande en cours
  q.select(
    Titres.query()
      .alias('t_confidentiel')
      .select(raw('true'))
      .whereRaw('t_confidentiel.id = titres.id')
      .whereNot('titres.publicLecture', true)
      .whereNot(a => a.modify(titresVisibleByEntrepriseQuery, entreprisesIds))
      .where(a => a.modify(titresArmEnDemandeQuery))
      .as('confidentiel')
  )

const titresQueryModify = (q: QueryBuilder<Titres, Titres | Titres[]>, user: User, demandeEnCours?: boolean | null) => {
  q.select('titres.*').where('titres.archive', false)

  // si
  // - l'utilisateur n'est pas connecté
  // - ou l'utilisateur n'est pas super
  // alors il ne voit que les titres publics et ceux auxquels son entité est reliée

  if (!isSuper(user)) {
    q.where(b => {
      b.where('titres.publicLecture', true)

      // si l'utilisateur est `entreprise`
      if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises?.length) {
        const entreprisesIds = user.entreprises.map(e => e.id)

        b.orWhere(c => {
          c.where(d => d.modify(titresVisibleByEntrepriseQuery, entreprisesIds))

          // ou si le titre est une ARM en cours de demande
          if (isNotNullNorUndefined(demandeEnCours) && demandeEnCours) {
            c.orWhere(d => d.modify(titresArmEnDemandeQuery))
          }
        })
      }

      // si l'utilisateur est `administration`
      else if (isAdministration(user)) {
        // titres dont l'administration de l'utilisateur est
        // - administrationsGestionnaire
        // - ou administrationsLocale
        // - ou administration associée

        b.orWhereExists(
          administrationsTitresQuery(user.administrationId, 'titres', {
            isGestionnaire: true,
            isAssociee: true,
            isLocale: true,
          })
        )
      }
    })
  }

  if ((isEntreprise(user) || isBureauDEtudes(user)) && isNotNullNorUndefinedNorEmpty(user.entreprises)) {
    if (isNotNullNorUndefined(demandeEnCours) && demandeEnCours) {
      q.modify(
        titresConfidentielSelect,
        user.entreprises.map(e => e.id)
      )
    }
  }

  // visibilité des étapes
  q.modifyGraph('demarches', b => {
    titresDemarchesQueryModify(b as QueryBuilder<TitresDemarches, TitresDemarches | TitresDemarches[]>, user)
  })

  // visibilité des activités
  q.modifyGraph('activites', b => {
    titresActivitesQueryModify(b as QueryBuilder<TitresActivites, TitresActivites | TitresActivites[]>, user)
  })

  q.modifyGraph('titulaires', b => {
    entreprisesQueryModify(b as QueryBuilder<Entreprises, Entreprises | Entreprises[]>, user).select('titresTitulaires.operateur')
  })

  q.modifyGraph('amodiataires', b => {
    entreprisesQueryModify(b as QueryBuilder<Entreprises, Entreprises | Entreprises[]>, user).select('titresAmodiataires.operateur')
  })

  // visibilité du doublonTitre
  q.modifyGraph('doublonTitre', b => {
    titresQueryModify(b as QueryBuilder<Titres, Titres | Titres[]>, user)
  })

  return q
}

export { titresQueryModify }
