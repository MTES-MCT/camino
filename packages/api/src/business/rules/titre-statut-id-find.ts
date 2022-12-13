import { ITitreDemarche } from '../../types.js'

import { titreDateFinFind } from './titre-date-fin-find.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'

export const titreStatutIdFind = (
  aujourdhui: string,
  demarches: ITitreDemarche[] | null | undefined
) => {
  const titreDemarches = demarches
    ? demarches.filter(d => !d.type!.travaux)
    : null

  if (!titreDemarches || !titreDemarches.length) return 'ind'

  // si toutes les démarches du titre ont le statut `indéfini`
  // -> le titre a également le statut `indéfini`
  if (titreDemarches.every(d => d.statutId === 'ind')) return 'ind'

  // s'il y a une seule démarche (octroi)
  if (
    titreDemarches.length === 1 &&
    ['oct', 'vut', 'vct'].includes(titreDemarches[0].typeId) &&
    ['eco', 'ins', 'dep', 'rej', 'cls', 'des'].includes(
      titreDemarches[0].statutId!
    )
  ) {
    // si le statut de la démarche est en instruction ou déposée
    // -> le statut du titre est demande initiale
    if (['eco', 'ins', 'dep'].includes(titreDemarches[0].statutId!)) {
      return 'dmi'
    }

    // si le statut de la démarche est rejeté ou classé sans suite ou désisté
    // -> le statut du titre est demande classée
    return 'dmc'
  }

  // si une démarche a le statut en instruction
  // -> le statut du titre est modification en instance
  if (titreDemarches.find(d => d.statutId === 'ins')) {
    return 'mod'
  }

  // si la date du jour est inférieure à la date d’échéance
  // -> le statut du titre est valide
  const dateFin = titreDateFinFind(titreDemarches)

  if (dateFin && aujourdhui < dateFin) {
    return 'val'
  }

  if (titreInSurvieProvisoire(titreDemarches)) {
    return 'mod'
  }

  // sinon le statut du titre est échu
  return 'ech'
}

// et qu'une démarche de prolongation est déposée et a été déposée avant l'échéance de l'octroi ou d’une prolongation précédente
// -> le statut du titre est modification en instance (survie provisoire)
export const titreInSurvieProvisoire = (
  demarches: ITitreDemarche[] | null | undefined
): boolean => {
  if (demarches?.length) {
    const octroi = demarches.find(d => d.typeId === DEMARCHES_TYPES_IDS.Octroi)

    if (octroi) {
      const dateFin = titreDateFinFind(
        demarches.filter(({ typeId }) =>
          [
            DEMARCHES_TYPES_IDS.Octroi,
            DEMARCHES_TYPES_IDS.Prolongation1,
            DEMARCHES_TYPES_IDS.Prolongation
          ].includes(typeId)
        )
      )

      if (
        dateFin &&
        demarches.some(d => {
          if (
            ![
              DEMARCHES_TYPES_IDS.Prolongation1,
              DEMARCHES_TYPES_IDS.Prolongation2,
              DEMARCHES_TYPES_IDS.Prolongation
            ].includes(d.typeId)
          ) {
            return false
          }

          if (
            ![
              DemarchesStatutsIds.EnConstruction,
              DemarchesStatutsIds.Depose
            ].includes(d.statutId)
          ) {
            return false
          }

          let demandeProlongation = d.etapes?.find(
            e =>
              e.typeId === ETAPES_TYPES.demande &&
              e.statutId !== ETAPES_STATUTS.EN_CONSTRUCTION
          )
          if (!demandeProlongation) {
            demandeProlongation = d.etapes?.find(
              e => e.typeId === ETAPES_TYPES.depotDeLaDemande
            )
          }

          return demandeProlongation && demandeProlongation.date < dateFin
        })
      ) {
        return true
      }
    }
  }

  return false
}
