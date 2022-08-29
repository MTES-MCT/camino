import { ITitreActivite, ISection, IContenu } from '../../types'

import { titreSectionsFormat } from './titres-sections'

import { titreActiviteCompleteCheck } from '../../business/validations/titre-activite-complete-check'

export const titreActiviteContenuFormat = (
  sections: ISection[],
  contenu: IContenu,
  operation: 'read' | 'write'
) => {
  const section = sections.find(s => s.id === 'substancesFiscales')

  if (section?.elements?.length && contenu?.substancesFiscales) {
    const substancesFiscalesIds = Object.keys(contenu?.substancesFiscales)

    substancesFiscalesIds.forEach(id => {
      const element = section!.elements!.find(e => e.id === id)
      const ratio = element?.referenceUniteRatio

      if (ratio) {
        contenu!.substancesFiscales[id] =
          operation === 'read'
            ? (contenu!.substancesFiscales[id] as number) / ratio
            : (contenu!.substancesFiscales[id] as number) * ratio
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

  if (ta.statutId === 'enc' && ta.modification) {
    ta.deposable = titreActiviteCompleteCheck(
      ta.sections,
      ta.contenu,
      ta.documents,
      ta.type!.documentsTypes
    )
  }

  return ta
}
