import {
  IContenu,
  IContenuValeur,
  Index,
  ISection,
  ITitreActivite
} from '../../../types'
import {
  isSubstanceFiscale,
  SubstancesFiscale
} from 'camino-common/src/static/substancesFiscales'
import { UniteId, Unites } from 'camino-common/src/static/unites'
import { getPeriode } from 'camino-common/src/static/frequence'

const titreActiviteContenuFormat = (contenu: IContenu, sections: ISection[]) =>
  sections.reduce((resSections: Index<IContenuValeur>, section) => {
    const r = section.elements!.reduce(
      (resElements: Index<IContenuValeur>, element) => {
        let key = `${section.id}_${element.id}`

        if (section.id === 'substancesFiscales') {
          if (isSubstanceFiscale(element.id)) {
            const uniteId: UniteId = SubstancesFiscale[element.id].uniteId
            key += ` (${Unites[uniteId].nom})`
          }
        }
        const value = contenu[section.id]
          ? contenu[section.id][element.id]
          : undefined

        if (value === undefined) {
          resElements[key] = ['number', 'integer'].includes(element.type)
            ? 0
            : ''
        } else {
          resElements[key] = Array.isArray(value)
            ? (value as string[]).join(';')
            : value
        }

        return resElements
      },
      {}
    )

    return Object.assign(resSections, r)
  }, {})

const titresActivitesFormatTable = (activites: ITitreActivite[]) =>
  activites.map(activite => {
    const contenu =
      activite.contenu && activite.sections?.length
        ? titreActiviteContenuFormat(activite.contenu, activite.sections)
        : {}

    return {
      id: activite.slug,
      titre_id: activite.titre!.slug,
      type: activite.type!.nom,
      statut: activite.statut!.nom,
      titulaires: activite.titre?.titulaires?.map(({ nom }) => nom).join(';'),
      communes: activite.titre?.communes?.map(({ nom }) => nom).join(';'),
      annee: activite.annee,
      periode: getPeriode(activite.type?.frequenceId, activite.periodeId),
      periode_id: activite.periodeId,
      ...contenu
    }
  })

export { titresActivitesFormatTable }
