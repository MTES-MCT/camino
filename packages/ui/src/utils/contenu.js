import { dateFormat } from './index'
import { numberFormat } from 'camino-common/src/number'
import { getElementValeurs } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'

const contenuBuild = (sections, elementContenu) =>
  sections.reduce((contenu, section) => {
    if (section) {
      contenu[section.id] = (elementContenu && elementContenu[section.id]) || {}
    }

    return contenu
  }, {})

const elementContenuBuild = (sections, contenu) =>
  sections.reduce((elementContenu, section) => {
    if (Object.keys(contenu[section.id]).length) {
      if (!elementContenu) {
        elementContenu = {}
      }
      elementContenu[section.id] = contenu[section.id]
    }

    return elementContenu
  }, null)

const elementsCompleteCheck = (elements, sectionContenu, complete) =>
  elements.reduce((sectionComplete, e) => {
    if (!sectionComplete || !sectionContenu || e.optionnel || ['radio', 'checkbox'].includes(e.type)) return sectionComplete

    let elementComplete = false

    if (e.type === 'checkboxes') {
      if (sectionContenu[e.id].length) {
        elementComplete = true
      }
    } else {
      elementComplete = sectionContenu[e.id] !== undefined && sectionContenu[e.id] !== null && sectionContenu[e.id] !== ''
    }

    return elementComplete
  }, complete)

const contenuCompleteCheck = (sections, contenu) =>
  sections.reduce((complete, s) => {
    if (!complete) return false

    return elementsCompleteCheck(s.elements, contenu[s.id], complete)
  }, true)

/**
 * @deprecated voir la nouvelle méthode dans common/src/titres.ts
 */
const valeurFind = (value, contenu) => {
  const { id, type, options } = value
  if (contenu[id] === undefined || contenu[id] === '') {
    return '–'
  }

  if (['number', 'integer'].includes(type)) {
    return numberFormat(contenu[id])
  }

  if (type === 'checkboxes') {
    return contenu[id]
      .map(id => {
        const valeur = options.find(e => e.id === id)
        return valeur ? valeur.nom : undefined
      })
      .filter(valeur => !!valeur)
      .join(', ')
  }

  if (type === 'select') {
    return getElementValeurs(value).find(v => v.id === contenu[id])?.nom ?? ''
  }

  if (type === 'date') {
    return dateFormat(contenu[id])
  }

  if (contenu[id] === true) return 'Oui'
  else if (contenu[id] === false) return 'Non'

  return contenu[id]
}

const hasValeurCheck = (elementId, contenu) => {
  const valeur = contenu && contenu[elementId]

  if ((!Array.isArray(valeur) && (valeur || valeur === 0 || valeur === false)) || (Array.isArray(valeur) && valeur.length)) return true

  return false
}

export { contenuBuild, elementContenuBuild, contenuCompleteCheck, elementsCompleteCheck, valeurFind, hasValeurCheck }
