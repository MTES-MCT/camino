import { ITitreActivite, ITitreDemarche } from '../../types'

import { titreEtapePropFind } from './titre-etape-prop-find'
import { titreActiviteValideCheck } from '../utils/titre-activite-valide-check'
import { SubstanceFiscale, substancesFiscalesBySubstanceLegale } from 'camino-common/src/static/substancesFiscales'
import { Unites } from 'camino-common/src/static/unites'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { FrequenceId, Frequences, getNumberOfMonths } from 'camino-common/src/static/frequence'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { CaminoAnnee, CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ActiviteSection, ActiviteSectionElement, ActivitesTypes, ActivitesTypesId, isSubstancesFiscales } from 'camino-common/src/static/activitesTypes'
import { TitreId } from 'camino-common/src/validators/titres'

const substancesFiscalesFind = (substances: (SubstanceLegaleId | undefined)[]): SubstanceFiscale[] =>
  substances.filter(s => !!s).flatMap(substanceId => substancesFiscalesBySubstanceLegale(substanceId))

const titreActiviteSectionElementsFormat = (elements: ActiviteSectionElement[], periodeId: number, date: CaminoDate) =>
  elements.filter(
    e =>
      // ne conserve que les éléments dont
      // - la période,
      // - la date de début et la date de fin
      // correspondent à l'élément
      (!e.periodeId || e.periodeId === periodeId) && (!e.dateFin || e.dateFin >= date) && (!e.dateDebut || e.dateDebut < date)
  )

/**
 * Construit les sections d'une activité en fonction de son type
 * @param activiteTypeId - id du type d'activité
 * @param sections - modèle de sections
 * @param periodeId - id de la fréquence de la période (ex: 1 pour le premier trimestre)
 * @param date - date de l'activité
 * @param titreDemarches - démarches du titre
 * @param titreTypeId - le type id du titre
 */
const titreActiviteSectionsBuild = (activiteTypeId: string, sections: ActiviteSection[], periodeId: number, date: CaminoDate, titreDemarches: ITitreDemarche[], titreTypeId: TitreTypeId) => {
  return sections.reduce<ActiviteSection[]>((newSections: ActiviteSection[], s) => {
    let elements: ActiviteSectionElement[] = []

    if (!isSubstancesFiscales(s) && isNotNullNorUndefinedNorEmpty(s.elements)) {
      elements = titreActiviteSectionElementsFormat(s.elements, periodeId, date)
    } else if (['gra', 'grx'].includes(activiteTypeId) && isSubstancesFiscales(s)) {
      const substances = titreEtapePropFind('substances', toCaminoDate(date), titreDemarches, titreTypeId) as SubstanceLegaleId[] | null

      if (isNotNullNorUndefinedNorEmpty(substances)) {
        const substancesFiscales = substancesFiscalesFind(substances)

        elements = substancesFiscales.map(sf => {
          const unite = Unites[sf.uniteId]
          const element: ActiviteSectionElement = {
            id: sf.id,
            nom: `${sf.nom}`,
            type: 'number',
            description: `<b>${unite.symbole} (${unite.nom})</b> ${sf.description}`,
            uniteId: sf.uniteId,
            optionnel: false,
          }

          return element
        })
      }
    }

    if (elements.length) {
      const section = {
        id: s.id,
        elements,
        nom: s.nom,
      }

      return [...newSections, section]
    }

    return newSections
  }, [])
}

const titreActiviteFind = (activiteTypeId: ActivitesTypesId, annee: CaminoAnnee, periodeId: number, titreActivites?: ITitreActivite[] | null): boolean =>
  titreActivites?.some(a => a.typeId === activiteTypeId && a.annee === parseInt(annee, 10) && a.periodeId === periodeId) ?? false

/**
 * Construit une activité (si elle n'existe pas déjà)
 * @param typeId - id du type d'activité
 * @param periodeId - id de la période (exemple: 2 pour le 2ème trimestre)
 * @param activiteTypeSections - sections du type d'activité
 * @param annee - année
 * @param frequenceId - fréquence de l'activité
 * @param aujourdhui - date du jour au format yyyy-mm-jj
 * @param titreId - id du titre
 * @param titreDemarches - démarches du titre
 * @param titreTypeId - id du type de titre
 * @param titreActivites - activités existantes du titres
 */

const titreActiviteBuild = (
  typeId: ActivitesTypesId,
  periodeId: number,
  activiteTypeSections: ActiviteSection[],
  annee: CaminoAnnee,
  frequenceId: FrequenceId,
  aujourdhui: CaminoDate,
  titreId: TitreId,
  titreDemarches: ITitreDemarche[],
  titreTypeId: TitreTypeId,
  titreActivites?: ITitreActivite[] | null
) => {
  // si l'activité existe déjà
  // ne la créée pas
  if (titreActiviteFind(typeId, annee, periodeId, titreActivites)) return null

  // la date de fin de l'activité est le premier jour du mois
  // du début de la période suivante, en fonction de la fréquence
  const date = toCaminoDate(new Date(parseInt(annee), periodeId * getNumberOfMonths(frequenceId), 1))

  const titreActiviteIsValide = titreActiviteValideCheck(date, aujourdhui, periodeId, annee, getNumberOfMonths(frequenceId), titreDemarches)

  if (!titreActiviteIsValide) return null

  const sections = titreActiviteSectionsBuild(typeId, activiteTypeSections, periodeId, date, titreDemarches, titreTypeId)

  if (!sections.length) return null

  return {
    titreId,
    date,
    typeId,
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    periodeId,
    annee: parseInt(annee, 10),
    sections,
  } as ITitreActivite
}

/**
 * Construit les activités à ajouter sur un titre
 * @param activiteTypeId - type d'activité
 * @param annees - années pour lesquelles des activités sont à créer
 * @param aujourdhui - date du jour au format yyyy-mm-dd
 * @param titreId - id du titre
 * @param titreTypeId - id du type de titre
 * @param titreDemarches - demarches du titre
 * @param titreActivites - activités du titre
 * @returns une liste d'activités
 */

export const titreActivitesBuild = (
  activiteTypeId: ActivitesTypesId,
  annees: CaminoAnnee[],
  aujourdhui: CaminoDate,
  titreId: TitreId,
  titreTypeId: TitreTypeId,
  titreDemarches?: ITitreDemarche[] | null,
  titreActivites?: ITitreActivite[] | null
): ITitreActivite[] => {
  // si le titre n'a pas de phases de démarches
  // aucune activité ne peut être créées
  if ((titreDemarches ?? []).every(d => isNullOrUndefined(d.demarcheDateDebut))) return []

  const activiteType = ActivitesTypes[activiteTypeId]

  const periodes = Frequences[activiteType.frequenceId].values

  return annees.reduce(
    (titreActivitesNew: ITitreActivite[], annee) =>
      periodes.reduce((acc: ITitreActivite[], _, i) => {
        const activiteSections = activiteType.sections

        const titreActivite = titreActiviteBuild(activiteType.id, i + 1, activiteSections, annee, activiteType.frequenceId, aujourdhui, titreId, titreDemarches ?? [], titreTypeId, titreActivites)

        if (titreActivite) {
          acc.push(titreActivite)
        }

        return acc
      }, titreActivitesNew),
    []
  )
}
