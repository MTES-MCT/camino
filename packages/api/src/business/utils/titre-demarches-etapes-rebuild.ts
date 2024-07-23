import { ITitreDemarche, ITitreEtape } from '../../types'
import { titreDemarcheStatutIdFind } from '../rules/titre-demarche-statut-id-find'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { titrePhasesFind } from '../rules/titre-phases-find'
import { CaminoDate } from 'camino-common/src/date'
import { titreEtapeForMachineValidator } from '../rules-demarches/machine-common'

/**
 * Filtre les étapes antérieures à une date
 * @param titreEtapes - étapes d'une démarche
 * @param date - date
 */
const titreEtapesFilter = (titreEtapes: ITitreEtape[], date: string) => titreEtapes.filter(titreEtape => titreEtape.date <= date)

/**
 * Reconstruit les démarches et étapes antérieures à une date
 * et recalcule le statut des démarches en fonction des étapes
 * @param date - date
 * @param titreDemarches - démarches du titre
 * @param titreTypeId - id du type du titre
 * @returns démarches du titre
 */

export const titreDemarchesEtapesRebuild = (date: CaminoDate, titreDemarches: ITitreDemarche[], titreTypeId: TitreTypeId) => {
  const titreDemarchesRebuilt = titreDemarches.reduce((acc: ITitreDemarche[], td) => {
    if (!td.etapes) return acc

    const titreEtapesFiltered = titreEtapesFilter(td.etapes!, date)

    if (titreEtapesFiltered.length) {
      const titreDemarche = { ...td }

      titreDemarche.etapes = titreEtapesFiltered

      const etapes = titreDemarche.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))
      titreDemarche.statutId = titreDemarcheStatutIdFind(titreDemarche.typeId, etapes, titreTypeId, titreDemarche.id)

      acc.push(titreDemarche)
    }

    return acc
  }, [])

  const phases = titrePhasesFind(titreDemarchesRebuilt, titreTypeId)

  return titreDemarchesRebuilt.map(demarche => {
    const phase = phases[demarche.id]
    if (!phase) {
      delete demarche.demarcheDateDebut
      delete demarche.demarcheDateFin
    } else {
      demarche.demarcheDateDebut = phase.dateDebut
      demarche.demarcheDateFin = phase.dateFin
    }

    return demarche
  })
}
