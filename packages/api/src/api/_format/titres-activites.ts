import { ITitreActivite, IContenu } from '../../types.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { Unites } from 'camino-common/src/static/unites.js'

// TODO 2023-09-19 à supprimer quand on arrêtera d’envoyer le contenu par email
const titreActiviteContenuFormat = (sections: DeepReadonly<Section[]>, contenu: IContenu) => {
  const section = sections.find(s => s.id === 'substancesFiscales')

  if (section?.elements?.length && contenu?.substancesFiscales) {
    const substancesFiscalesIds = Object.keys(contenu?.substancesFiscales)

    substancesFiscalesIds.forEach(id => {
      const element = section!.elements!.find(e => e.id === id)

      if (element && (element.type === 'integer' || element.type === 'number') && element.uniteId) {
        const ratio = Unites[element.uniteId].referenceUniteRatio
        if (ratio) {
          contenu!.substancesFiscales[id] = (contenu!.substancesFiscales[id] as number) / ratio
        }
      }
    })
  }

  return contenu
}

export const titreActiviteFormat = (ta: ITitreActivite) => {
  if (ta.contenu) {
    ta.contenu = titreActiviteContenuFormat(ta.sections, ta.contenu)
  }

  return ta
}
