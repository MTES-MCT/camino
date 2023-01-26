import { ITitreDemarche, ITitreEtape } from '../../types.js'
import { titreDemarchePhaseCheck } from '../rules/titre-demarche-phase-check.js'
import { titreDemarcheStatutIdFind } from '../rules/titre-demarche-statut-id-find.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'

/**
 * Filtre les étapes antérieures à une date
 * @param titreEtapes - étapes d'une démarche
 * @param date - date
 */
const titreEtapesFilter = (titreEtapes: ITitreEtape[], date: string) =>
  titreEtapes.filter(titreEtape => titreEtape.date <= date)

/**
 * Reconstruit les démarches et étapes antérieures à une date
 * et recalcule le statut des démarches en fonction des étapes
 * @param date - date
 * @param titreDemarches - démarches du titre
 * @param titreTypeId - id du type du titre
 * @returns démarches du titre
 */

export const titreDemarchesEtapesRebuild = (
  date: string,
  titreDemarches: ITitreDemarche[],
  titreTypeId: TitreTypeId
) =>
  titreDemarches.reduce((acc: ITitreDemarche[], td) => {
    if (!td.etapes) return acc

    const titreEtapesFiltered = titreEtapesFilter(td.etapes!, date)

    if (titreEtapesFiltered.length) {
      const titreDemarche = { ...td }

      titreDemarche.etapes = titreEtapesFiltered

      titreDemarche.statutId = titreDemarcheStatutIdFind(
        titreDemarche.typeId,
        titreDemarche.etapes,
        titreTypeId,
        titreDemarche.id
      )

      if (
        !titreDemarchePhaseCheck(
          titreDemarche.typeId,
          titreDemarche.statutId,
          titreTypeId,
          titreDemarche.etapes
        )
      ) {
        delete titreDemarche.phase
      }

      acc.push(titreDemarche)
    }

    return acc
  }, [])
