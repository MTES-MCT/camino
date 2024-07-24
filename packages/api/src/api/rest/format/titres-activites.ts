import { IContenu, IContenuValeur, Index, ITitreActivite } from '../../../types'
import { isSubstanceFiscale, SubstancesFiscale } from 'camino-common/src/static/substancesFiscales'
import { UniteId, Unites } from 'camino-common/src/static/unites'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { getCommunesIndex } from '../../../database/queries/communes'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { getEntreprises } from '../entreprises.queries'
import { EntrepriseId } from 'camino-common/src/entreprise'

const titreActiviteContenuFormat = (contenu: IContenu, sections: DeepReadonly<Section[]>) =>
  sections.reduce((resSections: Index<IContenuValeur>, section) => {
    const r = section.elements!.reduce((resElements: Index<IContenuValeur>, element) => {
      let key = `${section.id}_${element.id}`

      if (section.id === 'substancesFiscales') {
        if (isSubstanceFiscale(element.id)) {
          const uniteId: UniteId = SubstancesFiscale[element.id].uniteId
          key += ` (${Unites[uniteId].nom})`
        }
      }
      const value = isNotNullNorUndefined(contenu[section.id]) ? contenu[section.id][element.id] : undefined

      if (value === undefined) {
        resElements[key] = ['number', 'integer'].includes(element.type) ? 0 : ''
      } else {
        resElements[key] = Array.isArray(value) ? (value as string[]).join(';') : value
      }

      return resElements
    }, {})

    return Object.assign(resSections, r)
  }, {})

export const titresActivitesFormatTable = async (pool: Pool, activites: ITitreActivite[]) => {
  const communesIndex = await getCommunesIndex(
    pool,
    activites.flatMap(({ titre }) => titre?.communes?.map(({ id }) => id) ?? [])
  )
  const entreprises = await getEntreprises(pool)
  const entreprisesIndex = entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

  return activites.map(activite => {
    const activiteType = ActivitesTypes[activite.typeId]
    const contenu = activite.contenu && activite.sections?.length ? titreActiviteContenuFormat(activite.contenu, activite.sections) : {}

    if (isNullOrUndefined(activite.titre)) {
      throw new Error(`le titre n’est pas chargé`)
    }

    return {
      id: activite.slug,
      titre_id: activite.titre.slug,
      titre_nom: activite.titre.nom,
      type: activiteType.nom,
      statut: ActivitesStatuts[activite.activiteStatutId].nom,
      titulaires: activite.titre.titulaireIds?.map(id => entreprisesIndex[id] ?? '').join(';'),
      communes: activite.titre.communes?.map(({ id }) => communesIndex[id]).join(';'),
      annee: activite.annee,
      periode: getPeriode(activiteType.frequenceId, activite.periodeId),
      periode_id: activite.periodeId,
      ...contenu,
    }
  })
}
