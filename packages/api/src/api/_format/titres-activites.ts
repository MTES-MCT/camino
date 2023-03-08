import { ITitreActivite, ISection, IContenu } from '../../types.js'

import { titreSectionsFormat } from './titres-sections.js'

import { titreActiviteCompleteCheck } from '../../business/validations/titre-activite-complete-check.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'

export const titreActiviteContenuFormat = (sections: ISection[], contenu: IContenu, operation: 'read' | 'write') => {
  const section = sections.find(s => s.id === 'substancesFiscales')

  if (section?.elements?.length && contenu?.substancesFiscales) {
    const substancesFiscalesIds = Object.keys(contenu?.substancesFiscales)

    substancesFiscalesIds.forEach(id => {
      const element = section!.elements!.find(e => e.id === id)
      const ratio = element?.referenceUniteRatio

      if (ratio) {
        contenu!.substancesFiscales[id] = operation === 'read' ? (contenu!.substancesFiscales[id] as number) / ratio : (contenu!.substancesFiscales[id] as number) * ratio
      }
    })
  }

  return contenu
}

export const titreActiviteFormat = (ta: ITitreActivite) => {
  // si les sections contiennent des élements sur cette activité
  if (ta.sections?.length) {
    ta.sections = titreSectionsFormat(ta.sections)
  }

  if (ta.contenu) {
    ta.contenu = titreActiviteContenuFormat(ta.sections, ta.contenu, 'read')
  }

  if (ta.activiteStatutId === ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION && ta.modification) {
    ta.deposable = titreActiviteCompleteCheck(ta.sections, ta.contenu, ta.documents, ta.type!.documentsTypes)
  }

  return ta
}
