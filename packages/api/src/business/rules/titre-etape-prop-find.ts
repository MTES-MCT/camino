import { CaminoDate } from 'camino-common/src/date'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ITitreDemarche, IPropId } from '../../types'

import { propValueFind } from '../utils/prop-value-find'
import { titreDemarchesEtapesRebuild } from '../utils/titre-demarches-etapes-rebuild'

import { titrePropTitreEtapeFind } from './titre-prop-etape-find'
import { titreStatutIdFind } from './titre-statut-id-find'

/**
 * Trouve la propriété d'un titre à une date donnée
 * @param propId - propriété recherchée
 * @param date - date
 * @param titreDemarches - démarches du titre
 * @param titreTypeId - id du type du titre
 * @returns la ou les propriétés recherchées ou null
 */
export const titreEtapePropFind = (propId: IPropId, date: CaminoDate, titreDemarches: ITitreDemarche[], titreTypeId: TitreTypeId) => {
  // reconstruit les démarches et étapes antérieures à la date
  const titreDemarchesFiltered = titreDemarchesEtapesRebuild(date, titreDemarches, titreTypeId)

  // calcule le statut du titre
  const titreStatutId = titreStatutIdFind(date, titreDemarchesFiltered)

  // cherche la première occurrence de la propriété
  // dans une démarche et une étape valides
  const titreEtape = titrePropTitreEtapeFind(date, propId, titreDemarchesFiltered, titreStatutId)

  if (titreEtape) {
    return propValueFind(titreEtape, propId)
  }

  return null
}
