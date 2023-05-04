import { ITitreActivite, ITitreDemarche } from '../../types.js'

import { titreEtapePropFind } from './titre-etape-prop-find.js'
import { titreActiviteValideCheck } from '../utils/titre-activite-valide-check.js'
import { SubstanceFiscale, substancesFiscalesBySubstanceLegale } from 'camino-common/src/static/substancesFiscales.js'
import { Unites } from 'camino-common/src/static/unites.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'
import { FrequenceId, Frequences, getNumberOfMonths } from 'camino-common/src/static/frequence.js'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { ActiviteSection, ActiviteSectionElement, ActivitesTypes, ActivitesTypesId, isSubstancesFiscales } from 'camino-common/src/static/activitesTypes.js'

const substancesFiscalesFind = (substances: SubstanceLegaleId[]): SubstanceFiscale[] => substances.filter(s => !!s).flatMap(substanceId => substancesFiscalesBySubstanceLegale(substanceId))

const titreActiviteSectionElementsFormat = (elements: DeepReadonly<ActiviteSectionElement[]>, periodeId: number, date: CaminoDate) =>
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

export const titreActiviteSectionsBuild = (
  activiteTypeId: string,
  sections: DeepReadonly<ActiviteSection[]>,
  periodeId: number,
  date: CaminoDate,
  titreDemarches: ITitreDemarche[],
  titreTypeId: TitreTypeId
) => {
  return sections.reduce<DeepReadonly<ActiviteSection[]>>((newSections: DeepReadonly<ActiviteSection[]>, s) => {
    let elements: DeepReadonly<ActiviteSectionElement[]> = []

    if (!isSubstancesFiscales(s) && s.elements) {
      elements = titreActiviteSectionElementsFormat(s.elements, periodeId, date)
    } else if (['gra', 'grx'].includes(activiteTypeId) && s.id === 'substancesFiscales') {
      const substances = titreEtapePropFind('substances', toCaminoDate(date), titreDemarches, titreTypeId) as SubstanceLegaleId[] | null

      if (substances?.length) {
        const substancesFiscales = substancesFiscalesFind(substances)

        elements = substancesFiscales.map(sf => {
          const unite = Unites[sf.uniteId]
          const element: DeepReadonly<ActiviteSectionElement> = {
            id: sf.id,
            nom: `${sf.nom}`,
            type: 'number',
            description: `<b>${unite.symbole} (${unite.nom})</b> ${sf.description}`,
            uniteId: sf.uniteId,
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

const titreActiviteFind = (activiteTypeId: string, annee: number, periodeId: number, titreActivites?: ITitreActivite[] | null) =>
  !!titreActivites?.length && titreActivites.find(a => a.typeId === activiteTypeId && a.annee === annee && a.periodeId === periodeId)

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
  typeId: string,
  periodeId: number,
  activiteTypeSections: DeepReadonly<ActiviteSection[]>,
  annee: number,
  frequenceId: FrequenceId,
  aujourdhui: CaminoDate,
  titreId: string,
  titreDemarches: ITitreDemarche[],
  titreTypeId: TitreTypeId,
  titreActivites?: ITitreActivite[] | null
) => {
  // si l'activité existe déjà
  // ne la créée pas
  if (titreActiviteFind(typeId, annee, periodeId, titreActivites)) return null

  // la date de fin de l'activité est le premier jour du mois
  // du début de la période suivante, en fonction de la fréquence
  const date = toCaminoDate(new Date(annee, periodeId * getNumberOfMonths(frequenceId), 1))

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
    annee,
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
  annees: number[],
  aujourdhui: CaminoDate,
  titreId: string,
  titreTypeId: TitreTypeId,
  titreDemarches?: ITitreDemarche[] | null,
  titreActivites?: ITitreActivite[] | null
) => {
  // si le titre n'a pas de phases de démarches
  // aucune activité ne peut être créées
  if (!titreDemarches?.some(d => d.demarcheDateDebut)) return []

  const activiteType = ActivitesTypes[activiteTypeId]

  const periodes = Frequences[activiteType.frequenceId].values

  return annees.reduce(
    (titreActivitesNew: ITitreActivite[], annee) =>
      periodes.reduce((acc: ITitreActivite[], _, i) => {
        const activiteSections = activiteType.sections

        const titreActivite = titreActiviteBuild(activiteType.id, i + 1, activiteSections, annee, activiteType.frequenceId, aujourdhui, titreId, titreDemarches, titreTypeId, titreActivites)

        if (titreActivite) {
          acc.push(titreActivite)
        }

        return acc
      }, titreActivitesNew),
    []
  )
}
